import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EmissionState {
  selectedYear: number;
  selectedQuarter?: number;
  showOfflineData: boolean;
  actions: {
    setSelectedYear: (year: number) => void;
    setSelectedQuarter: (quarter?: number) => void;
    setShowOfflineData: (show: boolean) => void;
  };
}

export const useEmissionStore = create<EmissionState>()(
  persist(
    (set) => ({
      selectedYear: new Date().getFullYear(),
      selectedQuarter: undefined,
      showOfflineData: false,
      actions: {
        setSelectedYear: (year: number) => set({ selectedYear: year }),
        setSelectedQuarter: (quarter?: number) =>
          set({ selectedQuarter: quarter }),
        setShowOfflineData: (show: boolean) => set({ showOfflineData: show }),
      },
    }),
    {
      name: "emission-dashboard-storage",
    }
  )
);
