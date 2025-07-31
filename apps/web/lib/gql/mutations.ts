import { graphql } from "./generated";

export const ServiceCreateMutation = graphql(`
  mutation CreateServiceMutation($input: ServiceCreateInput!) {
    serviceCreate(input: $input) {
      id
      name
      projectId
    }
  }
`);

export const ServiceInstanceDeployMutation = graphql(`
  mutation DeployServiceMutation(
    $serviceId: String!
    $environmentId: String!
    $commitSha: String
  ) {
    serviceInstanceDeployV2(
      commitSha: $commitSha
      serviceId: $serviceId
      environmentId: $environmentId
    )
  }
`);

export const DeploymentStopMutation = graphql(`
  mutation StopDeploymentMutation($deploymentId: String!) {
    deploymentStop(id: $deploymentId)
  }
`);

export const ServiceDeleteMutation = graphql(`
  mutation DeleteServiceMutation($serviceId: String!) {
    serviceDelete(id: $serviceId)
  }
`);
