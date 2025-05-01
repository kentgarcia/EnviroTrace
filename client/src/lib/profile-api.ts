import { gql } from "@apollo/client";
import { apolloClient } from "./apollo-client";

// Query to fetch the current user's profile
const GET_MY_PROFILE = gql`
  query MyProfile {
    myProfile {
      id
      firstName
      lastName
      fullName
      bio
      jobTitle
      department
      phoneNumber
      createdAt
      updatedAt
    }
  }
`;

// Mutation to update the current user's profile
const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: ProfileInput!) {
    updateProfile(input: $input) {
      id
      firstName
      lastName
      fullName
      bio
      jobTitle
      department
      phoneNumber
      createdAt
      updatedAt
    }
  }
`;

// Function to fetch the current user's profile
export async function fetchMyProfile() {
  try {
    const { data, errors } = await apolloClient.query({
      query: GET_MY_PROFILE,
      fetchPolicy: "network-only", // Don't use cached data
    });

    if (errors) {
      throw new Error(errors[0].message);
    }

    return data.myProfile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
}

// Function to update the current user's profile
export async function updateProfile(profileData: {
  firstName?: string;
  lastName?: string;
  bio?: string;
  jobTitle?: string;
  department?: string;
  phoneNumber?: string;
}) {
  try {
    const { data, errors } = await apolloClient.mutate({
      mutation: UPDATE_PROFILE,
      variables: { input: profileData },
      refetchQueries: [{ query: GET_MY_PROFILE }],
    });

    if (errors) {
      throw new Error(errors[0].message);
    }

    return data.updateProfile;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}
