import { graphql } from "./generated";

export const MeQuery = graphql(`
  query Me {
    me {
      id
      email
      name
    }
  }
`);

export const ProjectsQuery = graphql(`
  query Projects {
    projects {
      edges {
        node {
          id
          name
          description
          createdAt
          updatedAt
        }
      }
    }
  }
`);

export const EnvironmentsQuery = graphql(`
  query Environments($projectId: String!) {
    environments(projectId: $projectId) {
      edges {
        node {
          id
          name
          isEphemeral
        }
      }
    }
  }
`);
