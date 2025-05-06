/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface VehicleFilters {
  searchQuery: string;
  statusFilter: "all" | "passed" | "failed" | "untested";
  vehicleTypeFilter: string;
  engineTypeFilter: string;
  wheelsFilter: string;
  officeFilter: string;
}

interface VehicleState {
  // Filters
  filters: VehicleFilters;
  pendingVehicles: any[];
  pendingUpdates: Record<string, any>;
  pendingDeletes: string[];
  showOfflineData: boolean;

  // Actions
  actions: {
    setFilter: <K extends keyof VehicleFilters>(
      key: K,
      value: VehicleFilters[K]
    ) => void;
    resetFilters: () => void;
    setPendingVehicles: (vehicles: any[]) => void;
    addPendingVehicle: (vehicle: any) => void;
    addPendingUpdate: (id: string, vehicle: any) => void;
    addPendingDelete: (id: string) => void;
    removePendingVehicle: (id: string) => void;
    removePendingUpdate: (id: string) => void;
    removePendingDelete: (id: string) => void;
    setShowOfflineData: (show: boolean) => void;
    clearPending: () => void;
  };
}

export const useVehicleStore = create<VehicleState>()(
  persist(
    (set, get) => ({
      // Initial state
      filters: {
        searchQuery: "",
        statusFilter: "all",
        vehicleTypeFilter: "",
        engineTypeFilter: "",
        wheelsFilter: "",
        officeFilter: "",
      },
      pendingVehicles: [],
      pendingUpdates: {},
      pendingDeletes: [],
      showOfflineData: false,

      // Actions
      actions: {
        setFilter: (key, value) =>
          set((state) => ({
            filters: {
              ...state.filters,
              [key]: value,
            },
          })),
        resetFilters: () =>
          set({
            filters: {
              searchQuery: "",
              statusFilter: "all",
              vehicleTypeFilter: "",
              engineTypeFilter: "",
              wheelsFilter: "",
              officeFilter: "",
            },
          }),
        setPendingVehicles: (vehicles) => set({ pendingVehicles: vehicles }),
        addPendingVehicle: (vehicle) =>
          set((state) => ({
            pendingVehicles: [
              ...state.pendingVehicles,
              { ...vehicle, id: `pending-${Date.now()}` },
            ],
          })),
        addPendingUpdate: (id, vehicle) =>
          set((state) => ({
            pendingUpdates: { ...state.pendingUpdates, [id]: vehicle },
          })),
        addPendingDelete: (id) =>
          set((state) => ({
            pendingDeletes: [...state.pendingDeletes, id],
          })),
        removePendingVehicle: (id) =>
          set((state) => ({
            pendingVehicles: state.pendingVehicles.filter((v) => v.id !== id),
          })),
        removePendingUpdate: (id) =>
          set((state) => {
            const { [id]: _, ...restUpdates } = state.pendingUpdates;
            return { pendingUpdates: restUpdates };
          }),
        removePendingDelete: (id) =>
          set((state) => ({
            pendingDeletes: state.pendingDeletes.filter(
              (deleteId) => deleteId !== id
            ),
          })),
        setShowOfflineData: (show) => set({ showOfflineData: show }),
        clearPending: () =>
          set({
            pendingVehicles: [],
            pendingUpdates: {},
            pendingDeletes: [],
          }),
      },
    }),
    {
      name: "vehicle-dashboard-storage",
    }
  )
);
