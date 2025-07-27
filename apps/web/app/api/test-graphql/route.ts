import { NextResponse } from "next/server";
import { fetchGraphQL } from "@/lib/gql/fetchGraphQL";
import { MeQuery } from "@/lib/gql/queries";

export async function GET() {
  try {
    const data = await fetchGraphQL(MeQuery);

    return NextResponse.json({
      success: true,
      data: data.me,
    });
  } catch (error) {
    console.error("GraphQL query failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
