/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import { Store } from "@tauri-apps/plugin-store";

export function useTauriStore(storeFile = ".dashboard-data.dat") {
  const get = useCallback(
    async (key: string) => {
      const store = await Store.load(storeFile);
      return await store.get(key);
    },
    [storeFile]
  );

  const set = useCallback(
    async (key: string, value: any) => {
      const store = await Store.load(storeFile);
      await store.set(key, value);
    },
    [storeFile]
  );

  const save = useCallback(async () => {
    const store = await Store.load(storeFile);
    await store.save();
  }, [storeFile]);

  return { get, set, save };
}
