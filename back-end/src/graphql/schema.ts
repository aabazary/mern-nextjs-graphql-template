import { gql } from "graphql-tag";

const typeDefs = gql`
  enum Role {
    UNREGISTERED
    REGISTERED
    OWNER
    SUPERADMIN
  }

  type User {
    id: ID!
    email: String!
    role: Role!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    users: [User!]!
    me: User
  }

  type Mutation {
    signup(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateUser(id: ID!, email: String, role: Role): User!
    deleteUser(id: ID!): User!
    requestPasswordReset(email: String!): String!
  }
`;

export default typeDefs;
