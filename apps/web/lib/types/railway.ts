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

export type ServiceData = {
  id: string;
  name: string;
  status: string;
  lastDeployTime?: string;
};

export type ServicesResponse = {
  success: boolean;
  services?: ServiceData[];
  error?: string;
};

export type SourceType = "github" | "docker" | "template";
export type TTLOption = "1h" | "6h" | "24h" | "1w" | "custom";

export type SpinUpFormData = {
  serviceName: string;
  sourceType: SourceType;
  sourceValue: string;
  ttl?: TTLOption;
  customTTL?: number; // in hours
};
