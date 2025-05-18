import { gql } from "@apollo/client";
import { apolloClient } from "../apollo/apollo-client";

// TODO: Define GraphQL queries/mutations for driver search and offenses

export interface DriverSearchParams {
  driverName?: string;
  plateNo?: string;
  orNo?: string;
  transportGroup?: string;
}

export interface DriverOffense {
  date: string;
  type: string;
  status: string;
  paid: boolean;
}

export interface DriverRecord {
  id: number | string;
  driverName: string;
  plateNo: string;
  orNo: string;
  transportGroup: string;
  offenses: DriverOffense[];
}

export const DRIVER_SEARCH = gql`
  query DriverSearch($input: DriverSearchInput) {
    driverSearch(input: $input) {
      id
      driverName
      plateNo
      orNo
      transportGroup
      offenses {
        date
        type
        status
        paid
      }
    }
  }
`;

export async function searchDrivers(
  params: DriverSearchParams
): Promise<DriverRecord[]> {
  const { data } = await apolloClient.query({
    query: DRIVER_SEARCH,
    variables: { input: params },
    fetchPolicy: "network-only",
  });
  return data.driverSearch;
}
