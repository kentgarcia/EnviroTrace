import { gql } from "@apollo/client";

export const GET_URBAN_OVERVIEW = gql`
  query GetUrbanOverview($year: Int!) {
    urbanOverview(year: $year) {
      plantSaplingsCollected
      urbanGreening {
        ornamentalPlants
        trees
      }
      urbanGreeningBreakdown {
        seeds
        seedsPrivate
        trees
        ornamentals
      }
    }
  }
`;
