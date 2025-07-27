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

export const ServicesQuery = graphql(`
  query Services($environmentId: String!) {
    environment(id: $environmentId) {
      id
      name
      serviceInstances {
        edges {
          node {
            id
            serviceId
            serviceName
            latestDeployment {
              id
              status
              createdAt
            }
          }
        }
      }
    }
  }
`);
