import React, { useState } from "react";
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
import { Edit, Trash, Check, X } from "lucide-react";
import { MONITORING_REQUEST_STATUS_OPTIONS, SOURCE_TYPE_OPTIONS, SOURCE_TYPE_LABELS } from "../../../constants";

interface MonitoringRequest {
  id: string;
  status: string;
  title?: string;
  requester_name?: string;
  date?: string;
  source_type?: string;
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
  onUpdateSourceType: (id: string, sourceType: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
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
  onUpdateSourceType,
  onUpdateTitle,
  getStatusColor,
}) => {
  const [editingSourceType, setEditingSourceType] = useState<string | null>(null);
  const [tempSourceType, setTempSourceType] = useState<string>("");
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState<string>("");

  const handleStartEditSourceType = (requestId: string, currentSourceType: string) => {
    setEditingSourceType(requestId);
    setTempSourceType(currentSourceType || "urban_greening");
  };

  const handleSaveSourceType = (requestId: string) => {
    onUpdateSourceType(requestId, tempSourceType);
    setEditingSourceType(null);
    setTempSourceType("");
  };

  const handleCancelEditSourceType = () => {
    setEditingSourceType(null);
    setTempSourceType("");
  };

  const handleStartEditTitle = (requestId: string, currentTitle: string) => {
    setEditingTitle(requestId);
    setTempTitle(currentTitle || "");
  };

  const handleSaveTitle = (requestId: string) => {
    onUpdateTitle(requestId, tempTitle);
    setEditingTitle(null);
    setTempTitle("");
  };

  const handleCancelEditTitle = () => {
    setEditingTitle(null);
    setTempTitle("");
  };

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
          {MONITORING_REQUEST_STATUS_OPTIONS.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Source Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
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
                <TableCell>
                  {editingTitle === request.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        className="text-sm"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveTitle(request.id);
                          } else if (e.key === 'Escape') {
                            handleCancelEditTitle();
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveTitle(request.id);
                        }}
                      >
                        <Check className="w-3 h-3 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEditTitle();
                        }}
                      >
                        <X className="w-3 h-3 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <span
                        className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditTitle(request.id, request.title || "");
                        }}
                      >
                        {request.title || "—"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditTitle(request.id, request.title || "");
                        }}
                      >
                        <Edit className="w-3 h-3 text-gray-400" />
                      </Button>
                    </div>
                  )}
                </TableCell>
                <TableCell>{request.date || "—"}</TableCell>
                <TableCell>
                  {editingSourceType === request.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={tempSourceType}
                        onChange={(e) => setTempSourceType(e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {SOURCE_TYPE_OPTIONS.map(type => (
                          <option key={type} value={type}>
                            {SOURCE_TYPE_LABELS[type]}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveSourceType(request.id);
                        }}
                      >
                        <Check className="w-3 h-3 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEditSourceType();
                        }}
                      >
                        <X className="w-3 h-3 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditSourceType(request.id, request.source_type || "urban_greening");
                        }}
                      >
                        {SOURCE_TYPE_LABELS[request.source_type as keyof typeof SOURCE_TYPE_LABELS] ||
                          request.source_type || "—"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditSourceType(request.id, request.source_type || "urban_greening");
                        }}
                      >
                        <Edit className="w-3 h-3 text-gray-400" />
                      </Button>
                    </div>
                  )}
                </TableCell>
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
