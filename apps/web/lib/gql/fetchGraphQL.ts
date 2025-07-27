import { TypedDocumentString } from "./generated/graphql";

type GraphQLError = {
  message: string;
  extensions?: Record<string, unknown>;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

export class GraphQLClientError extends Error {
  constructor(
    message: string,
    public errors?: GraphQLError[],
    public response?: Response
  ) {
    super(message);
    this.name = "GraphQLClientError";
  }
}

/**
 * Fetch GraphQL data from Railway API
 * This should only be called from server-side code (API routes, server components)
 */
export async function fetchGraphQL<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): Promise<TResult> {
  const token = process.env.RAILWAY_API_TOKEN;

  if (!token) {
    throw new GraphQLClientError("RAILWAY_API_TOKEN is not configured");
  }

  const response = await fetch("https://backboard.railway.com/graphql/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: document.toString(),
      variables: variables ?? undefined,
    }),
  });

  if (!response.ok) {
    throw new GraphQLClientError(
      `HTTP error! status: ${response.status}`,
      undefined,
      response
    );
  }

  const result = (await response.json()) as GraphQLResponse<TResult>;

  if (result.errors && result.errors.length > 0) {
    throw new GraphQLClientError(
      `GraphQL errors: ${result.errors.map((e) => e.message).join(", ")}`,
      result.errors,
      response
    );
  }

  if (!result.data) {
    throw new GraphQLClientError("No data returned from GraphQL query");
  }

  return result.data;
}
