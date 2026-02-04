import { create } from "zustand";
import { persist } from "zustand/middleware";

type FontSize = "small" | "medium" | "large";

interface SettingsState {
  rowsPerPage: number;
  fontSize: FontSize;
  setRowsPerPage: (count: number) => void;
  setFontSize: (size: FontSize) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      rowsPerPage: 10,
      fontSize: "medium",
      setRowsPerPage: (count) => set({ rowsPerPage: count }),
      setFontSize: (size) => set({ fontSize: size }),
    }),
    {
      name: "settings-storage",
    }
  )
);
