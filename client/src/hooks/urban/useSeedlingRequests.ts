/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { toast } from "sonner";

// GraphQL queries and mutations
export const GET_SEEDLING_REQUESTS = gql`
  query GetSeedlingRequests($filters: SeedlingRequestFiltersInput) {
    seedlingRequests(filters: $filters) {
      id
      dateReceived
      requesterName
      address
      items {
        name
        quantity
      }
      notes
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export const GET_SEEDLING_REQUEST = gql`
  query GetSeedlingRequest($id: ID!) {
    seedlingRequest(id: $id) {
      id
      dateReceived
      requesterName
      address
      items {
        name
        quantity
      }
      notes
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export const CREATE_SEEDLING_REQUEST = gql`
  mutation CreateSeedlingRequest($input: SeedlingRequestInput!) {
    createSeedlingRequest(input: $input) {
      id
      dateReceived
      requesterName
      address
      items {
        name
        quantity
      }
      notes
    }
  }
`;

export const UPDATE_SEEDLING_REQUEST = gql`
  mutation UpdateSeedlingRequest($id: ID!, $input: SeedlingRequestInput!) {
    updateSeedlingRequest(id: $id, input: $input) {
      id
      dateReceived
      requesterName
      address
      items {
        name
        quantity
      }
      notes
    }
  }
`;

export const DELETE_SEEDLING_REQUEST = gql`
  mutation DeleteSeedlingRequest($id: ID!) {
    deleteSeedlingRequest(id: $id)
  }
`;

// Types
export interface SeedlingItem {
  name: string;
  quantity: number;
}

export interface SeedlingRequest {
  id: string;
  dateReceived: string;
  requesterName: string;
  address: string;
  items: SeedlingItem[];
  notes?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface SeedlingRequestInput {
  dateReceived: string;
  requesterName: string;
  address: string;
  items: SeedlingItem[];
  notes?: string;
}

export interface SeedlingRequestFilters {
  requesterName?: string;
  startDate?: string;
  endDate?: string;
}

export function useSeedlingRequests() {
  // Filter state
  const [filters, setFilters] = useState({
    searchQuery: "",
    dateRange: {
      start: "",
      end: "",
    },
  });

  // Reset filters
  const resetFilters = () => {
    setFilters({
      searchQuery: "",
      dateRange: {
        start: "",
        end: "",
      },
    });
  };

  // Fetch seedling requests using Apollo Client
  const {
    data,
    loading: isLoading,
    error,
    refetch,
  } = useQuery(GET_SEEDLING_REQUESTS, {
    variables: {
      filters: {
        requesterName: filters.searchQuery ? filters.searchQuery : undefined,
        startDate: filters.dateRange.start || undefined,
        endDate: filters.dateRange.end || undefined,
      },
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
  });

  // Extract seedling requests from query data
  const seedlingRequests = data?.seedlingRequests || [];

  // Track any network issues
  useEffect(() => {
    if (error) {
      console.error("Error fetching seedling requests:", error);
      toast.error("Unable to fetch seedling requests data");
    }
  }, [error]);

  // Create seedling request mutation
  const [createSeedlingRequestMutation, { loading: isCreating }] = useMutation(
    CREATE_SEEDLING_REQUEST,
    {
      onCompleted: () => {
        toast.success("Seedling request added successfully");
        refetch();
      },
      onError: (error) => {
        console.error("Error adding seedling request:", error);
        toast.error("Failed to add seedling request");
      },
    }
  );

  // Update seedling request mutation
  const [updateSeedlingRequestMutation, { loading: isUpdating }] = useMutation(
    UPDATE_SEEDLING_REQUEST,
    {
      onCompleted: () => {
        toast.success("Seedling request updated successfully");
        refetch();
      },
      onError: (error) => {
        console.error("Error updating seedling request:", error);
        toast.error("Failed to update seedling request");
      },
    }
  );

  // Delete seedling request mutation
  const [deleteSeedlingRequestMutation, { loading: isDeleting }] = useMutation(
    DELETE_SEEDLING_REQUEST,
    {
      onCompleted: () => {
        toast.success("Seedling request deleted successfully");
        refetch();
      },
      onError: (error) => {
        console.error("Error deleting seedling request:", error);
        toast.error("Failed to delete seedling request");
      },
    }
  );

  // Add a new seedling request
  const addSeedlingRequest = async (requestData: SeedlingRequestInput) => {
    try {
      await createSeedlingRequestMutation({
        variables: { input: requestData },
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  // Update a seedling request
  const updateSeedlingRequest = async (
    id: string,
    requestData: SeedlingRequestInput
  ) => {
    try {
      await updateSeedlingRequestMutation({
        variables: { id, input: requestData },
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  // Delete a seedling request
  const deleteSeedlingRequest = async (id: string) => {
    try {
      await deleteSeedlingRequestMutation({ variables: { id } });
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    seedlingRequests,
    isLoading: isLoading || isCreating || isUpdating || isDeleting,
    error,
    refetch,
    filters,
    setFilter: (key: string, value: any) =>
      setFilters((prev) => ({ ...prev, [key]: value })),
    resetFilters,
    addSeedlingRequest,
    updateSeedlingRequest,
    deleteSeedlingRequest,
  };
}
