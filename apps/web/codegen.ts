import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: {
    'https://backboard.railway.com/graphql/v2': {
      headers: {
        Authorization: `Bearer ${process.env.RAILWAY_API_TOKEN}`,
      },
    },
  },
  documents: ['lib/gql/**/*.{ts,tsx}'],
  generates: {
    './lib/gql/generated/': {
      preset: 'client',
      config: {
        documentMode: 'string',
      },
    },
  },
  ignoreNoDocuments: true,
}

export default config