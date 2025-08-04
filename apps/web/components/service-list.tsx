"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SpinUpModal } from "@/components/spin-up-modal";
import { ScheduleModal } from "@/components/schedule-modal";
import type {
  ServiceData,
  ServicesResponse,
  SpinUpFormData,
  ServiceCreateResponse,
} from "@/lib/types/railway";
import {
  RefreshCw,
  Plus,
  MoreHorizontal,
  Square,
  Trash2,
  CalendarClock,
} from "lucide-react";

type ServiceListProps = {
  projectId: string;
  environmentId: string;
  environmentName: string;
};

export function ServiceList({
  projectId,
  environmentId,
  environmentName,
}: ServiceListProps) {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSpinUpModal, setShowSpinUpModal] = useState(false);
  const [scheduleModal, setScheduleModal] = useState<{
    open: boolean;
    serviceId: string;
    serviceName: string;
  }>({ open: false, serviceId: "", serviceName: "" });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "stop" | "delete";
    serviceId: string;
    serviceName: string;
  }>({ open: false, action: "stop", serviceId: "", serviceName: "" });
  const pollingIntervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());

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

  useEffect(() => {
    return () => {
      pollingIntervalsRef.current.forEach((interval) =>
        clearInterval(interval)
      );
      pollingIntervalsRef.current.clear();
    };
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "default";
      case "BUILDING":
      case "DEPLOYING":
      case "INITIALIZING":
      case "QUEUED":
        return "secondary";
      case "FAILED":
      case "CRASHED":
        return "destructive";
      case "SLEEPING":
        return "outline";
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

  const handleSpinUp = async (formData: SpinUpFormData) => {
    try {
      const { serviceName, sourceType, sourceValue, ttl, customTTL } = formData;

      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          environmentId,
          serviceName,
          sourceType,
          sourceValue,
          ttl,
          customTTL,
        }),
      });

      const result: ServiceCreateResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to create service");
      }

      // polling
      if (result.service?.id && result.service?.deploymentId) {
        const interval = pollDeploymentStatus(
          result.service.id,
          result.service.deploymentId
        );
        pollingIntervalsRef.current.add(interval);
      }

      await fetchServices();
    } catch (error) {
      console.error("Error creating service:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create service"
      );
    }
  };

  const pollDeploymentStatus = (serviceId: string, deploymentId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const pollInterval = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(
          `/api/services?environmentId=${environmentId}`
        );
        const data: ServicesResponse = await response.json();

        if (data.success && data.services) {
          setServices(data.services);

          const service = data.services.find((s) => s.id === serviceId);
          if (
            service &&
            (service.status === "SUCCESS" ||
              service.status === "FAILED" ||
              service.status === "CRASHED")
          ) {
            clearInterval(pollInterval);
            pollingIntervalsRef.current.delete(pollInterval);
            console.log(
              `Deployment ${deploymentId} completed with status: ${service.status}`
            );
            return;
          }
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          pollingIntervalsRef.current.delete(pollInterval);
          console.log(
            `Stopped polling deployment ${deploymentId} after ${maxAttempts} attempts`
          );
        }
      } catch (error) {
        console.error("Error polling deployment status:", error);
      }
    }, 10000);

    return pollInterval;
  };

  const handleStopService = async (serviceId: string) => {
    try {
      const response = await fetch(
        `/api/services/${serviceId}/stop?environmentId=${environmentId}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to stop service");
      }

      await fetchServices();
    } catch (error) {
      console.error("Error stopping service:", error);
      setError(
        error instanceof Error ? error.message : "Failed to stop service"
      );
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to delete service");
      }

      await fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete service"
      );
    }
  };

  const handleConfirmAction = async () => {
    if (confirmDialog.action === "stop") {
      await handleStopService(confirmDialog.serviceId);
    } else {
      await handleDeleteService(confirmDialog.serviceId);
    }
    setConfirmDialog({
      open: false,
      action: "stop",
      serviceId: "",
      serviceName: "",
    });
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
                <TableHead className="w-[30%]">Service</TableHead>
                <TableHead className="w-[25%]">Status</TableHead>
                <TableHead className="w-[25%]">Last Deploy</TableHead>
                <TableHead className="w-[20%]">Actions</TableHead>
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
                  <TableCell>
                    <Skeleton className="size-8" />
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
            <RefreshCw className="mr-2 size-4" />
            Retry
          </Button>
        </div>

        <SpinUpModal
          open={showSpinUpModal}
          onOpenChange={setShowSpinUpModal}
          onSubmit={handleSpinUp}
          environmentName={environmentName}
        />

        <ScheduleModal
          serviceId={scheduleModal.serviceId}
          serviceName={scheduleModal.serviceName}
          open={scheduleModal.open}
          onOpenChange={(open) => setScheduleModal({ ...scheduleModal, open })}
          onSuccess={fetchServices}
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
              <RefreshCw className="mr-2 size-4" />
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

        <ScheduleModal
          serviceId={scheduleModal.serviceId}
          serviceName={scheduleModal.serviceName}
          open={scheduleModal.open}
          onOpenChange={(open) => setScheduleModal({ ...scheduleModal, open })}
          onSuccess={fetchServices}
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
            <RefreshCw className="mr-2 size-4" />
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
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          setScheduleModal({
                            open: true,
                            serviceId: service.id,
                            serviceName: service.name,
                          })
                        }
                      >
                        <CalendarClock className="mr-2 h-4 w-4" />
                        Schedule Action
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setConfirmDialog({
                            open: true,
                            action: "stop",
                            serviceId: service.id,
                            serviceName: service.name,
                          })
                        }
                      >
                        <Square className="mr-2 h-4 w-4" />
                        Stop Service
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setConfirmDialog({
                            open: true,
                            action: "delete",
                            serviceId: service.id,
                            serviceName: service.name,
                          })
                        }
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Service
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === "stop"
                ? "Stop Service"
                : "Delete Service"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === "stop"
                ? `Are you sure you want to stop "${confirmDialog.serviceName}"? This will stop the service but keep its configuration.`
                : `Are you sure you want to delete "${confirmDialog.serviceName}"? This action cannot be undone and will permanently remove the service.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={
                confirmDialog.action === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
            >
              {confirmDialog.action === "stop" ? "Stop" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ScheduleModal
        serviceId={scheduleModal.serviceId}
        serviceName={scheduleModal.serviceName}
        open={scheduleModal.open}
        onOpenChange={(open) => setScheduleModal({ ...scheduleModal, open })}
        onSuccess={fetchServices}
      />
    </div>
  );
}
