import { NextRequest, NextResponse } from "next/server";
import { fetchGraphQL } from "@/lib/gql/fetch-graphql";
import { DeploymentStopMutation } from "@/lib/gql/mutations";
import { ServicesQuery } from "@/lib/gql/queries";

class ErrorWithStatus extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const { serviceId } = await params;

    if (!serviceId) {
      throw new ErrorWithStatus("Service ID is required", 400);
    }

    // First, we need to find the latest deployment for this service
    // This requires getting the environment ID from the request or finding the service
    const url = new URL(request.url);
    const environmentId = url.searchParams.get("environmentId");

    if (!environmentId) {
      throw new ErrorWithStatus("Environment ID is required", 400);
    }

    // Get the service details to find the latest deployment
    const servicesResponse = await fetchGraphQL(ServicesQuery, {
      environmentId,
    });

    if (!servicesResponse.environment) {
      throw new ErrorWithStatus("Environment not found", 404);
    }

    const serviceInstance =
      servicesResponse.environment.serviceInstances.edges.find(
        (edge) => edge.node.serviceId === serviceId
      );

    if (!serviceInstance || !serviceInstance.node.latestDeployment) {
      throw new ErrorWithStatus("Service or deployment not found", 404);
    }

    const deploymentId = serviceInstance.node.latestDeployment.id;

    await fetchGraphQL(DeploymentStopMutation, {
      deploymentId,
    });

    return NextResponse.json({
      success: true,
      message: "Service stopped successfully",
    });
  } catch (err) {
    console.error("Error stopping service:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      {
        status: err instanceof ErrorWithStatus ? err.status : 500,
      }
    );
  }
}
