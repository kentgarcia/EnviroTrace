import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TestScheduleFilters {
  year: number;
  quarter?: number;
}

export interface EmissionTestFilters {
  scheduleId?: string;
  year?: number;
  quarter?: number;
  vehicleId?: string;
  searchQuery?: string;
  result?: boolean | null;
}

interface QuarterlyTestState {
  // Filters
  scheduleFilters: TestScheduleFilters;
  testFilters: EmissionTestFilters;
  selectedScheduleId: string | null;
  
  // Offline data
  pendingSchedules: any[];
  pendingScheduleUpdates: Record<string, any>;
  pendingScheduleDeletes: string[];
  pendingTests: any[];
  pendingTestUpdates: Record<string, any>;
  pendingTestDeletes: string[];
  
  // UI state
  showOfflineData: boolean;

  // Actions
  actions: {
    // Schedule filter actions
    setScheduleFilters: (filters: Partial<TestScheduleFilters>) => void;
    resetScheduleFilters: () => void;
    
    // Test filter actions
    setTestFilters: (filters: Partial<EmissionTestFilters>) => void;
    resetTestFilters: () => void;
    
    // Selected schedule actions
    setSelectedScheduleId: (scheduleId: string | null) => void;
    
    // Pending schedule actions
    addPendingSchedule: (schedule: any) => void;
    updatePendingSchedule: (id: string, schedule: any) => void;
    deletePendingSchedule: (id: string) => void;
    
    // Pending test actions
    addPendingTest: (test: any) => void;
    updatePendingTest: (id: string, test: any) => void;
    deletePendingTest: (id: string) => void;
    
    // Offline mode
    setShowOfflineData: (show: boolean) => void;
    
    // Clear all pending changes
    clearPendingChanges: () => void;
  }
}

// Get current year
const getCurrentYear = () => new Date().getFullYear();

export const useQuarterlyTestStore = create<QuarterlyTestState>()(
  persist(
    (set) => ({
      // Initial state
      scheduleFilters: {
        year: getCurrentYear(),
      },
      testFilters: {},
      selectedScheduleId: null,
      pendingSchedules: [],
      pendingScheduleUpdates: {},
      pendingScheduleDeletes: [],
      pendingTests: [],
      pendingTestUpdates: {},
      pendingTestDeletes: [],
      showOfflineData: false,

      // Actions
      actions: {
        // Schedule filter actions
        setScheduleFilters: (filters) => set((state) => ({
          scheduleFilters: { ...state.scheduleFilters, ...filters }
        })),
        resetScheduleFilters: () => set(() => ({
          scheduleFilters: { year: getCurrentYear() }
        })),
        
        // Test filter actions
        setTestFilters: (filters) => set((state) => ({
          testFilters: { ...state.testFilters, ...filters }
        })),
        resetTestFilters: () => set(() => ({
          testFilters: {}
        })),
        
        // Selected schedule actions
        setSelectedScheduleId: (scheduleId) => set(() => ({
          selectedScheduleId: scheduleId
        })),
        
        // Pending schedule actions
        addPendingSchedule: (schedule) => set((state) => ({
          pendingSchedules: [...state.pendingSchedules, { ...schedule, id: `pending-${Date.now()}` }]
        })),
        updatePendingSchedule: (id, schedule) => set((state) => ({
          pendingScheduleUpdates: { ...state.pendingScheduleUpdates, [id]: schedule }
        })),
        deletePendingSchedule: (id) => set((state) => ({
          pendingScheduleDeletes: [...state.pendingScheduleDeletes, id]
        })),
        
        // Pending test actions
        addPendingTest: (test) => set((state) => ({
          pendingTests: [...state.pendingTests, { ...test, id: `pending-${Date.now()}` }]
        })),
        updatePendingTest: (id, test) => set((state) => ({
          pendingTestUpdates: { ...state.pendingTestUpdates, [id]: test }
        })),
        deletePendingTest: (id) => set((state) => ({
          pendingTestDeletes: [...state.pendingTestDeletes, id]
        })),
        
        // Offline mode
        setShowOfflineData: (show) => set(() => ({
          showOfflineData: show
        })),
        
        // Clear all pending changes
        clearPendingChanges: () => set(() => ({
          pendingSchedules: [],
          pendingScheduleUpdates: {},
          pendingScheduleDeletes: [],
          pendingTests: [],
          pendingTestUpdates: {},
          pendingTestDeletes: []
        })),
      }
    }),
    {
      name: 'quarterly-test-storage',
    }
  )
);