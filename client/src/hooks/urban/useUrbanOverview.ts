import { useQuery } from "@apollo/client";
import { GET_URBAN_OVERVIEW } from "@/lib/urban-api";

export interface UrbanOverviewData {
  plantSaplingsCollected: number;
  urbanGreening: {
    ornamentalPlants: number;
    trees: number;
  };
  urbanGreeningBreakdown: {
    seeds: number;
    seedsPrivate: number;
    trees: number;
    ornamentals: number;
  };
}

export const useUrbanOverview = (year: number) => {
  const { data, loading, error } = useQuery(GET_URBAN_OVERVIEW, {
    variables: { year },
  });

  return {
    data: data?.urbanOverview as UrbanOverviewData | undefined,
    isLoading: loading,
    error: error?.message,
  };
};
