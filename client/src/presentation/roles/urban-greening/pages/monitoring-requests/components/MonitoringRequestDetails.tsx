import React from "react";
import { Label } from "@/presentation/components/shared/ui/label";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Button } from "@/presentation/components/shared/ui/button";
import LocationMap from "@/presentation/roles/urban-greening/components/LocationMap";
import { Edit, Trash } from "lucide-react";

interface Coordinates {
  lat: number;
  lng: number;
}

export interface MonitoringRequest {
  id: string;
  status: string;
  location?: Coordinates;
  title?: string;
  description?: string;
  requester_name?: string;
  date?: string;
  address?: string;
  sapling_count?: number;
  notes?: string;
}

interface MonitoringRequestDetailsProps {
  request: MonitoringRequest;
  onEdit: () => void;
  onDelete: () => void;
  getStatusColor: (status: string) => string;
}

const MonitoringRequestDetails: React.FC<MonitoringRequestDetailsProps> = ({
  request,
  onEdit,
  onDelete,
  getStatusColor,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Request ID</Label>
        <p className="text-sm text-muted-foreground">{request.id}</p>
      </div>
      {request.title && (
        <div>
          <Label className="text-sm font-medium">Title</Label>
          <p className="text-sm">{request.title}</p>
        </div>
      )}
      {request.description && (
        <div>
          <Label className="text-sm font-medium">Description</Label>
          <p className="text-sm text-muted-foreground">{request.description}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {request.requester_name && (
          <div>
            <Label className="text-sm font-medium">Requester</Label>
            <p className="text-sm">{request.requester_name}</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {request.date && (
          <div>
            <Label className="text-sm font-medium">Date</Label>
            <p className="text-sm">{request.date}</p>
          </div>
        )}
        {request.address && (
          <div>
            <Label className="text-sm font-medium">Address</Label>
            <p className="text-sm">{request.address}</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Status</Label>
          <Badge className={getStatusColor(request.status)}>
            {request.status}
          </Badge>
        </div>
      </div>
      {request.sapling_count && (
        <div>
          <Label className="text-sm font-medium">Sapling Count</Label>
          <p className="text-sm">{request.sapling_count}</p>
        </div>
      )}
      {request.notes && (
        <div>
          <Label className="text-sm font-medium">Notes</Label>
          <p className="text-sm text-muted-foreground">{request.notes}</p>
        </div>
      )}
      {request.location && (
        <div>
          <Label className="text-sm font-medium">Location</Label>
          <div className="h-48 w-full rounded overflow-hidden border mt-1">
            <LocationMap location={request.location} />
          </div>
        </div>
      )}
      <div className="flex gap-2 pt-4">
        <Button onClick={onEdit} className="flex-1">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button variant="destructive" onClick={onDelete} className="flex-1">
          <Trash className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default MonitoringRequestDetails;
