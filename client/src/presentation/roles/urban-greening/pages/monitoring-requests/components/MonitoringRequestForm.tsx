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
  const [form, setForm] = React.useState<MonitoringRequestSubmission>({
    title: initialValues.title || "",
    description: initialValues.description || "",
    requester_name: initialValues.requester_name || "",
    date: initialValues.date || new Date(),
    address: initialValues.address || "",
    sapling_count: initialValues.sapling_count || undefined,
    notes: initialValues.notes || "",
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
    if (!form.title || !form.requester_name || !form.date || !form.address) {
      toast.error("Please fill in all required fields.");
      return;
    }
    onSave(form, location);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Enter request title"
          value={form.title}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter request description"
          value={form.description}
          onChange={handleChange}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="requester_name">Requester Name</Label>
          <Input
            id="requester_name"
            placeholder="Enter name"
            value={form.requester_name}
            onChange={handleChange}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="Enter address"
          value={form.address}
          onChange={handleChange}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sapling_count">Sapling Count</Label>
          <Input
            id="sapling_count"
            type="number"
            placeholder="Number of saplings"
            value={form.sapling_count ?? ""}
            onChange={handleChange}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes"
          value={form.notes}
          onChange={handleChange}
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
