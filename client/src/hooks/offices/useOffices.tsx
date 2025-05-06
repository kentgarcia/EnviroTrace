import { useState, useEffect, useMemo } from 'react';
import { gql, useQuery as useApolloQuery } from '@apollo/client';
import { create } from 'zustand';
import { useDebounce } from '../utils/useDebounce';

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

// GraphQL query for fetching office data
export const GET_OFFICES = gql`
  query GetOffices($year: Int!, $quarter: Int!, $searchTerm: String) {
    offices(year: $year, quarter: $quarter, searchTerm: $searchTerm) {
      id
      name
      code
      address
      contact
      vehicleCount
      testedCount
      passedCount
    }
  }
`;

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

// Define interface for GraphQL response
interface OfficeResponse {
    id: string;
    name: string;
    code: string;
    address?: string;
    contact?: string;
    vehicleCount: number;
    testedCount: number;
    passedCount: number;
}

// Main hook for office data fetching and management
export function useOffices() {
    const [errorMessage, setErrorMessage] = useState<string | undefined>();

    const { filters, updateFilters, setOffices } = useOfficesStore();
    const debouncedSearchTerm = useDebounce(filters.searchTerm || '', 300);

    // Query for fetching office data using Apollo Client
    const {
        data,
        loading: isLoading,
        error,
        refetch
    } = useApolloQuery(GET_OFFICES, {
        variables: {
            year: filters.year,
            quarter: filters.quarter,
            searchTerm: debouncedSearchTerm,
        },
        fetchPolicy: 'network-only', // Don't use cache, always request fresh data
    });

    // Process the data to match the expected structure
    const officeData = useMemo(() => data?.offices ? data.offices.map((office: OfficeResponse) => ({
        ...office,
        complianceRate: office.vehicleCount > 0
            ? Math.round((office.passedCount / office.vehicleCount) * 100)
            : 0
    })) : [], [data]);

    // Update error message if there's an error
    useEffect(() => {
        if (error) {
            console.error('Error fetching offices:', error);
            setErrorMessage('Failed to load office data. Please try again.');
        } else {
            setErrorMessage(undefined);
        }
    }, [error]);

    // Update the store when data changes
    useEffect(() => {
        if (data?.offices) {
            setOffices(officeData);
        }
    }, [data, setOffices, officeData]);

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