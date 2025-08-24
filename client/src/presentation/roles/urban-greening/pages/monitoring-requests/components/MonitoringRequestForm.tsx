import React from "react";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Button } from "@/presentation/components/shared/ui/button";
import LocationPickerMap from "../../LocationPickerMap";
import { toast } from "sonner";
import { MonitoringRequestSubmission } from "../logic/useMonitoringRequests";
import { MONITORING_REQUEST_STATUS_OPTIONS, DEFAULT_MONITORING_REQUEST_STATUS } from "../../../constants";

interface Coordinates {
  lat: number;
  lng: number;
}

interface MonitoringRequestFormProps {
  mode: "adding" | "editing";
  initialValues?: Partial<MonitoringRequestSubmission> & { status?: string };
  location: Coordinates;
  onLocationChange: (loc: Coordinates) => void;
  onSave: (data: MonitoringRequestSubmission, location: Coordinates, status: string) => void;
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
  const [status, setStatus] = React.useState<string>(
    initialValues?.status || DEFAULT_MONITORING_REQUEST_STATUS
  );
  const [form, setForm] = React.useState<MonitoringRequestSubmission>({
    title: "",
    description: "",
    date: new Date(),
    notes: "",
    ...initialValues,
  });

  // Update form state when initialValues change (e.g., switching from add to edit mode)
  React.useEffect(() => {
    setStatus(initialValues?.status || DEFAULT_MONITORING_REQUEST_STATUS);
    setForm({
      title: "",
      description: "",
      date: new Date(),
      notes: "",
      ...initialValues,
    });
  }, [initialValues]);

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

    // Validate required fields
    if (!form.title.trim()) {
      toast.error("Please enter a title for the monitoring request.");
      return;
    }

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
      location,
      status
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
          {MONITORING_REQUEST_STATUS_OPTIONS.map(statusOption => (
            <option key={statusOption} value={statusOption}>
              {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
        <Input
          id="title"
          type="text"
          value={form.title}
          onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter monitoring request title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter description of the monitoring request"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes"
          rows={2}
        />
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
