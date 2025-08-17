import React from "react";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Button } from "@/presentation/components/shared/ui/button";
import LocationPickerMap from "../../LocationPickerMap";
import { toast } from "sonner";
import { MonitoringRequestSubmission } from "../logic/useMonitoringRequests";

interface Coordinates {
  lat: number;
  lng: number;
}

interface MonitoringRequestFormProps {
  mode: "adding" | "editing";
  initialValues?: Partial<MonitoringRequestSubmission>;
  location: Coordinates;
  onLocationChange: (loc: Coordinates) => void;
  onSave: (data: MonitoringRequestSubmission, location: Coordinates) => void;
  onCancel: () => void;
}

const MonitoringRequestForm: React.FC<MonitoringRequestFormProps> = ({
  mode,
  initialValues = {},
  location,
  onLocationChange,
  onSave,
  onCancel,
}) => {
  const [status, setStatus] = React.useState<string>("pending");
  const [form, setForm] = React.useState<MonitoringRequestSubmission>({
    title: "",
    description: "",
    requester_name: "",
    date: new Date(),
    address: "",
    sapling_count: undefined,
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: type === "number" ? Number(value) : value,
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) setForm((prev) => ({ ...prev, date }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only status and location are required per new spec
    if (!location) {
      toast.error("Please set a location on the map.");
      return;
    }
    // Pass through minimal metadata if needed by the hook; status is sent from the hook
    onSave(
      {
        ...form,
        date: form.date || new Date(),
      },
      location
    );
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label className="text-sm font-medium">Status</Label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div>
        <Label className="text-sm font-medium">
          Location (click map to set)
        </Label>
        <LocationPickerMap
          location={location}
          onLocationChange={onLocationChange}
        />
      </div>
      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          Save
        </Button>
      </div>
    </form>
  );
};

export default MonitoringRequestForm;
