import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  searchAirQualityRecords,
  fetchAirQualityViolationsByRecordId,
  createAirQualityViolation,
  createAirQualityRecord,
  updateAirQualityViolationPaymentStatus,
  AirQualityRecord,
  AirQualityViolation,
  AirQualityDriver,
} from "@/core/api/air-quality-api";

export interface SmokeBelcherSearchParams {
  plateNumber?: string;
  operatorName?: string;
  vehicleType?: string;
  limit?: number;
  offset?: number;
}

export interface ViolationFormData {
  record_id: number;
  ordinance_infraction_report_no?: string;
  smoke_density_test_result_no?: string;
  place_of_apprehension: string;
  date_of_apprehension: string;
  driver_id?: string;
}

export interface RecordFormData {
  plate_number: string;
  vehicle_type: string;
  transport_group?: string;
  operator_company_name: string;
  operator_address?: string;
  owner_first_name?: string;
  owner_middle_name?: string;
  owner_last_name?: string;
  motor_no?: string;
  motor_vehicle_name?: string;
}

export const useSmokeBelcherData = () => {
  const [searchParams, setSearchParams] = useState<SmokeBelcherSearchParams>(
    {}
  );
  const [selectedRecord, setSelectedRecord] = useState<AirQualityRecord | null>(
    null
  );
  const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"violations" | "history">(
    "violations"
  );

  const queryClient = useQueryClient();

  // Search records
  const {
    data: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: ["air-quality-smoke-belcher-search", searchParams],
    queryFn: () => searchAirQualityRecords(searchParams),
    enabled: true, // Always enable the query - API will handle empty params
    staleTime: 5 * 60 * 1000,
  });

  // Get violations for selected record
  const {
    data: recordViolations,
    isLoading: isViolationsLoading,
    error: violationsError,
  } = useQuery({
    queryKey: ["air-quality-record-violations", selectedRecord?.id],
    queryFn: () => fetchAirQualityViolationsByRecordId(selectedRecord!.id),
    enabled: !!selectedRecord?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Search function
  const handleSearch = useCallback((params: SmokeBelcherSearchParams) => {
    setSearchParams(params);
    setSelectedRecord(null);
  }, []);

  // Select record
  const handleSelectRecord = useCallback((record: AirQualityRecord) => {
    setSelectedRecord(record);
  }, []);

  // Clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedRecord(null);
    setActiveTab("violations");
  }, []);

  // Create violation mutation
  const createViolationMutation = useMutation({
    mutationFn: createAirQualityViolation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["air-quality-record-violations"],
      });
      setIsViolationModalOpen(false);
    },
  });

  // Create record mutation
  const createRecordMutation = useMutation({
    mutationFn: createAirQualityRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["air-quality-smoke-belcher-search"],
      });
      setIsRecordModalOpen(false);
    },
  });

  // Update payment status mutation
  const updatePaymentMutation = useMutation({
    mutationFn: ({
      violationId,
      paidDriver,
      paidOperator,
    }: {
      violationId: number;
      paidDriver: boolean;
      paidOperator: boolean;
    }) =>
      updateAirQualityViolationPaymentStatus(
        violationId,
        paidDriver,
        paidOperator
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["air-quality-record-violations"],
      });
    },
  });

  // Calculate violation summary
  const getViolationSummary = useCallback(() => {
    if (!recordViolations) return null;

    const totalViolations = recordViolations.length;
    const paidViolations = recordViolations.filter(
      (v) => v.paid_driver && v.paid_operator
    ).length;
    const pendingViolations = totalViolations - paidViolations;

    // Calculate offense level based on violation count
    let offenseLevel = "No Violations";
    if (totalViolations === 1) offenseLevel = "1st Offense";
    else if (totalViolations === 2) offenseLevel = "2nd Offense";
    else if (totalViolations >= 3) offenseLevel = "3rd Offense & Above";

    const lastViolation = recordViolations.reduce((latest, current) => {
      return new Date(current.date_of_apprehension) >
        new Date(latest.date_of_apprehension)
        ? current
        : latest;
    }, recordViolations[0]);

    return {
      totalViolations,
      paidViolations,
      pendingViolations,
      offenseLevel,
      lastDateApprehended: lastViolation?.date_of_apprehension,
      lastLocation: lastViolation?.place_of_apprehension,
    };
  }, [recordViolations]);

  return {
    // Data
    searchResults,
    selectedRecord,
    recordViolations,
    violationSummary: getViolationSummary(),

    // Loading states
    isSearchLoading,
    isViolationsLoading,
    isCreatingViolation: createViolationMutation.isPending,
    isCreatingRecord: createRecordMutation.isPending,
    isUpdatingPayment: updatePaymentMutation.isPending,

    // Error states
    searchError,
    violationsError,

    // Actions
    handleSearch,
    handleSelectRecord,
    handleClearSelection,
    createViolation: createViolationMutation.mutate,
    createRecord: createRecordMutation.mutate,
    updatePaymentStatus: updatePaymentMutation.mutate,
    refetchSearch,

    // UI state
    activeTab,
    setActiveTab,
    isViolationModalOpen,
    setIsViolationModalOpen,
    isRecordModalOpen,
    setIsRecordModalOpen,
  };
};
