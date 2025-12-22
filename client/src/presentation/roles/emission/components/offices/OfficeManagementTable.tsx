import { useState, useMemo, memo, useCallback } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/presentation/components/shared/ui/dropdown-menu";
import { Button } from "@/presentation/components/shared/ui/button";
import { Badge } from "@/presentation/components/shared/ui/badge";
import {
    AlertCircle,
    Info,
    MoreHorizontal,
    Edit,
    Trash,
    Plus,
    Building2,
} from "lucide-react";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/presentation/components/shared/ui/alert";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import {
    Office,
    useOffices,
    useCreateOffice,
    useUpdateOffice,
    useDeleteOffice
} from "@/core/api/emission-service";
import { format } from "date-fns";
import { OfficeModal } from "./OfficeModal";

interface OfficeManagementTableProps {
    searchTerm?: string;
}

export function OfficeManagementTable({
    searchTerm
}: OfficeManagementTableProps) {
    // Fetch offices
    const { data: officesResponse, isLoading, error, refetch } = useOffices(searchTerm);

    // Mutations
    const createOfficeMutation = useCreateOffice();
    const updateOfficeMutation = useUpdateOffice();
    const deleteOfficeMutation = useDeleteOffice();

    // Local state
    const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOffice, setEditingOffice] = useState<Office | null>(null);

    // Handler for row click
    const handleRowClick = useCallback((row: Row<Office>) => {
        setSelectedOffice(row.original);
    }, []);

    // Handler for add office
    const handleAddOffice = useCallback(() => {
        setEditingOffice(null);
        setIsModalOpen(true);
    }, []);

    // Handler for edit
    const handleEdit = useCallback((office: Office) => {
        setEditingOffice(office);
        setIsModalOpen(true);
    }, []);

    // Handler for delete
    const handleDelete = useCallback(async (office: Office) => {
        if (confirm(`Are you sure you want to delete "${office.name}"?`)) {
            try {
                await deleteOfficeMutation.mutateAsync(office.id);
                refetch();
            } catch (error) {
                console.error("Failed to delete office:", error);
            }
        }
    }, [deleteOfficeMutation, refetch]);

    // Handler for modal success
    const handleModalSuccess = useCallback(() => {
        refetch();
    }, [refetch]);

    // Table columns
    const columns = useMemo<ColumnDef<Office, any>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Office Name",
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{row.original.name}</span>
                    </div>
                ),
            },
            {
                accessorKey: "address",
                header: "Address",
                cell: ({ row }) => (
                    <span className="text-muted-foreground">
                        {row.original.address || "No address"}
                    </span>
                ),
            },
            {
                accessorKey: "contact_number",
                header: "Contact",
                cell: ({ row }) => (
                    <span className="text-muted-foreground">
                        {row.original.contact_number || "No contact"}
                    </span>
                ),
            },
            {
                accessorKey: "email",
                header: "Email",
                cell: ({ row }) => (
                    <span className="text-muted-foreground">
                        {row.original.email || "No email"}
                    </span>
                ),
            },
            {
                accessorKey: "created_at",
                header: "Created",
                cell: ({ row }) => (
                    <span className="text-sm">
                        {format(new Date(row.original.created_at), "MMM dd, yyyy")}
                    </span>
                ),
            },
            {
                id: "actions",
                header: () => <div className="text-right">Actions</div>,
                cell: ({ row }) => (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleDelete(row.original)}
                                    className="text-red-600"
                                >
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
            },
        ],
        [handleEdit, handleDelete]
    );

    // Handle error state
    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error loading offices</AlertTitle>
                <AlertDescription>
                    {(error as Error).message}
                </AlertDescription>
            </Alert>
        );
    }

    // Handle empty state
    if (!isLoading && (!officesResponse?.offices || officesResponse.offices.length === 0)) {
        return (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No offices found</AlertTitle>
                <AlertDescription>
                    There are no offices in the system. Create one to get started.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-4">
            <DataTable
                columns={columns}
                data={officesResponse?.offices || []}
                isLoading={isLoading}
                showDensityToggle={true}
                showColumnVisibility={true}
                showPagination={true}
                defaultPageSize={10}
                loadingMessage="Loading offices..." 
                emptyMessage="No offices found for the selected filters."
                onRowClick={handleRowClick}
                defaultDensity="normal"
            />

            <OfficeModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                office={editingOffice}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}

export default OfficeManagementTable;
