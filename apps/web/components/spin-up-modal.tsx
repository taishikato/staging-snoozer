"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  SpinUpFormData,
  SourceType,
  TTLOption,
} from "@/lib/types/railway";

interface SpinUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SpinUpFormData) => void;
  environmentName: string;
}

export function SpinUpModal({
  open,
  onOpenChange,
  onSubmit,
  environmentName,
}: SpinUpModalProps) {
  const [formData, setFormData] = useState<SpinUpFormData>({
    serviceName: "",
    sourceType: "github",
    sourceValue: "",
    ttl: "24h",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SpinUpFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SpinUpFormData, string>> = {};

    // Service name validation
    if (!formData.serviceName.trim()) {
      newErrors.serviceName = "Service name is required";
    } else if (!/^[a-zA-Z0-9-]+$/.test(formData.serviceName)) {
      newErrors.serviceName =
        "Service name can only contain letters, numbers, and hyphens";
    } else if (formData.serviceName.length < 2) {
      newErrors.serviceName = "Service name must be at least 2 characters long";
    }

    // Source value validation
    if (!formData.sourceValue.trim()) {
      newErrors.sourceValue = "Source is required";
    } else {
      if (formData.sourceType === "github") {
        const githubUrlPattern = /^[\w.-]+\/[\w.-]+$/;
        if (!githubUrlPattern.test(formData.sourceValue)) {
          newErrors.sourceValue = "Please enter a valid GitHub repository URL";
        }
      } else if (formData.sourceType === "docker") {
        const dockerImagePattern =
          /^[\w][\w.-]{0,127}(\/[\w][\w.-]{0,127})*(:[\w][\w.-]{0,127})?$/;
        if (!dockerImagePattern.test(formData.sourceValue)) {
          newErrors.sourceValue = "Please enter a valid Docker image name";
        }
      }
    }

    // Custom TTL validation
    if (formData.ttl === "custom") {
      if (!formData.customTTL || formData.customTTL <= 0) {
        newErrors.customTTL = "Custom TTL must be a positive number";
      } else if (formData.customTTL > 168) {
        newErrors.customTTL = "Custom TTL cannot exceed 168 hours (1 week)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    onSubmit(formData);

    setFormData({
      serviceName: "",
      sourceType: "github",
      sourceValue: "",
      ttl: "24h",
    });
    setErrors({});
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormData({
      serviceName: "",
      sourceType: "github",
      sourceValue: "",
      ttl: "24h",
    });
    setErrors({});
    onOpenChange(false);
  };

  const getSourcePlaceholder = (sourceType: SourceType): string => {
    switch (sourceType) {
      case "github":
        return "nextjs/deploy-railway";
      case "docker":
        return "nginx:latest or myregistry/myimage:tag";
      case "template":
        return "Template ID or name";
      default:
        return "";
    }
  };

  const getTTLLabel = (ttl: TTLOption): string => {
    switch (ttl) {
      case "1h":
        return "1 Hour";
      case "6h":
        return "6 Hours";
      case "24h":
        return "24 Hours (1 Day)";
      case "1w":
        return "1 Week";
      case "custom":
        return "Custom";
      default:
        return ttl;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Spin Up New Service</DialogTitle>
          <DialogDescription>
            Create a new service in the {environmentName} environment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serviceName">Service Name *</Label>
            <Input
              id="serviceName"
              placeholder="my-service"
              value={formData.serviceName}
              onChange={(e) =>
                setFormData({ ...formData, serviceName: e.target.value })
              }
              className={errors.serviceName ? "border-red-500" : ""}
            />
            {errors.serviceName && (
              <p className="text-sm text-red-600">{errors.serviceName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceType">Source Type</Label>
            <Select
              value={formData.sourceType}
              onValueChange={(value: SourceType) =>
                setFormData({ ...formData, sourceType: value, sourceValue: "" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="github">GitHub Repository</SelectItem>
                <SelectItem value="docker">Docker Image</SelectItem>
                <SelectItem value="template">Template</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceValue">
              {formData.sourceType === "github" && "GitHub Repository URL *"}
              {formData.sourceType === "docker" && "Docker Image *"}
              {formData.sourceType === "template" && "Template *"}
            </Label>
            <Input
              id="sourceValue"
              placeholder={getSourcePlaceholder(formData.sourceType)}
              value={formData.sourceValue}
              onChange={(e) =>
                setFormData({ ...formData, sourceValue: e.target.value })
              }
              className={errors.sourceValue ? "border-red-500" : ""}
            />
            {errors.sourceValue && (
              <p className="text-sm text-red-600">{errors.sourceValue}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ttl">Auto Shutdown TTL (optional)</Label>
            <Select
              value={formData.ttl}
              onValueChange={(value: TTLOption) =>
                setFormData({ ...formData, ttl: value, customTTL: undefined })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">{getTTLLabel("1h")}</SelectItem>
                <SelectItem value="6h">{getTTLLabel("6h")}</SelectItem>
                <SelectItem value="24h">{getTTLLabel("24h")}</SelectItem>
                <SelectItem value="1w">{getTTLLabel("1w")}</SelectItem>
                <SelectItem value="custom">{getTTLLabel("custom")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.ttl === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="customTTL">Custom TTL (hours) *</Label>
              <Input
                id="customTTL"
                type="number"
                min="1"
                max="168"
                placeholder="24"
                value={formData.customTTL || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customTTL: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className={errors.customTTL ? "border-red-500" : ""}
              />
              {errors.customTTL && (
                <p className="text-sm text-red-600">{errors.customTTL}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Service will automatically shut down after this many hours
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Spin Up Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
