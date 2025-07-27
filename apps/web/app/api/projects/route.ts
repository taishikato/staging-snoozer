import { NextResponse } from "next/server";
import { fetchGraphQL } from "@/lib/gql/fetchGraphQL";
import { ProjectsQuery, EnvironmentsQuery } from "@/lib/gql/queries";

export async function GET() {
  try {
    // fetch all projects
    const projectsData = await fetchGraphQL(ProjectsQuery);

    // fetch environments for each project
    const projectsWithEnvironments = await Promise.all(
      projectsData.projects.edges.map(async (edge) => {
        try {
          const environmentsData = await fetchGraphQL(EnvironmentsQuery, {
            projectId: edge.node.id,
          });

          return {
            id: edge.node.id,
            name: edge.node.name,
            description: edge.node.description,
            environments: environmentsData.environments.edges.map(
              (envEdge) => ({
                id: envEdge.node.id,
                name: envEdge.node.name,
                isEphemeral: envEdge.node.isEphemeral,
              })
            ),
          };
        } catch (error) {
          console.error(
            `Failed to fetch environments for project ${edge.node.id}:`,
            error
          );
          return {
            id: edge.node.id,
            name: edge.node.name,
            description: edge.node.description,
            environments: [],
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      projects: projectsWithEnvironments,
    });
  } catch (error) {
    console.error("Failed to fetch projects:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
