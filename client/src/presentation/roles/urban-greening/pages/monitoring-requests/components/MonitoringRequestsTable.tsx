import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/presentation/components/shared/ui/table";
import { Input } from "@/presentation/components/shared/ui/input";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Button } from "@/presentation/components/shared/ui/button";
import { Edit, Trash } from "lucide-react";

interface MonitoringRequest {
  id: string;
  status: string;
  title?: string;
  requester_name?: string;
  date?: string;
}

interface MonitoringRequestsTableProps {
  requests: MonitoringRequest[];
  selectedRequestId: string | null;
  onSelectRequest: (id: string | null) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  getStatusColor: (status: string) => string;
}

const MonitoringRequestsTable: React.FC<MonitoringRequestsTableProps> = ({
  requests,
  selectedRequestId,
  onSelectRequest,
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  onEdit,
  onDelete,
  getStatusColor,
}) => {
  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Search requests..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Requester</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-8"
              >
                No requests found.
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow
                key={request.id}
                className={`cursor-pointer ${selectedRequestId === request.id ? "bg-blue-50" : ""
                  }`}
                onClick={() => onSelectRequest(request.id)}
              >
                <TableCell className="font-medium">{request.id}</TableCell>
                <TableCell>{request.title || "—"}</TableCell>
                <TableCell>{request.requester_name || "—"}</TableCell>
                <TableCell>{request.date || "—"}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(request.id);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(request.id);
                      }}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default MonitoringRequestsTable;
