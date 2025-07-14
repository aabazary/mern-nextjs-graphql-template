import { gql } from '@apollo/client';

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      email
      role
      createdAt
      updatedAt
    }
  }
`;

export const GET_USERS_QUERY = gql`
  query GetUsers {
    users {
      id
      email
      role
      createdAt
      updatedAt
    }
  }
`; 