import { NextRequest, NextResponse } from "next/server";
import { fetchGraphQL } from "@/lib/gql/fetch-graphql";
import { ServicesQuery } from "@/lib/gql/queries";
import {
  ServiceCreateMutation,
  ServiceInstanceDeployMutation,
} from "@/lib/gql/mutations";
import type {
  ServicesResponse,
  ServiceData,
  ServiceCreateResponse,
  SpinUpFormData,
} from "@/lib/types/railway";

class ErrorWithStatus extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const environmentId = searchParams.get("environmentId");

    if (!environmentId) {
      throw new ErrorWithStatus("Environment ID is required", 400);
    }

    const response = await fetchGraphQL(ServicesQuery, {
      environmentId,
    });

    if (!response.environment) {
      throw new ErrorWithStatus("Environment not found", 404);
    }

    const services: ServiceData[] =
      response.environment.serviceInstances.edges.map((edge) => {
        const node = edge.node;
        return {
          id: node.serviceId,
          name: node.serviceName,
          status: node.latestDeployment?.status || "UNKNOWN",
          lastDeployTime: node.latestDeployment?.createdAt,
        };
      });

    return NextResponse.json({
      success: true,
      services,
    } satisfies ServicesResponse);
  } catch (err) {
    console.error("Error fetching services:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      } satisfies ServicesResponse,
      {
        status: err instanceof ErrorWithStatus ? err.status : 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      environmentId,
      serviceName,
      sourceType,
      sourceValue,
      ttl,
      customTTL,
    }: SpinUpFormData & { projectId: string; environmentId: string } = body;

    if (
      !projectId ||
      !environmentId ||
      !serviceName ||
      !sourceType ||
      !sourceValue
    ) {
      throw new ErrorWithStatus(
        "Project ID, environment ID, service name, source type, and source value are required",
        400
      );
    }

    const source: { repo?: string; image?: string } = {};

    if (sourceType === "github") {
      source.repo = sourceValue;
    } else if (sourceType === "docker") {
      source.image = sourceValue;
    }

    const serviceCreateResponse = await fetchGraphQL(ServiceCreateMutation, {
      input: {
        environmentId,
        projectId,
        name: serviceName,
        source,
      },
    });

    const { serviceCreate: service } = serviceCreateResponse;

    const response = await fetchGraphQL(ServiceInstanceDeployMutation, {
      environmentId,
      serviceId: service.id,
    });

    const deploymentId = response.serviceInstanceDeployV2;

    return NextResponse.json({
      success: true,
      service: {
        id: service.id,
        name: service.name,
        deploymentId: deploymentId,
      },
    } satisfies ServiceCreateResponse);
  } catch (err) {
    console.error("Error creating service:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      } satisfies ServiceCreateResponse,
      {
        status: err instanceof ErrorWithStatus ? err.status : 500,
      }
    );
  }
}
