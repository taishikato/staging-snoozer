export type RailwayEnvironment = {
  id: string;
  name: string;
  isEphemeral: boolean;
};

export type RailwayProject = {
  id: string;
  name: string;
  description?: string;
  environments: RailwayEnvironment[];
};

export type ProjectsResponse = {
  success: boolean;
  projects?: RailwayProject[];
  error?: string;
};
