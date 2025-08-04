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
import { Textarea } from "@/components/ui/textarea";
import { CalendarClock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ScheduleModalProps {
  serviceId: string;
  serviceName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ScheduleModal({
  serviceId,
  serviceName,
  open,
  onOpenChange,
  onSuccess,
}: ScheduleModalProps) {
  const [action, setAction] = useState<"STOP" | "DELETE">("STOP");
  const [executeAt, setExecuteAt] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper to set relative times
  const setRelativeTime = (hours: number) => {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    // Format as datetime-local input value
    const formatted = date.toISOString().slice(0, 16);
    setExecuteAt(formatted);
  };

  const handleSubmit = async () => {
    if (!executeAt) {
      toast({
        title: "Error",
        description: "Please select when to execute this action",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId,
          action,
          executeAt,
          note: note.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create rule");
      }

      toast({
        title: "Success",
        description: `Scheduled ${action.toLowerCase()} action for ${serviceName || serviceId}`,
      });

      onOpenChange(false);
      onSuccess?.();

      // Reset form
      setAction("STOP");
      setExecuteAt("");
      setNote("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule action",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Action</DialogTitle>
          <DialogDescription>
            Schedule an automatic action for {serviceName || serviceId}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="action">Action</Label>
            <Select
              value={action}
              onValueChange={(v) => setAction(v as "STOP" | "DELETE")}
            >
              <SelectTrigger id="action">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STOP">Stop Service</SelectItem>
                <SelectItem value="DELETE">Delete Service</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {action === "STOP"
                ? "Stop the service but keep its configuration"
                : "Permanently delete the service and all its data"}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="executeAt">Execute At</Label>
            <Input
              id="executeAt"
              type="datetime-local"
              value={executeAt}
              onChange={(e) => setExecuteAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
            <div className="flex gap-2 mt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRelativeTime(1)}
              >
                +1 hour
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRelativeTime(24)}
              >
                +1 day
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRelativeTime(24 * 7)}
              >
                +1 week
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a note about this scheduled action..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <CalendarClock className="mr-2 h-4 w-4" />
            {loading ? "Scheduling..." : "Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
