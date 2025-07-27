import React, { useMemo, useState, useCallback, useEffect, memo } from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    PaginationState,
    RowSelectionState,
    Column,
    Table as TanStackTable,
} from '@tanstack/react-table';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/presentation/components/shared/ui/table';
import { Button } from '@/presentation/components/shared/ui/button';
import { Input } from '@/presentation/components/shared/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/presentation/components/shared/ui/select';
import { Checkbox } from '@/presentation/components/shared/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/presentation/components/shared/ui/dropdown-menu';
import { Badge } from '@/presentation/components/shared/ui/badge';
import { Skeleton } from '@/presentation/components/shared/ui/skeleton';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Search,
    Filter,
    Eye,
    EyeOff,
    MoreHorizontal,
    Download,
    RefreshCw,
    X,
    Check,
} from 'lucide-react';
import { cn } from '@/core/utils/utils';

// Types
export interface DataGridColumn<T> extends Omit<ColumnDef<T>, 'id'> {
    id: string;
    title: string;
    field?: keyof T;
    sortable?: boolean;
    filterable?: boolean;
    editable?: boolean;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    type?: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'currency' | 'custom';
    selectOptions?: { value: string; label: string }[];
    formatValue?: (value: any) => string;
    renderCell?: (value: any, row: T) => React.ReactNode;
    renderEditCell?: (value: any, row: T, onSave: (value: any) => void, onCancel: () => void) => React.ReactNode;
}

export interface DataGridProps<T> {
    data: T[];
    columns: DataGridColumn<T>[];
    loading?: boolean;
    error?: string | null;
    pageSize?: number;
    pageSizeOptions?: number[];
    enableRowSelection?: boolean;
    enableMultiRowSelection?: boolean;
    enableGlobalSearch?: boolean;
    enableColumnFilters?: boolean;
    enableSorting?: boolean;
    enablePagination?: boolean;
    enableColumnVisibility?: boolean;
    enableExport?: boolean;
    enableRefresh?: boolean;
    onRowSelect?: (selectedRows: T[]) => void;
    onCellEdit?: (rowId: string | number, field: keyof T, value: any) => Promise<void>;
    onRefresh?: () => void;
    onExport?: (data: T[]) => void;
    className?: string;
    emptyStateMessage?: string;
    queryKey?: string[];
    optimisticUpdates?: boolean;
    // FastAPI-specific props
    totalCount?: number;
    serverSidePagination?: boolean;
    onPageChange?: (page: number, pageSize: number) => void;
    onSortChange?: (field: string, direction: 'asc' | 'desc' | null) => void;
    onFilterChange?: (filters: Record<string, any>) => void;
}

// Individual cell editor components - memoized for performance
const TextEditor = memo<{
    value: any;
    onSave: (value: any) => void;
    onCancel: () => void;
}>(({ value, onSave, onCancel }) => {
    const [editValue, setEditValue] = useState(value?.toString() || '');

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onSave(editValue);
        } else if (e.key === 'Escape') {
            onCancel();
        }
    }, [editValue, onSave, onCancel]);

    const handleSave = useCallback(() => {
        onSave(editValue);
    }, [editValue, onSave]);

    return (
        <div className="flex items-center gap-1">
            <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 text-sm"
                autoFocus
            />
            <Button
                size="sm"
                variant="ghost"
                onClick={handleSave}
                className="h-8 w-8 p-0"
            >
                <Check className="h-4 w-4" />
            </Button>
            <Button
                size="sm"
                variant="ghost"
                onClick={onCancel}
                className="h-8 w-8 p-0"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
});

const NumberEditor = memo<{
    value: any;
    onSave: (value: any) => void;
    onCancel: () => void;
}>(({ value, onSave, onCancel }) => {
    const [editValue, setEditValue] = useState(value?.toString() || '');

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const numValue = parseFloat(editValue);
            onSave(isNaN(numValue) ? 0 : numValue);
        } else if (e.key === 'Escape') {
            onCancel();
        }
    }, [editValue, onSave, onCancel]);

    const handleSave = useCallback(() => {
        const numValue = parseFloat(editValue);
        onSave(isNaN(numValue) ? 0 : numValue);
    }, [editValue, onSave]);

    return (
        <div className="flex items-center gap-1">
            <Input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 text-sm"
                autoFocus
            />
            <Button
                size="sm"
                variant="ghost"
                onClick={handleSave}
                className="h-8 w-8 p-0"
            >
                <Check className="h-4 w-4" />
            </Button>
            <Button
                size="sm"
                variant="ghost"
                onClick={onCancel}
                className="h-8 w-8 p-0"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
});

