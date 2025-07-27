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
