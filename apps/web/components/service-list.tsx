"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SpinUpModal } from "@/components/spin-up-modal";
import type {
  ServiceData,
  ServicesResponse,
  SpinUpFormData,
} from "@/lib/types/railway";
import { RefreshCw, Plus } from "lucide-react";

type ServiceListProps = {
  environmentId: string;
  environmentName: string;
};

export function ServiceList({
  environmentId,
  environmentName,
}: ServiceListProps) {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSpinUpModal, setShowSpinUpModal] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/services?environmentId=${environmentId}`
      );
      const data: ServicesResponse = await response.json();

      if (data.success && data.services) {
        setServices(data.services);
      } else {
        setError(data.error || "Failed to fetch services");
      }
    } catch (err) {
      setError("Failed to fetch services");
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  }, [environmentId]);

  useEffect(() => {
    fetchServices();
  }, [environmentId, fetchServices]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "default"; // green
      case "BUILDING":
      case "DEPLOYING":
      case "INITIALIZING":
      case "QUEUED":
        return "secondary"; // blue/gray
      case "FAILED":
      case "CRASHED":
        return "destructive"; // red
      case "SLEEPING":
        return "outline"; // gray outline
      default:
        return "secondary";
    }
  };

  const formatDeployTime = (dateString?: string) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString();
  };

  const handleSpinUp = (formData: SpinUpFormData) => {
    console.log("Spinning up service:", formData);
    // TODO: Implement actual service creation API call
    // For now, just refresh the services list after a delay
    setTimeout(() => {
      fetchServices();
    }, 1000);
  };

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Services in {environmentName}
          </h2>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Service</TableHead>
                <TableHead className="w-[30%]">Status</TableHead>
                <TableHead className="w-[30%]">Last Deploy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Services in {environmentName}
          </h2>
          <Button
            onClick={() => setShowSpinUpModal(true)}
            variant="default"
            size="sm"
          >
            <Plus className="mr-2 size-4" />
            Spin Up Service
          </Button>
        </div>
        <div className="rounded-md border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-800 mb-4">{error}</p>
          <Button onClick={fetchServices} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>

        <SpinUpModal
          open={showSpinUpModal}
          onOpenChange={setShowSpinUpModal}
          onSubmit={handleSpinUp}
          environmentName={environmentName}
        />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Services in {environmentName}
          </h2>
          <div className="flex gap-2">
            <Button onClick={fetchServices} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={() => setShowSpinUpModal(true)}
              variant="default"
              size="sm"
            >
              <Plus className="mr-2 size-4" />
              Spin Up Service
            </Button>
          </div>
        </div>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600 mb-2">
            No services found in this environment
          </p>
          <p className="text-sm text-gray-500">
            Services will appear here once they are deployed to this
            environment.
          </p>
        </div>

        <SpinUpModal
          open={showSpinUpModal}
          onOpenChange={setShowSpinUpModal}
          onSubmit={handleSpinUp}
          environmentName={environmentName}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Services in {environmentName}</h2>
        <div className="flex gap-2">
          <Button onClick={fetchServices} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={() => setShowSpinUpModal(true)}
            variant="default"
            size="sm"
          >
            <Plus className="mr-2 size-4" />
            Spin Up Service
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Service</TableHead>
              <TableHead className="w-[30%]">Status</TableHead>
              <TableHead className="w-[30%]">Last Deploy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(service.status)}>
                    {service.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDeployTime(service.lastDeployTime)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SpinUpModal
        open={showSpinUpModal}
        onOpenChange={setShowSpinUpModal}
        onSubmit={handleSpinUp}
        environmentName={environmentName}
      />
    </div>
  );
}
