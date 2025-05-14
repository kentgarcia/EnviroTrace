import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { AppSidebar } from "@/presentation/components/shared/layout/AppSidebar";
import { SidebarProvider } from "@/presentation/components/shared/ui/sidebar";
import { DashboardNavbar } from "@/presentation/components/shared/layout/DashboardNavbar";
import { NetworkStatus } from "@/presentation/components/shared/layout/NetworkStatus";
import {
  useSeedlingRequests,
  SeedlingRequest,
  SeedlingRequestInput,
} from "@/hooks/urban/useSeedlingRequests";
import { SeedlingRequestTable } from "@/presentation/roles/urban/components/seedlings/SeedlingRequestTable";
import { SeedlingRequestModals } from "@/presentation/roles/urban/components/seedlings/SeedlingRequestModals";
import {
  FileDown,
  Plus,
  AlertTriangle,
  Search,
  CalendarIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/presentation/components/shared/ui/alert";
import { Card, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Calendar } from "@/presentation/components/shared/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/presentation/components/shared/ui/popover";

export default function SeedlingRequests() {
  // Modal and dialog states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<SeedlingRequest | null>(null);

  // Date range for filtering
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  // Get seedling requests data and actions from our custom hook
  const {
    seedlingRequests,
    isLoading,
    error,
    filters,
    setFilter,
    resetFilters,
    addSeedlingRequest,
    updateSeedlingRequest,
    deleteSeedlingRequest,
  } = useSeedlingRequests();

  // Search state
  const [search, setSearch] = useState("");

  // Update filters when search or date range changes
  useEffect(() => {
    const handler = setTimeout(() => {
      const startDate = dateFrom ? format(dateFrom, "yyyy-MM-dd") : "";
      const endDate = dateTo ? format(dateTo, "yyyy-MM-dd") : "";

      setFilter("searchQuery", search);
      setFilter("dateRange", { start: startDate, end: endDate });
    }, 300);

    return () => clearTimeout(handler);
  }, [search, dateFrom, dateTo, setFilter]);

  // Handle viewing request details
  const handleViewRequest = useCallback((request: SeedlingRequest) => {
    setSelectedRequest(request);
    setViewModalOpen(true);
  }, []);

  // Handle editing request
  const handleEditRequest = useCallback((request: SeedlingRequest) => {
    setSelectedRequest(request);
    setEditModalOpen(true);
  }, []);

  // Handle deleting request confirmation
  const handleDeleteConfirm = useCallback((request: SeedlingRequest) => {
    setSelectedRequest(request);
    setDeleteDialogOpen(true);
  }, []);

  // Handle saving edited request
  const handleSaveEdit = async (requestData: SeedlingRequestInput) => {
    if (!selectedRequest) return;
    const success = await updateSeedlingRequest(
      selectedRequest.id,
      requestData
    );
    if (success) {
      setEditModalOpen(false);
      setSelectedRequest(null);
    }
  };

  // Handle adding new request
  const handleAddRequest = async (requestData: SeedlingRequestInput) => {
    const success = await addSeedlingRequest(requestData);
    if (success) {
      setAddModalOpen(false);
    }
  };

  // Handle deleting request
  const handleDeleteRequest = async () => {
    if (!selectedRequest) return;
    const success = await deleteSeedlingRequest(selectedRequest.id);
    if (success) {
      setDeleteDialogOpen(false);
      setSelectedRequest(null);
    }
  };

  // Export seedling requests to CSV
  const handleExportToCSV = () => {
    if (seedlingRequests.length === 0) {
      toast.warning("No seedling request data to export");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date Received,Requester Name,Address,Total Items,Notes\n";

    seedlingRequests.forEach((request) => {
      const totalItems = request.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const notes = request.notes ? request.notes.replace(/"/g, '""') : "";

      csvContent += `"${format(
        new Date(request.dateReceived),
        "yyyy-MM-dd"
      )}","${request.requesterName.replace(
        /"/g,
        '""'
      )}","${request.address.replace(
        /"/g,
        '""'
      )}","${totalItems}","${notes}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `seedling_requests_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Seedling request data exported successfully");
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearch("");
    setDateFrom(undefined);
    setDateTo(undefined);
    resetFilters();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="tree-management" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardNavbar />
          {/* Header Section */}
          <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              Seedling Requests
            </h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setAddModalOpen(true)}
                className="hidden md:inline-flex"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Request
              </Button>
              <Button
                onClick={handleExportToCSV}
                variant="outline"
                size="icon"
                disabled={seedlingRequests.length === 0 || isLoading}
              >
                <FileDown className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Body Section */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
            {/* Controls Row: Search left, Filters right */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              {/* Search (left) */}
              <div className="relative flex items-center w-full md:w-auto justify-start bg-white rounded-md">
                <Search className="absolute left-3 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by requester name or address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 max-w-xs w-[320px] bg-white"
                />
              </div>
              {/* Date Filters (right) */}
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-2">
                  {/* From Date Picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`w-[150px] justify-start text-left font-normal ${
                          !dateFrom && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP") : "From date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* To Date Picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`w-[150px] justify-start text-left font-normal ${
                          !dateTo && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP") : "To date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                        disabled={(date) =>
                          dateFrom ? date < dateFrom : false
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Clear Filters */}
                {(search || dateFrom || dateTo) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-9"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Error Notice */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  There was a problem loading the seedling requests data. Please
                  try again later.
                </AlertDescription>
              </Alert>
            )}

            {/* Mobile Add Button */}
            <div className="md:hidden mb-4">
              <Button onClick={() => setAddModalOpen(true)} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Seedling Request
              </Button>
            </div>

            {/* Seedling Requests Table */}
            <Card>
              <CardContent className="p-6">
                <SeedlingRequestTable
                  requests={seedlingRequests}
                  isLoading={isLoading}
                  onView={handleViewRequest}
                  onEdit={handleEditRequest}
                  onDelete={handleDeleteConfirm}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals and Dialogs */}
      <SeedlingRequestModals
        isAddModalOpen={addModalOpen}
        onAddModalClose={() => setAddModalOpen(false)}
        onAddRequest={handleAddRequest}
        isEditModalOpen={editModalOpen}
        onEditModalClose={() => {
          setEditModalOpen(false);
          setSelectedRequest(null);
        }}
        onEditRequest={handleSaveEdit}
        isViewModalOpen={viewModalOpen}
        onViewModalClose={() => {
          setViewModalOpen(false);
          setSelectedRequest(null);
        }}
        isDeleteDialogOpen={deleteDialogOpen}
        onDeleteDialogClose={() => {
          setDeleteDialogOpen(false);
          setSelectedRequest(null);
        }}
        onDeleteRequest={handleDeleteRequest}
        selectedRequest={selectedRequest}
        isSubmitting={isLoading}
      />

      <NetworkStatus />
    </SidebarProvider>
  );
}