const SelectEditor = memo<{
    value: any;
    options: { value: string; label: string }[];
    onSave: (value: any) => void;
    onCancel: () => void;
}>(({ value, options, onSave, onCancel }) => {
    return (
        <div className="flex items-center gap-1">
            <Select defaultValue={value?.toString()} onValueChange={onSave}>
                <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button
                size="sm"
                variant="ghost"
                onClick={onCancel}
                className="h-8 w-8 p-0"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
});

// Column filter component - memoized for performance
const ColumnFilter = memo<{
    column: Column<any, any>;
    title: string;
}>(({ column, title }) => {
    const columnFilterValue = column.getFilterValue() as string | undefined;

    const handleClearFilter = useCallback(() => {
        column.setFilterValue('');
    }, [column]);

    const handleFilterChange = useCallback((value: string) => {
        column.setFilterValue(value);
    }, [column]);

    return (
        <div className="flex items-center space-x-2">
            <Input
                placeholder={`Filter ${title}...`}
                value={columnFilterValue ?? ''}
                onChange={(event) => handleFilterChange(event.target.value)}
                className="h-8 w-[150px] lg:w-[250px]"
            />
            {columnFilterValue && (
                <Button
                    variant="ghost"
                    onClick={handleClearFilter}
                    className="h-8 w-8 p-0"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
});

// Memoized pagination controls for better performance
const PaginationControls = memo<{
    table: TanStackTable<any>;
}>(({ table }) => {
    const handleFirstPage = useCallback(() => {
        table.setPageIndex(0);
    }, [table]);

    const handlePreviousPage = useCallback(() => {
        table.previousPage();
    }, [table]);

    const handleNextPage = useCallback(() => {
        table.nextPage();
    }, [table]);

    const handleLastPage = useCallback(() => {
        table.setPageIndex(table.getPageCount() - 1);
    }, [table]);

    return (
        <div className="flex items-center space-x-2">
            <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={handleFirstPage}
                disabled={!table.getCanPreviousPage()}
            >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handlePreviousPage}
                disabled={!table.getCanPreviousPage()}
            >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handleNextPage}
                disabled={!table.getCanNextPage()}
            >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={handleLastPage}
                disabled={!table.getCanNextPage()}
            >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
            </Button>
        </div>
    );
});

// Main DataGrid component
export function DataGrid<T extends Record<string, any>>({
    data,
    columns,
    loading = false,
    error = null,
    pageSize = 10,
    pageSizeOptions = [10, 20, 30, 40, 50],
    enableRowSelection = false,
    enableMultiRowSelection = true,
    enableGlobalSearch = true,
    enableColumnFilters = true,
    enableSorting = true,
    enablePagination = true,
    enableColumnVisibility = true,
    enableExport = false,
    enableRefresh = false,
    onRowSelect,
    onCellEdit,
    onRefresh,
    onExport,
    className,
    emptyStateMessage = 'No data available',
    queryKey,
    optimisticUpdates = false,
    // FastAPI-specific props
    totalCount,
    serverSidePagination = false,
    onPageChange,
    onSortChange,
    onFilterChange,
}: DataGridProps<T>) {
    // State management
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [globalFilter, setGlobalFilter] = useState('');
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize,
    });
    const [editingCell, setEditingCell] = useState<{
        rowId: string;
        columnId: string;
    } | null>(null);

    // Debounced global filter for better performance
    const [debouncedGlobalFilter] = useDebounce(globalFilter, 300);

    // TanStack Query setup for optimistic updates - optimized for FastAPI backend
    const queryClient = useQueryClient();

    // Memoized mutation to prevent recreation on every render
    const updateCellMutation = useMutation({
        mutationFn: async ({ rowId, field, value }: { rowId: string | number; field: keyof T; value: any }) => {
            if (onCellEdit) {
                await onCellEdit(rowId, field, value);
            }
        },
        onMutate: async ({ rowId, field, value }) => {
            if (optimisticUpdates && queryKey) {
                // Cancel outgoing refetches to prevent race conditions
                await queryClient.cancelQueries({ queryKey });

                // Snapshot the previous value for rollback
                const previousData = queryClient.getQueryData(queryKey);

                // Optimistically update the local cache immediately
                queryClient.setQueryData(queryKey, (old: any) => {
                    if (!old) return old;

                    // Handle different response structures from FastAPI
                    const currentData = old.data || old;
                    if (Array.isArray(currentData)) {
                        return {
                            ...old,
                            data: currentData.map((row: T) =>
                                (row.id || row._id) === rowId ? { ...row, [field]: value } : row
                            )
                        };
                    }
                    return old;
                });

                return { previousData };
            }
        },
        onError: (err, variables, context) => {
            // Rollback optimistic update on error
            if (context?.previousData && queryKey) {
                queryClient.setQueryData(queryKey, context.previousData);
            }
            console.error('Failed to update cell:', err);
        },
        onSuccess: () => {
            // Only invalidate the cache without refetching when using optimistic updates
            if (queryKey && optimisticUpdates) {
                queryClient.invalidateQueries({
                    queryKey,
                    refetchType: 'none'
                });
            }
        },
        onSettled: () => {
            // For non-optimistic updates, only invalidate specific data
            if (queryKey && !optimisticUpdates) {
                queryClient.invalidateQueries({
                    queryKey,
                    refetchType: 'none'
                });
            }
        },
    });

    // Memoized callbacks to prevent recreation on every render
    const handleRowSelectionChange = useCallback((updater: any) => {
        setRowSelection(updater);
    }, []);

    const handleSortingChange = useCallback((updater: any) => {
        setSorting(updater);

        // Notify parent component for server-side sorting
        if (onSortChange && typeof updater === 'function') {
            const newSorting = updater(sorting);
            if (newSorting.length > 0) {
                const sortField = newSorting[0];
                onSortChange(sortField.id, sortField.desc ? 'desc' : 'asc');
            } else {
                onSortChange('', null);
            }
        }
    }, [sorting, onSortChange]);

    const handleColumnFiltersChange = useCallback((updater: any) => {
        setColumnFilters(updater);

        // Notify parent component for server-side filtering
        if (onFilterChange && typeof updater === 'function') {
            const newFilters = updater(columnFilters);
            const filterObj = newFilters.reduce((acc: any, filter: any) => {
                acc[filter.id] = filter.value;
                return acc;
            }, {});
            onFilterChange(filterObj);
        }
    }, [columnFilters, onFilterChange]);

    const handleColumnVisibilityChange = useCallback((updater: any) => {
        setColumnVisibility(updater);
    }, []);

    const handlePaginationChange = useCallback((updater: any) => {
        setPagination(updater);

        // Notify parent component for server-side pagination
        if (onPageChange && typeof updater === 'function') {
            const newPagination = updater(pagination);
            onPageChange(newPagination.pageIndex, newPagination.pageSize);
        }
    }, [pagination, onPageChange]);

    const handleGlobalFilterChange = useCallback((value: string) => {
        setGlobalFilter(value);

        // Reset to first page when searching
        if (enablePagination) {
            setPagination(prev => ({ ...prev, pageIndex: 0 }));
        }
    }, [enablePagination]);

    // Stable reference for cell edit handlers - optimized for FastAPI
    const cellEditHandlers = useMemo(() => ({
        handleSave: async (rowId: string, field: keyof T, newValue: any) => {
            try {
                // Prevent double-execution and page reloads
                if (updateCellMutation.isPending) {
                    return;
                }

                await updateCellMutation.mutateAsync({
                    rowId,
                    field,
                    value: newValue,
                });
                setEditingCell(null);
            } catch (error) {
                console.error('Failed to update cell:', error);
                // Don't clear editing state on error - let user retry
            }
        },
        handleCancel: () => {
            setEditingCell(null);
        },
        setEditingCell,
    }), [updateCellMutation]);

    // Transform columns for TanStack Table - heavily optimized memoization
    const tableColumns = useMemo<ColumnDef<T>[]>(() => {
        const transformedColumns: ColumnDef<T>[] = [];

        // Add selection column if enabled
        if (enableRowSelection) {
            transformedColumns.push({
                id: 'select',
                header: ({ table }) => (
                    enableMultiRowSelection ? (
                        <Checkbox
                            checked={table.getIsAllPageRowsSelected()}
                            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                            aria-label="Select all"
                        />
                    ) : null
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
                size: 40,
            });
        }

        // Transform user-defined columns
        columns.forEach((col) => {
            const columnDef: ColumnDef<T> = {
                id: col.id,
                accessorKey: col.field as string,
                header: ({ column }) => {
                    const canSort = col.sortable !== false && enableSorting;

                    return (
                        <div className="flex items-center space-x-2">
                            {canSort ? (
                                <Button
                                    variant="ghost"
                                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                                    className="h-8 p-0 font-medium"
                                >
                                    {col.title}
                                    {column.getIsSorted() === 'asc' ? (
                                        <ArrowUp className="ml-2 h-4 w-4" />
                                    ) : column.getIsSorted() === 'desc' ? (
                                        <ArrowDown className="ml-2 h-4 w-4" />
                                    ) : (
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    )}
                                </Button>
                            ) : (
                                <span className="font-medium">{col.title}</span>
                            )}
                        </div>
                    );
                },
                cell: ({ row, column, getValue }) => {
                    const value = getValue();
                    // Support different ID field names for FastAPI compatibility
                    const rowId = row.original.id || row.original._id || row.id;
                    const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === column.id;

                    // Handle editing state
                    if (isEditing && col.editable && onCellEdit) {
                        const handleSave = (newValue: any) => {
                            // Prevent multiple saves and ensure proper type conversion
                            cellEditHandlers.handleSave(String(rowId), col.field!, newValue);
                        };

                        // Custom edit cell renderer
                        if (col.renderEditCell) {
                            return col.renderEditCell(value, row.original, handleSave, cellEditHandlers.handleCancel);
                        }

                        // Default edit cell renderers by type
                        switch (col.type) {
                            case 'number':
                            case 'currency':
                                return <NumberEditor value={value} onSave={handleSave} onCancel={cellEditHandlers.handleCancel} />;
                            case 'select':
                                return (
                                    <SelectEditor
                                        value={value}
                                        options={col.selectOptions || []}
                                        onSave={handleSave}
                                        onCancel={cellEditHandlers.handleCancel}
                                    />
                                );
                            default:
                                return <TextEditor value={value} onSave={handleSave} onCancel={cellEditHandlers.handleCancel} />;
                        }
                    }

                    // Handle display state
                    const handleCellClick = () => {
                        if (col.editable && onCellEdit && !isEditing) {
                            cellEditHandlers.setEditingCell({ rowId: String(rowId), columnId: column.id });
                        }
                    };

                    let displayValue = value;

                    // Format value based on type
                    if (col.formatValue) {
                        displayValue = col.formatValue(value);
                    } else {
                        switch (col.type) {
                            case 'currency':
                                displayValue = typeof value === 'number' ? `₱${value.toLocaleString()}` : value;
                                break;
                            case 'date':
                                displayValue = value ? new Date(value as string | number | Date).toLocaleDateString() : '';
                                break;
                            case 'boolean':
                                displayValue = value ? 'Yes' : 'No';
                                break;
                        }
                    }

                    // Custom cell renderer
                    if (col.renderCell) {
                        return (
                            <div
                                onClick={handleCellClick}
                                className={cn(
                                    col.editable && onCellEdit ? 'cursor-pointer hover:bg-gray-50' : '',
                                    'min-h-[32px] flex items-center'
                                )}
                            >
                                {col.renderCell(value, row.original)}
                            </div>
                        );
                    }

                    return (
                        <div
                            onClick={handleCellClick}
                            className={cn(
                                col.editable && onCellEdit ? 'cursor-pointer hover:bg-gray-50' : '',
                                'min-h-[32px] flex items-center'
                            )}
                        >
                            {displayValue as React.ReactNode}
                        </div>
                    );
                },
                enableSorting: col.sortable !== false && enableSorting,
                enableHiding: true,
                size: col.width,
                minSize: col.minWidth,
                maxSize: col.maxWidth,
            };

            transformedColumns.push(columnDef);
        });

        return transformedColumns;
    }, [
        columns,
        enableRowSelection,
        enableMultiRowSelection,
        enableSorting,
        editingCell,
        onCellEdit,
        cellEditHandlers,
    ]);

    // Create table instance with memoized configuration
    const tableConfig = useMemo(() => ({
        data: data || [],
        columns: tableColumns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter: debouncedGlobalFilter,
            pagination,
        },
        pageCount: serverSidePagination ? Math.ceil((totalCount || 0) / pagination.pageSize) : undefined,
        manualPagination: serverSidePagination,
        manualSorting: !!onSortChange,
        manualFiltering: !!onFilterChange,
        enableRowSelection: enableRowSelection,
        enableMultiRowSelection: enableMultiRowSelection,
        onSortingChange: handleSortingChange,
        onColumnFiltersChange: handleColumnFiltersChange,
        onColumnVisibilityChange: handleColumnVisibilityChange,
        onRowSelectionChange: handleRowSelectionChange,
        onGlobalFilterChange: handleGlobalFilterChange,
        onPaginationChange: handlePaginationChange,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: (enableColumnFilters || enableGlobalSearch) && !onFilterChange ? getFilteredRowModel() : undefined,
        getPaginationRowModel: enablePagination && !serverSidePagination ? getPaginationRowModel() : undefined,
        getSortedRowModel: enableSorting && !onSortChange ? getSortedRowModel() : undefined,
        globalFilterFn: 'includesString' as const,
    }), [
        data,
        tableColumns,
        sorting,
        columnFilters,
        columnVisibility,
        rowSelection,
        debouncedGlobalFilter,
        pagination,
        serverSidePagination,
        totalCount,
        enableRowSelection,
        enableMultiRowSelection,
        enableColumnFilters,
        enableGlobalSearch,
        enablePagination,
        enableSorting,
        onSortChange,
        onFilterChange,
        handleSortingChange,
        handleColumnFiltersChange,
        handleColumnVisibilityChange,
        handleRowSelectionChange,
        handleGlobalFilterChange,
        handlePaginationChange,
    ]);

    const table = useReactTable(tableConfig);

    // Memoized selected rows calculation to prevent excessive recalculations
    const selectedRows = useMemo(() => {
        if (!enableRowSelection) return [];
        return table.getFilteredSelectedRowModel().rows.map(row => row.original);
    }, [table, enableRowSelection, rowSelection]);

    // Handle row selection callback with debounced execution
    useEffect(() => {
        if (onRowSelect && enableRowSelection) {
            onRowSelect(selectedRows);
        }
    }, [selectedRows, onRowSelect, enableRowSelection]);

    // Clear editing state when data changes
    useEffect(() => {
        setEditingCell(null);
    }, [data]);

    // Memoized toolbar handlers
    const toolbarHandlers = useMemo(() => ({
        handleRefresh: () => {
            if (onRefresh) {
                onRefresh();
            }
        },
        handleExport: () => {
            if (onExport) {
                onExport(table.getFilteredRowModel().rows.map(row => row.original));
            }
        },
        handleClearSelection: () => {
            setRowSelection({});
        },
        handleGlobalSearchChange: (value: string) => {
            setGlobalFilter(value);
        },
    }), [onRefresh, onExport, table]);

    if (error) {
        return (
            <div className="flex items-center justify-center h-32 text-red-600">
                <p>Error loading data: {error}</p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)}>
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    {/* Global Search */}
                    {enableGlobalSearch && (
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search all columns..."
                                value={globalFilter ?? ''}
                                onChange={(event) => toolbarHandlers.handleGlobalSearchChange(event.target.value)}
                                className="pl-8 w-[250px]"
                            />
                        </div>
                    )}

                    {/* Column Filters */}
                    {enableColumnFilters && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filter
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[300px]">
                                <div className="space-y-2 p-2">
                                    {table.getAllColumns()
                                        .filter((column) => column.getCanFilter())
                                        .map((column) => {
                                            const columnDef = columns.find(col => col.id === column.id);
                                            return (
                                                <ColumnFilter
                                                    key={column.id}
                                                    column={column}
                                                    title={columnDef?.title || column.id}
                                                />
                                            );
                                        })}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    {/* Refresh Button */}
                    {enableRefresh && onRefresh && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toolbarHandlers.handleRefresh}
                            disabled={loading}
                        >
                            <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
                            Refresh
                        </Button>
                    )}

                    {/* Export Button */}
                    {enableExport && onExport && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toolbarHandlers.handleExport}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    )}

                    {/* Column Visibility */}
                    {enableColumnVisibility && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    View
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => {
                                        const columnDef = columns.find(col => col.id === column.id);
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                            >
                                                {columnDef?.title || column.id}
                                            </DropdownMenuCheckboxItem>
                                        );
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Selection Info */}
            {enableRowSelection && Object.keys(rowSelection).length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {selectedRows.length} of{' '}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toolbarHandlers.handleClearSelection}
                    >
                        Clear selection
                    </Button>
                </div>
            )}

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        style={{ width: header.getSize() }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            // Loading skeleton
                            Array.from({ length: pageSize }).map((_, index) => (
                                <TableRow key={index}>
                                    {tableColumns.map((_, colIndex) => (
                                        <TableCell key={colIndex}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className={cn(
                                        row.getIsSelected() && 'bg-muted/50',
                                        'hover:bg-muted/25'
                                    )}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            style={{ width: cell.column.getSize() }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                                    {emptyStateMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {enablePagination && (
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Rows per page</p>
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value));
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {pageSizeOptions.map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                            Page {table.getState().pagination.pageIndex + 1} of{' '}
                            {serverSidePagination
                                ? Math.ceil((totalCount || 0) / table.getState().pagination.pageSize) || 1
                                : table.getPageCount()
                            }
                        </div>
                    </div>
                    <PaginationControls table={table} />
                </div>
            )}
        </div>
    );
}

export default DataGrid;
