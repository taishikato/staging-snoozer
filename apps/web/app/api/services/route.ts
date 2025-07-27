import { NextRequest, NextResponse } from "next/server";
import { fetchGraphQL } from "@/lib/gql/fetch-graphql";
import { ServicesQuery } from "@/lib/gql/queries";
import type { ServicesResponse, ServiceData } from "@/lib/types/railway";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const environmentId = searchParams.get("environmentId");

    if (!environmentId) {
      return NextResponse.json({
        success: false,
        error: "Environment ID is required",
      } satisfies ServicesResponse);
    }

    const response = await fetchGraphQL(ServicesQuery, {
      environmentId,
    });

    if (!response.environment) {
      return NextResponse.json({
        success: false,
        error: "Environment not found",
      } satisfies ServicesResponse);
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
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch services",
    } satisfies ServicesResponse);
  }
}
