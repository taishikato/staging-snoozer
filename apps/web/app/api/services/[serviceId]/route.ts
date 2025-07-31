import { NextRequest, NextResponse } from "next/server";
import { fetchGraphQL } from "@/lib/gql/fetch-graphql";
import { ServiceDeleteMutation } from "@/lib/gql/mutations";

class ErrorWithStatus extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { serviceId } = params;

    if (!serviceId) {
      throw new ErrorWithStatus("Service ID is required", 400);
    }

    // Delete the service
    await fetchGraphQL(ServiceDeleteMutation, {
      serviceId,
    });

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting service:", err);
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
