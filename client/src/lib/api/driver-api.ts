import { gql } from "@apollo/client";
import { apolloClient } from "../apollo/apollo-client";

export interface DriverSearchParams {
  name?: string;
  license_no?: string;
  plate_no?: string;
}

export interface DriverOffense {
  id: string;
  plate_no: string;
  offense_level: string;
  date: string;
  place_apprehended: string;
  payment_status: string;
}

export interface DriverRecord {
  id: string;
  name: string;
  address: string;
  license_no: string;
  status: string;
  offenses: DriverOffense[];
}

export const DRIVER_SEARCH = gql`
  query DriverSearch($input: DriverSearchInput) {
    driverSearch(input: $input) {
      id
      name
      address
      license_no
      status
      offenses {
        id
        plate_no
        offense_level
        date
        place_apprehended
        payment_status
      }
    }
  }
`;

export const DRIVER_BY_ID = gql`
  query DriverById($id: ID!) {
    driverById(id: $id) {
      id
      name
      address
      license_no
      status
      offenses {
        id
        plate_no
        offense_level
        date
        place_apprehended
        payment_status
      }
    }
  }
`;

export const CREATE_DRIVER = gql`
  mutation CreateDriver($input: CreateDriverInput!) {
    createDriver(input: $input) {
      id
      name
      address
      license_no
      status
      offenses {
        id
        plate_no
        offense_level
        date
        place_apprehended
        payment_status
      }
    }
  }
`;

export const ADD_OFFENSE = gql`
  mutation AddOffenseToDriver($driverId: ID!, $offense: OffenseInput!) {
    addOffenseToDriver(driverId: $driverId, offense: $offense) {
      id
      plate_no
      offense_level
      date
      place_apprehended
      payment_status
    }
  }
`;

export const UPDATE_DRIVER = gql`
  mutation UpdateDriver($id: ID!, $input: UpdateDriverInput!) {
    updateDriver(id: $id, input: $input) {
      id
      name
      address
      license_no
      status
      offenses {
        id
        plate_no
        offense_level
        date
        place_apprehended
        payment_status
      }
    }
  }
`;

export const DELETE_DRIVER = gql`
  mutation DeleteDriver($id: ID!) {
    deleteDriver(id: $id)
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

export async function getDriverById(id: string): Promise<DriverRecord | null> {
  const { data } = await apolloClient.query({
    query: DRIVER_BY_ID,
    variables: { id },
    fetchPolicy: "network-only",
  });
  return data.driverById;
}

export async function createDriver(
  name: string,
  address: string,
  license_no: string,
  offenses?: Array<{
    plate_no: string;
    offense_level: string;
    date: string;
    place_apprehended: string;
    payment_status: string;
  }>
): Promise<DriverRecord> {
  const { data } = await apolloClient.mutate({
    mutation: CREATE_DRIVER,
    variables: {
      input: {
        name,
        address,
        license_no,
        offenses,
      },
    },
  });
  return data.createDriver;
}

export async function addOffenseToDriver(
  driverId: string,
  offense: {
    plate_no: string;
    offense_level: string;
    date: string;
    place_apprehended: string;
    payment_status: string;
  }
): Promise<DriverOffense> {
  const { data } = await apolloClient.mutate({
    mutation: ADD_OFFENSE,
    variables: {
      driverId,
      offense,
    },
  });
  return data.addOffenseToDriver;
}

export async function updateDriver(
  id: string,
  input: {
    name?: string;
    address?: string;
    license_no?: string;
    offenses?: Array<{
      plate_no: string;
      offense_level: string;
      date: string;
      place_apprehended: string;
      payment_status: string;
    }>;
  }
): Promise<DriverRecord> {
  const { data } = await apolloClient.mutate({
    mutation: UPDATE_DRIVER,
    variables: {
      id,
      input,
    },
  });
  return data.updateDriver;
}

export async function deleteDriver(id: string): Promise<boolean> {
  const { data } = await apolloClient.mutate({
    mutation: DELETE_DRIVER,
    variables: { id },
  });
  return data.deleteDriver;
}
