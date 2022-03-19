import { gql } from "apollo-server-express";

export const typeDefs = gql`
type Comment {
  content: String!
  id: ID!
  parent: TopicOrComment
  root: Topic!
  user: User!
}

input CreateTopicInput {
  content: String!
  title: String!
}

scalar DateTime

type Mutation {
  createTopic(input: CreateTopicInput!): Topic!
  deleteTopic(id: ID!): Topic!
  signUp(input: SignUpInput!): User!
  updateTopic(id: ID!, input: UpdateTopicInput!): Topic!
}

type Query {
  me: User!
  topic(id: ID!): Topic!
  topics: [Topic!]!
}

input SignUpInput {
  displayName: String!
  email: String!
  password: String!
}

type Topic {
  content: String!
  createdAt: DateTime!
  id: ID!
  title: String!
  updatedAt: DateTime!
  user: User!
}

union TopicOrComment = Comment | Topic

input UpdateTopicInput {
  content: String!
  title: String!
}

type User {
  displayName: String!
  id: ID!
  topics: [Topic!]!
}
`;
