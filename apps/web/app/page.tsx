"use client";

import { ProjectEnvironmentSelector } from "@/components/project-environment-selector";
import { ServiceList } from "@/components/service-list";
import { useProjectEnvironmentStorage } from "@/lib/hooks/use-project-environment-storage";

export default function Home() {
  const { selected, updateSelection, isLoaded } =
    useProjectEnvironmentStorage();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Staging Snoozer
          </h1>
          <p className="text-muted-foreground">
            Manage your Railway staging environments with automatic spin-up and
            spin-down
          </p>
        </div>

        <div className="space-y-8">
          <ProjectEnvironmentSelector
            selected={selected}
            updateSelection={updateSelection}
            isLoaded={isLoaded}
          />

          {selected && (
            <ServiceList
              projectId={selected.projectId}
              environmentId={selected.environmentId}
              environmentName={selected.environmentName}
            />
          )}
        </div>
      </div>
    </div>
  );
}
