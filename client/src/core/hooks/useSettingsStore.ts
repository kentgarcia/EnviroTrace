import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  rowsPerPage: number;
  setRowsPerPage: (count: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      rowsPerPage: 10,
      setRowsPerPage: (count) => set({ rowsPerPage: count }),
    }),
    {
      name: "settings-storage",
    }
  )
);
