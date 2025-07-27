import React from "react";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Button } from "@/presentation/components/shared/ui/button";
import LocationPickerMap from "../../LocationPickerMap";
import { toast } from "sonner";

interface Coordinates {
  lat: number;
  lng: number;
}

export interface MonitoringRequestFormValues {
  title: string;
  description: string;
  requesterName: string;
  date: Date;
  address: string;
  saplingCount?: number;
  notes?: string;
}

interface MonitoringRequestFormProps {
  mode: "adding" | "editing";
  initialValues?: Partial<MonitoringRequestFormValues>;
  location: Coordinates;
  onLocationChange: (loc: Coordinates) => void;
  onSave: (data: MonitoringRequestFormValues, location: Coordinates) => void;
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
  const [form, setForm] = React.useState<MonitoringRequestFormValues>({
    title: initialValues.title || "",
    description: initialValues.description || "",
    requesterName: initialValues.requesterName || "",
    date: initialValues.date || new Date(),
    address: initialValues.address || "",
    saplingCount: initialValues.saplingCount || undefined,
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
    if (!form.title || !form.requesterName || !form.date || !form.address) {
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
          <Label htmlFor="requesterName">Requester Name</Label>
          <Input
            id="requesterName"
            placeholder="Enter name"
            value={form.requesterName}
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
          <Label htmlFor="saplingCount">Sapling Count</Label>
          <Input
            id="saplingCount"
            type="number"
            placeholder="Number of saplings"
            value={form.saplingCount ?? ""}
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
