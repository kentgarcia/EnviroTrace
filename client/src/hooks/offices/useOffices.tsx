import { gql, useQuery } from '@apollo/client';
import { useMemo, useState, useEffect, useCallback } from 'react';

// Use the vehicle summaries query from emission-api
import { GET_VEHICLE_SUMMARIES } from '@/lib/emission-api';

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

// Main hook for office data fetching and management
export function useOffices() {
    // Filters for year, quarter, and search
    const [filters, setFilters] = useState<OfficesFilter>({
        year: new Date().getFullYear(),
        quarter: Math.ceil((new Date().getMonth() + 1) / 3),
        searchTerm: '',
    });
    const [errorMessage, setErrorMessage] = useState<string | undefined>();

    // Fetch all vehicles
    const { data, loading: isLoading, error, refetch } = useQuery(GET_VEHICLE_SUMMARIES, {
        fetchPolicy: 'network-only',
    });

    // Group vehicles by office and aggregate stats
    const officeData = useMemo(() => {
        if (!data?.vehicleSummaries) return [];

        // Filter vehicles by year/quarter if available
        let vehicles = data.vehicleSummaries;

        if (filters.year) {
            vehicles = vehicles.filter(v => !v.latestTestYear || v.latestTestYear === filters.year);
        }

        if (filters.quarter) {
            vehicles = vehicles.filter(v => !v.latestTestQuarter || v.latestTestQuarter === filters.quarter);
        }

        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            vehicles = vehicles.filter(v =>
                v.officeName?.toLowerCase().includes(term) ||
                v.plateNumber?.toLowerCase().includes(term) ||
                v.driverName?.toLowerCase().includes(term)
            );
        }

        // Group by officeName
        const officeMap: Record<string, OfficeData> = {};

        vehicles.forEach(v => {
            if (!v.officeName) return;

            if (!officeMap[v.officeName]) {
                officeMap[v.officeName] = {
                    id: v.officeName,
                    name: v.officeName,
                    code: v.officeName.split(' ').map(w => w[0]).join('').toUpperCase(),
                    vehicleCount: 0,
                    testedCount: 0,
                    passedCount: 0,
                    complianceRate: 0,
                };
            }

            const office = officeMap[v.officeName];
            office.vehicleCount++;

            if (v.latestTestResult !== undefined && v.latestTestResult !== null) {
                office.testedCount++;
                if (v.latestTestResult === true) office.passedCount++;
            }
        });

        // Calculate compliance rate
        Object.values(officeMap).forEach(office => {
            office.complianceRate = office.vehicleCount > 0 ? Math.round((office.passedCount / office.vehicleCount) * 100) : 0;
        });

        return Object.values(officeMap);
    }, [data?.vehicleSummaries, filters]);

    // Calculate summary stats only when officeData changes
    const summaryStats = useMemo(() => {
        const totalOffices = officeData.length;
        const totalVehicles = officeData.reduce((sum, o) => sum + o.vehicleCount, 0);
        const totalCompliant = officeData.reduce((sum, o) => sum + (o.complianceRate >= 80 ? 1 : 0), 0);
        const overallComplianceRate = totalOffices > 0 ? Math.round((totalCompliant / totalOffices) * 100) : 0;

        return {
            totalOffices,
            totalVehicles,
            totalCompliant,
            overallComplianceRate,
        };
    }, [officeData]);

    // Handle error effect
    useEffect(() => {
        if (error) {
            setErrorMessage('Failed to load office data. Please try again.');
        } else {
            setErrorMessage(undefined);
        }
    }, [error]);

    // Memoize the filter change handler to prevent recreation on each render
    const handleFilterChange = useCallback((filterUpdates: Partial<OfficesFilter>) => {
        setFilters(prev => ({ ...prev, ...filterUpdates }));
    }, []);

    // Memoize the refetch function to ensure stability
    const memoizedRefetch = useCallback(() => {
        return refetch();
    }, [refetch]);

    return {
        officeData,
        isLoading,
        errorMessage,
        filters,
        handleFilterChange,
        refetch: memoizedRefetch,
        summaryStats,
    };
}