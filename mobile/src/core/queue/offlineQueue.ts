import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/api-client";
import { checkNetworkConnectivity } from "../utils/network";

export type QueueRole = "government_emission" | "urban_greening";
export type QueueMethod = "POST" | "PUT";

export type QueueResult<T> =
  | (T & { queued?: false; queueId?: never })
  | { queued: true; queueId: string };

export interface QueueItem {
  id: string;
  role: QueueRole;
  action: string;
  method: QueueMethod;
  endpoint: string;
  payload: unknown;
  createdAt: string;
  updatedAt: string;
  status: "pending" | "failed";
  error?: string;
}

const STORAGE_KEY = "offline_queue_v1";

let queueCache: QueueItem[] | null = null;

const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const loadQueue = async (): Promise<QueueItem[]> => {
  if (queueCache) return queueCache;
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    queueCache = [];
    return queueCache;
  }
  try {
    const parsed = JSON.parse(raw) as QueueItem[];
    queueCache = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse offline queue:", error);
    queueCache = [];
  }
  return queueCache;
};

const saveQueue = async (queue: QueueItem[]) => {
  queueCache = queue;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
};

export const listQueue = async (role?: QueueRole): Promise<QueueItem[]> => {
  const queue = await loadQueue();
  if (!role) return queue;
  return queue.filter((item) => item.role === role);
};

export const enqueueItem = async (item: Omit<QueueItem, "id" | "createdAt" | "updatedAt" | "status">) => {
  const queue = await loadQueue();
  const now = new Date().toISOString();
  const queued: QueueItem = {
    ...item,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    status: "pending",
  };
  queue.push(queued);
  await saveQueue(queue);
  return queued;
};

export const removeQueueItem = async (id: string) => {
  const queue = await loadQueue();
  const next = queue.filter((item) => item.id !== id);
  await saveQueue(next);
  return next;
};

export const updateQueueItem = async (id: string, patch: Partial<QueueItem>) => {
  const queue = await loadQueue();
  const next = queue.map((item) =>
    item.id === id
      ? { ...item, ...patch, updatedAt: new Date().toISOString() }
      : item
  );
  await saveQueue(next);
  return next.find((item) => item.id === id) || null;
};

const isNetworkError = (error: any) => {
  return !error?.response && (error?.code || error?.message);
};

export const queueableRequest = async <T>(options: {
  role: QueueRole;
  action: string;
  method: QueueMethod;
  endpoint: string;
  payload: unknown;
  send: () => Promise<T>;
}): Promise<QueueResult<T>> => {
  const network = await checkNetworkConnectivity();
  if (!network.isConnected) {
    const queued = await enqueueItem({
      role: options.role,
      action: options.action,
      method: options.method,
      endpoint: options.endpoint,
      payload: options.payload,
    });
    return { queued: true, queueId: queued.id };
  }

  try {
    const result = await options.send();
    return result as QueueResult<T>;
  } catch (error: any) {
    if (isNetworkError(error)) {
      const queued = await enqueueItem({
        role: options.role,
        action: options.action,
        method: options.method,
        endpoint: options.endpoint,
        payload: options.payload,
      });
      return { queued: true, queueId: queued.id };
    }
    throw error;
  }
};

export const sendQueueItem = async (item: QueueItem) => {
  try {
    const response = await apiClient.request({
      method: item.method,
      url: item.endpoint,
      data: item.payload,
    });
    await removeQueueItem(item.id);
    return { success: true, data: response.data };
  } catch (error: any) {
    await updateQueueItem(item.id, {
      status: "failed",
      error: error?.message || "Failed to send queued item",
    });
    return { success: false, error };
  }
};

export const sendQueueForRole = async (role: QueueRole) => {
  const items = await listQueue(role);
  const results: Array<{ id: string; success: boolean }> = [];

  for (const item of items) {
    const result = await sendQueueItem(item);
    results.push({ id: item.id, success: result.success });
  }

  return results;
};
