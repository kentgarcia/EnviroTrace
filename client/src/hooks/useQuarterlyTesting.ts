import { useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { useNetworkStatus } from "./useNetworkStatus";
import { useQuarterlyTestStore } from "./useQuarterlyTestStore";
import {
  fetchTestSchedules,
  fetchEmissionTests,
  createTestSchedule,
  updateTestSchedule,
  deleteTestSchedule,
  createEmissionTest,
  updateEmissionTest,
  deleteEmissionTest,
  fetchVehicleById,
  fetchVehicleSummaries,
} from "@/lib/emission-api";

// Type definitions
export interface TestSchedule {
  id: string;
  year: number;
  quarter: number;
  assignedPersonnel: string;
  location: string;
  conductedOn: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestScheduleInput {
  year: number;
  quarter: number;
  assignedPersonnel: string;
  location: string;
  conductedOn: string;
}

export interface EmissionTest {
  id: string;
  vehicleId: string;
  testDate: string;
  quarter: number;
  year: number;
  result: boolean;
  createdAt?: string;
  updatedAt?: string;
  vehicle?: {
    id: string;
    plateNumber: string;
    driverName: string;
    officeName: string;
    vehicleType?: string;
    engineType?: string;
  };
}

export interface EmissionTestInput {
  vehicleId: string;
  testDate: string;
  quarter: number;
  year: number;
  result: boolean;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  driverName: string;
  contactNumber?: string;
  officeName: string;
  vehicleType: string;
  engineType: string;
  wheels: number;
}

export function useQuarterlyTesting() {
  const queryClient = useQueryClient();
  const { isOffline } = useNetworkStatus();
  const {
    scheduleFilters,
    testFilters,
    selectedScheduleId,
    pendingSchedules,
    pendingScheduleUpdates,
    pendingScheduleDeletes,
    pendingTests,
    pendingTestUpdates,
    pendingTestDeletes,
    actions,
  } = useQuarterlyTestStore();

  // Cache time-to-live longer for offline support
  const TTL = 1000 * 60 * 60; // 1 hour

  // Set offline mode when network changes
  useEffect(() => {
    actions.setShowOfflineData(isOffline);
  }, [isOffline, actions]);

  // Fetch test schedules based on filters
  const {
    data: schedules = [],
    isLoading: isLoadingSchedules,
    error: scheduleError,
    refetch: refetchSchedules,
  } = useQuery({
    queryKey: ["testSchedules", scheduleFilters],
    queryFn: () =>
      fetchTestSchedules(scheduleFilters.year, scheduleFilters.quarter),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: TTL,
    retry: 2,
    enabled: !isOffline, // Only fetch online
  });

  // When a schedule is selected, fetch related tests
  const {
    data: emissionTests = [],
    isLoading: isLoadingTests,
    error: testsError,
    refetch: refetchTests,
  } = useQuery({
    queryKey: ["emissionTests", testFilters],
    queryFn: () => fetchEmissionTests(testFilters),
    staleTime: 1000 * 60 * 5,
    gcTime: TTL,
    retry: 2,
    enabled: !isOffline && !!testFilters.year && !!testFilters.quarter,
  });

  // Fetch all vehicles for test creation
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => fetchVehicleSummaries(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: TTL,
    retry: 2,
    enabled: !isOffline,
  });

  // Mutations for test schedules
  const createScheduleMutation = useMutation({
    mutationFn: (newSchedule: TestScheduleInput) =>
      createTestSchedule(newSchedule),
    onSuccess: () => {
      toast.success("Test schedule created successfully");
      queryClient.invalidateQueries({ queryKey: ["testSchedules"] });
    },
    onError: (error) => {
      console.error("Failed to create test schedule:", error);
      toast.error("Failed to create test schedule");
      throw error;
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: ({
      id,
      schedule,
    }: {
      id: string;
      schedule: TestScheduleInput;
    }) => updateTestSchedule(id, schedule),
    onSuccess: () => {
      toast.success("Test schedule updated successfully");
      queryClient.invalidateQueries({ queryKey: ["testSchedules"] });
    },
    onError: (error) => {
      console.error("Failed to update test schedule:", error);
      toast.error("Failed to update test schedule");
      throw error;
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: (id: string) => deleteTestSchedule(id),
    onSuccess: () => {
      toast.success("Test schedule deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["testSchedules"] });
    },
    onError: (error) => {
      console.error("Failed to delete test schedule:", error);
      toast.error("Failed to delete test schedule");
      throw error;
    },
  });

  // Mutations for emission tests
  const createTestMutation = useMutation({
    mutationFn: (newTest: EmissionTestInput) => createEmissionTest(newTest),
    onSuccess: () => {
      toast.success("Vehicle test added successfully");
      queryClient.invalidateQueries({ queryKey: ["emissionTests"] });
    },
    onError: (error) => {
      console.error("Failed to add vehicle test:", error);
      toast.error("Failed to add vehicle test");
      throw error;
    },
  });

  const updateTestMutation = useMutation({
    mutationFn: ({ id, test }: { id: string; test: EmissionTestInput }) =>
      updateEmissionTest(id, test),
    onSuccess: () => {
      toast.success("Vehicle test updated successfully");
      queryClient.invalidateQueries({ queryKey: ["emissionTests"] });
    },
    onError: (error) => {
      console.error("Failed to update vehicle test:", error);
      toast.error("Failed to update vehicle test");
      throw error;
    },
  });

  const deleteTestMutation = useMutation({
    mutationFn: (id: string) => deleteEmissionTest(id),
    onSuccess: () => {
      toast.success("Vehicle test deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["emissionTests"] });
    },
    onError: (error) => {
      console.error("Failed to delete vehicle test:", error);
      toast.error("Failed to delete vehicle test");
      throw error;
    },
  });

  // Fetch vehicle by ID (for test creation)
  const fetchVehicle = useMutation({
    mutationFn: (id: string) => fetchVehicleById(id),
    onError: (error) => {
      console.error("Failed to fetch vehicle details:", error);
      toast.error("Failed to fetch vehicle details");
    },
  });

  // Syncing logic for pending changes when online
  useEffect(() => {
    const syncPendingChanges = async () => {
      if (isOffline) return;

      // Sync pending schedule deletes
      if (pendingScheduleDeletes.length > 0) {
        for (const id of pendingScheduleDeletes) {
          try {
            await deleteScheduleMutation.mutateAsync(id);
            actions.deletePendingSchedule(id);
            toast.success("Synced pending schedule deletion");
          } catch (error) {
            console.error(
              `Failed to sync schedule deletion for ID ${id}:`,
              error
            );
          }
        }
      }

      // Sync pending schedule creates
      if (pendingSchedules.length > 0) {
        for (const schedule of pendingSchedules) {
          try {
            const { id, ...scheduleData } = schedule;
            await createScheduleMutation.mutateAsync(scheduleData);
            actions.updatePendingSchedule(id, null);
            toast.success(
              `Synced new schedule: Q${scheduleData.quarter}, ${scheduleData.year}`
            );
          } catch (error) {
            console.error("Failed to sync new schedule:", error);
          }
        }
      }

      // Sync pending schedule updates
      const pendingScheduleUpdateIds = Object.keys(pendingScheduleUpdates);
      if (pendingScheduleUpdateIds.length > 0) {
        for (const id of pendingScheduleUpdateIds) {
          try {
            await updateScheduleMutation.mutateAsync({
              id,
              schedule: pendingScheduleUpdates[id],
            });
            actions.updatePendingSchedule(id, null);
            toast.success(
              `Synced schedule update: Q${pendingScheduleUpdates[id].quarter}, ${pendingScheduleUpdates[id].year}`
            );
          } catch (error) {
            console.error(
              `Failed to sync schedule update for ID ${id}:`,
              error
            );
          }
        }
      }

      // Similar logic for test deletes, creates, and updates
      if (pendingTestDeletes.length > 0) {
        for (const id of pendingTestDeletes) {
          try {
            await deleteTestMutation.mutateAsync(id);
            actions.deletePendingTest(id);
            toast.success("Synced pending test deletion");
          } catch (error) {
            console.error(`Failed to sync test deletion for ID ${id}:`, error);
          }
        }
      }

      if (pendingTests.length > 0) {
        for (const test of pendingTests) {
          try {
            const { id, ...testData } = test;
            await createTestMutation.mutateAsync(testData);
            actions.updatePendingTest(id, null);
            toast.success("Synced new vehicle test");
          } catch (error) {
            console.error("Failed to sync new vehicle test:", error);
          }
        }
      }

      const pendingTestUpdateIds = Object.keys(pendingTestUpdates);
      if (pendingTestUpdateIds.length > 0) {
        for (const id of pendingTestUpdateIds) {
          try {
            await updateTestMutation.mutateAsync({
              id,
              test: pendingTestUpdates[id],
            });
            actions.updatePendingTest(id, null);
            toast.success("Synced vehicle test update");
          } catch (error) {
            console.error(`Failed to sync test update for ID ${id}:`, error);
          }
        }
      }
    };

    const hasPendingChanges =
      pendingSchedules.length > 0 ||
      Object.keys(pendingScheduleUpdates).length > 0 ||
      pendingScheduleDeletes.length > 0 ||
      pendingTests.length > 0 ||
      Object.keys(pendingTestUpdates).length > 0 ||
      pendingTestDeletes.length > 0;

    if (!isOffline && hasPendingChanges) {
      syncPendingChanges();
    }
  }, [
    isOffline,
    pendingSchedules,
    pendingScheduleUpdates,
    pendingScheduleDeletes,
    pendingTests,
    pendingTestUpdates,
    pendingTestDeletes,
    actions,
    createScheduleMutation,
    updateScheduleMutation,
    deleteScheduleMutation,
    createTestMutation,
    updateTestMutation,
    deleteTestMutation,
  ]);

  // Combine server data with pending changes for schedules
  const allSchedules = useMemo(() => {
    const mergedSchedules = [...schedules];

    // Add pending schedules
    if (pendingSchedules.length > 0) {
      mergedSchedules.push(...pendingSchedules);
    }

    // Apply pending updates
    const updatedList = mergedSchedules.map((schedule) => {
      if (pendingScheduleUpdates[schedule.id]) {
        return { ...schedule, ...pendingScheduleUpdates[schedule.id] };
      }
      return schedule;
    });

    // Filter out deleted schedules
    if (pendingScheduleDeletes.length > 0) {
      return updatedList.filter((s) => !pendingScheduleDeletes.includes(s.id));
    }

    return updatedList;
  }, [
    schedules,
    pendingSchedules,
    pendingScheduleUpdates,
    pendingScheduleDeletes,
  ]);

  // Combine server data with pending changes for tests
  const allTests = useMemo(() => {
    const mergedTests = [...emissionTests];

    // Add pending tests
    if (pendingTests.length > 0) {
      mergedTests.push(...pendingTests);
    }

    // Apply pending updates
    const updatedList = mergedTests.map((test) => {
      if (pendingTestUpdates[test.id]) {
        return { ...test, ...pendingTestUpdates[test.id] };
      }
      return test;
    });

    // Filter out deleted tests
    if (pendingTestDeletes.length > 0) {
      return updatedList.filter((t) => !pendingTestDeletes.includes(t.id));
    }

    return updatedList;
  }, [emissionTests, pendingTests, pendingTestUpdates, pendingTestDeletes]);

  // API wrapper functions with offline support
  const addSchedule = async (scheduleData: TestScheduleInput) => {
    if (isOffline) {
      actions.addPendingSchedule(scheduleData);
      toast.success("Schedule saved for syncing when online");
      return true;
    }

    try {
      await createScheduleMutation.mutateAsync(scheduleData);
      return true;
    } catch (error) {
      return false;
    }
  };

  const editSchedule = async (id: string, scheduleData: TestScheduleInput) => {
    if (isOffline) {
      actions.updatePendingSchedule(id, scheduleData);
      toast.success("Schedule changes saved for syncing when online");
      return true;
    }

    try {
      await updateScheduleMutation.mutateAsync({ id, schedule: scheduleData });
      return true;
    } catch (error) {
      return false;
    }
  };

  const removeSchedule = async (id: string) => {
    if (isOffline) {
      // Is it a pending schedule?
      if (id.startsWith("pending-")) {
        const pendingIdx = pendingSchedules.findIndex((s) => s.id === id);
        if (pendingIdx !== -1) {
          // Remove from pending creates
          const newPendingSchedules = [...pendingSchedules];
          newPendingSchedules.splice(pendingIdx, 1);
          actions.deletePendingSchedule(id);
          toast.success("Pending schedule removed");
          return true;
        }
      }

      // Otherwise mark for deletion when online
      actions.deletePendingSchedule(id);
      toast.success("Schedule marked for deletion when online");
      return true;
    }

    try {
      await deleteScheduleMutation.mutateAsync(id);
      return true;
    } catch (error) {
      return false;
    }
  };

  const addTest = async (testData: EmissionTestInput) => {
    if (isOffline) {
      actions.addPendingTest(testData);
      toast.success("Test saved for syncing when online");
      return true;
    }

    try {
      await createTestMutation.mutateAsync(testData);
      return true;
    } catch (error) {
      return false;
    }
  };

  const editTest = async (id: string, testData: EmissionTestInput) => {
    if (isOffline) {
      actions.updatePendingTest(id, testData);
      toast.success("Test changes saved for syncing when online");
      return true;
    }

    try {
      await updateTestMutation.mutateAsync({ id, test: testData });
      return true;
    } catch (error) {
      return false;
    }
  };

  const removeTest = async (id: string) => {
    if (isOffline) {
      // Is it a pending test?
      if (id.startsWith("pending-")) {
        const pendingIdx = pendingTests.findIndex((t) => t.id === id);
        if (pendingIdx !== -1) {
          // Remove from pending creates
          const newPendingTests = [...pendingTests];
          newPendingTests.splice(pendingIdx, 1);
          actions.deletePendingTest(id);
          toast.success("Pending test removed");
          return true;
        }
      }

      // Otherwise mark for deletion when online
      actions.deletePendingTest(id);
      toast.success("Test marked for deletion when online");
      return true;
    }

    try {
      await deleteTestMutation.mutateAsync(id);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Fetch vehicle by plate number or ID
  const getVehicleByPlateOrId = async (identifier: string) => {
    if (isOffline) {
      const matchingVehicle = vehicles.find(
        (v) => v.id === identifier || v.plateNumber === identifier
      );
      if (matchingVehicle) {
        return matchingVehicle;
      }
      return null;
    }

    try {
      // First try assuming it's an ID
      let vehicle = await fetchVehicle.mutateAsync(identifier);

      // If not found by ID, search by plate number in our cached vehicles
      if (!vehicle) {
        const matchByPlate = vehicles.find((v) => v.plateNumber === identifier);
        if (matchByPlate) {
          vehicle = await fetchVehicle.mutateAsync(matchByPlate.id);
        }
      }

      return vehicle || null;
    } catch (error) {
      return null;
    }
  };

  // Select a schedule and load its tests
  const selectSchedule = (schedule: TestSchedule | null) => {
    if (schedule) {
      actions.setSelectedScheduleId(schedule.id);
      actions.setTestFilters({
        year: schedule.year,
        quarter: schedule.quarter,
      });
    } else {
      actions.setSelectedScheduleId(null);
      actions.resetTestFilters();
    }
  };

  // Get selected schedule
  const selectedSchedule = useMemo(() => {
    return allSchedules.find((s) => s.id === selectedScheduleId) || null;
  }, [allSchedules, selectedScheduleId]);

  // Get available years
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  }, []);

  return {
    // State
    schedules: allSchedules,
    tests: allTests,
    selectedSchedule,
    vehicles,
    scheduleFilters,
    testFilters,
    isOffline: isOffline,
    isLoading: isLoadingSchedules || isLoadingTests || isLoadingVehicles,

    // Errors
    scheduleError,
    testsError,

    // Filter actions
    setScheduleFilters: actions.setScheduleFilters,
    resetScheduleFilters: actions.resetScheduleFilters,
    setTestFilters: actions.setTestFilters,
    resetTestFilters: actions.resetTestFilters,

    // CRUD actions
    addSchedule,
    editSchedule,
    removeSchedule,
    addTest,
    editTest,
    removeTest,

    // Navigation and selection
    selectSchedule,
    availableYears,

    // Helper functions
    getVehicleByPlateOrId,

    // Refetching
    refetchSchedules,
    refetchTests,
  };
}
