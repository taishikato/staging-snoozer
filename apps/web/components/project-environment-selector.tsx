"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectEnvironmentStorage } from "@/lib/hooks/use-project-environment-storage";
import type { RailwayProject, ProjectsResponse } from "@/lib/types/railway";

export function ProjectEnvironmentSelector() {
  const [projects, setProjects] = useState<RailwayProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const { selected, updateSelection, isLoaded } =
    useProjectEnvironmentStorage();

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const response = await fetch("/api/projects");
        const data: ProjectsResponse = await response.json();

        if (data.success && data.projects) {
          setProjects(data.projects);
        } else {
          setError(data.error || "Failed to fetch projects");
        }
      } catch (err) {
        setError("Failed to fetch projects");
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  useEffect(() => {
    if (isLoaded && selected && projects.length > 0) {
      // check if the saved project still exists
      const projectExists = projects.find((p) => p.id === selected.projectId);
      if (projectExists) {
        setSelectedProjectId(selected.projectId);
      } else {
        updateSelection(null);
      }
    }
  }, [isLoaded, selected, projects, updateSelection]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const selectedEnvironmentId = selected?.environmentId || "";

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    updateSelection(null);
  };

  const handleEnvironmentChange = (environmentId: string) => {
    if (!selectedProject) return;

    const environment = selectedProject.environments.find(
      (e) => e.id === environmentId
    );

    if (!environment) return;

    updateSelection({
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      environmentId: environment.id,
      environmentName: environment.name,
    });
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Project & Environment Selector</CardTitle>
          <CardDescription>Loading your Railway projects...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const retryFetch = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Project & Environment Selector</CardTitle>
          <CardDescription>
            Unable to load your Railway projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
          <div className="text-sm text-gray-600">
            Please check your Railway API token configuration and try again.
          </div>
          <Button onClick={retryFetch} className="w-full">
            Retry Loading Projects
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Project & Environment Selector</CardTitle>
          <CardDescription>No Railway projects found</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-secondary-foreground text-sm mb-2">
              You don&apos;t have any Railway projects yet.
            </div>
            <div className="text-muted-foreground text-sm">
              Create a project in Railway to get started with Staging Snoozer.
            </div>
          </div>
          <Button asChild className="w-full">
            <a
              href="https://railway.app/new"
              target="_blank"
              rel="noopener noreferrer"
            >
              Create Project in Railway
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Project & Environment Selector</CardTitle>
        <CardDescription>
          Choose a Railway project and environment to manage staging services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Project</label>
          <Select value={selectedProjectId} onValueChange={handleProjectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex flex-col">
                    <span>{project.name}</span>
                    {project.description && (
                      <span className="text-xs text-gray-500">
                        {project.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Environment Selector */}
        {selectedProject && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Environment</label>
            {selectedProject.environments.length === 0 ? (
              <div className="p-4 text-center bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-yellow-800 text-sm mb-2">
                  No environments found in this project
                </div>
                <div className="text-yellow-700 text-xs">
                  Create an environment in Railway to continue.
                </div>
              </div>
            ) : (
              <Select
                value={selectedEnvironmentId}
                onValueChange={handleEnvironmentChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an environment" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProject.environments.map((environment) => (
                    <SelectItem key={environment.id} value={environment.id}>
                      <div className="flex items-center gap-2">
                        <span>{environment.name}</span>
                        {environment.isEphemeral && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Ephemeral
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Selection Summary */}
        {selected && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-800">
              Selected Configuration
            </h3>
            <p className="text-sm text-green-700 mt-1">
              <strong>Project:</strong> {selected.projectName}
              <br />
              <strong>Environment:</strong> {selected.environmentName}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
