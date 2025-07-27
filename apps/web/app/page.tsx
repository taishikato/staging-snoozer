import { ProjectEnvironmentSelector } from "@/components/project-environment-selector";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Staging Snoozer
          </h1>
          <p className="text-gray-600">
            Manage your Railway staging environments with automatic spin-up and
            spin-down
          </p>
        </div>

        <ProjectEnvironmentSelector />
      </div>
    </div>
  );
}
