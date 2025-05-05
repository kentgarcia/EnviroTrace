import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import { fetchOffices } from '@/lib/emission-api';
import { useDebounce } from './useDebounce';
import { useNetworkStatus } from './useNetworkStatus';

/**
 * Office data with emission compliance stats
 */
export interface OfficeData {
    id: string;
    name: string;
    code: string;
    address?: string;
    contact?: string;
    vehicleCount: number;
    testedCount: number;
    passedCount: number;
    complianceRate: number;
}

/**
 * Offices filter criteria
 */
export interface OfficesFilter {
    year: number;
    quarter: number;
    searchTerm?: string;
}

/**
 * Zustand store for offices state
 */
interface OfficesStore {
    offices: OfficeData[];
    selectedOfficeId: string | null;
    filters: OfficesFilter;
    setOffices: (offices: OfficeData[]) => void;
    setSelectedOfficeId: (id: string | null) => void;
    updateFilters: (filters: Partial<OfficesFilter>) => void;
}

export const useOfficesStore = create<OfficesStore>((set) => ({
    offices: [],
    selectedOfficeId: null,
    filters: {
        year: new Date().getFullYear(),
        quarter: Math.ceil((new Date().getMonth() + 1) / 3),
        searchTerm: '',
    },
    setOffices: (offices) => set({ offices }),
    setSelectedOfficeId: (id) => set({ selectedOfficeId: id }),
    updateFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
    })),
}));

// Main hook for office data fetching and management
export function useOffices() {
    const { isOffline } = useNetworkStatus();
    const [errorMessage, setErrorMessage] = useState<string | undefined>();

    const { filters, updateFilters } = useOfficesStore();
    const debouncedSearchTerm = useDebounce(filters.searchTerm || '', 300);

    // Query for fetching office data
    const {
        data: officeData = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['offices', filters.year, filters.quarter, debouncedSearchTerm],
        queryFn: async () => {
            try {
                setErrorMessage(undefined);
                const response = await fetchOffices({
                    year: filters.year,
                    quarter: filters.quarter,
                    searchTerm: debouncedSearchTerm,
                });

                // Process and transform the data if needed
                return response.map((office: any) => ({
                    ...office,
                    complianceRate: office.vehicleCount > 0
                        ? Math.round((office.passedCount / office.vehicleCount) * 100)
                        : 0
                }));
            } catch (error) {
                console.error('Error fetching offices:', error);
                setErrorMessage('Failed to load office data. Please try again.');
                return [];
            }
        },
        enabled: !isOffline, // Enable query when online
    });

    // Function to handle filter changes
    const handleFilterChange = (filterUpdates: Partial<OfficesFilter>) => {
        updateFilters(filterUpdates);
    };

    // Calculate summary statistics
    const totalOffices = officeData.length;
    const totalVehicles = officeData.reduce((sum, office) => sum + office.vehicleCount, 0);
    const totalCompliant = officeData.reduce((sum, office) =>
        sum + (office.complianceRate >= 80 ? 1 : 0), 0);
    const overallComplianceRate = totalOffices > 0
        ? Math.round((totalCompliant / totalOffices) * 100)
        : 0;

    return {
        officeData,
        isLoading,
        errorMessage,
        filters,
        handleFilterChange,
        refetch,
        summaryStats: {
            totalOffices,
            totalVehicles,
            totalCompliant,
            overallComplianceRate,
        },
    };
}