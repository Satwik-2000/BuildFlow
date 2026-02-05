import { gql } from "@apollo/client";

export const LIST_PROJECTS = gql`
  query ListProjects($search: String, $status: String) {
    projects(search: $search, status: $status) {
      id
      name
      code
      description
      location
      startDate
      endDate
      budget
      status
      createdAt
    }
  }
`;

export const GET_PROJECT = gql`
  query Project($id: ID!) {
    project(id: $id) {
      id
      name
      code
      description
      location
      startDate
      endDate
      budget
      status
      contracts { id contractNo title value status }
      milestones { id name dueDate amount status }
      createdAt
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      code
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      name
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      id
    }
  }
`;
