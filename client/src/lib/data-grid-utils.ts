/**
 * Utility functions for DataGrid component
 */

import React from "react";
import { DataGridColumn } from "@/presentation/components/shared/ui/data-grid";

// CSV Export utilities
export const convertToCSV = (
  data: any[],
  columns?: DataGridColumn<any>[]
): string => {
  if (!data.length) return "";

  // Use column definitions if provided, otherwise infer from data
  const headers = columns
    ? columns
        .filter((col) => col.field)
        .map((col) => ({ key: col.field as string, title: col.title }))
    : Object.keys(data[0]).map((key) => ({ key, title: key }));

  const csvContent = [
    // Header row
    headers.map((h) => h.title).join(","),
    // Data rows
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header.key];
          // Handle different data types
          if (value === null || value === undefined) return "";
          if (typeof value === "string")
            return `"${value.replace(/"/g, '""')}"`;
          if (typeof value === "object")
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  return csvContent;
};

export const downloadCSV = (csv: string, filename: string): void => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Excel Export (requires installing xlsx package: npm install xlsx @types/xlsx)
export const exportToExcel = async (
  data: any[],
  filename: string,
  columns?: DataGridColumn<any>[]
) => {
  console.warn(
    "Excel export requires xlsx package. Install with: npm install xlsx @types/xlsx"
  );
  // Fallback to CSV for now
  const csv = convertToCSV(data, columns);
  downloadCSV(csv, filename.replace(".xlsx", ".csv"));
};

// Status badge utilities
export const getStatusBadgeVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  const lowerStatus = status.toLowerCase();

  if (
    ["completed", "paid", "active", "approved", "success"].includes(lowerStatus)
  ) {
    return "default";
  }

  if (
    ["pending", "in-progress", "processing", "warning"].includes(lowerStatus)
  ) {
    return "outline";
  }

  if (
    ["rejected", "failed", "error", "overdue", "cancelled"].includes(
      lowerStatus
    )
  ) {
    return "destructive";
  }

  return "secondary";
};

export const getStatusColor = (status: string): string => {
  const lowerStatus = status.toLowerCase();

  if (
    ["completed", "paid", "active", "approved", "success", "healthy"].includes(
      lowerStatus
    )
  ) {
    return "bg-green-100 text-green-800";
  }

  if (
    ["pending", "in-progress", "processing", "warning"].includes(lowerStatus)
  ) {
    return "bg-yellow-100 text-yellow-800";
  }

  if (
    [
      "rejected",
      "failed",
      "error",
      "overdue",
      "cancelled",
      "dead",
      "damaged",
    ].includes(lowerStatus)
  ) {
    return "bg-red-100 text-red-800";
  }

  if (["in-progress", "maintained", "processing"].includes(lowerStatus)) {
    return "bg-blue-100 text-blue-800";
  }

  return "bg-gray-100 text-gray-800";
};

// Data formatting utilities
export const formatCurrency = (amount: number, currency = "₱"): string => {
  return `${currency}${amount.toLocaleString()}`;
};

export const formatDate = (
  date: string | Date,
  format: "short" | "long" | "time" = "short"
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  switch (format) {
    case "long":
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    case "time":
      return dateObj.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    default:
      return dateObj.toLocaleDateString();
  }
};

export const formatNumber = (num: number, decimals = 0): string => {
  return num.toLocaleString(undefined, { maximumFractionDigits: decimals });
};

export const formatBoolean = (
  value: boolean,
  trueText = "Yes",
  falseText = "No"
): string => {
  return value ? trueText : falseText;
};

// Column generator utilities
export const createTextColumn = <T>(
  id: string,
  title: string,
  field: keyof T,
  options: Partial<DataGridColumn<T>> = {}
): DataGridColumn<T> => ({
  id,
  title,
  field,
  type: "text",
  sortable: true,
  filterable: true,
  ...options,
});

export const createNumberColumn = <T>(
  id: string,
  title: string,
  field: keyof T,
  options: Partial<DataGridColumn<T>> = {}
): DataGridColumn<T> => ({
  id,
  title,
  field,
  type: "number",
  sortable: true,
  filterable: false,
  ...options,
});

export const createCurrencyColumn = <T>(
  id: string,
  title: string,
  field: keyof T,
  options: Partial<DataGridColumn<T>> = {}
): DataGridColumn<T> => ({
  id,
  title,
  field,
  type: "currency",
  sortable: true,
  filterable: false,
  ...options,
});

export const createDateColumn = <T>(
  id: string,
  title: string,
  field: keyof T,
  options: Partial<DataGridColumn<T>> = {}
): DataGridColumn<T> => ({
  id,
  title,
  field,
  type: "date",
  sortable: true,
  filterable: false,
  ...options,
});

export const createSelectColumn = <T>(
  id: string,
  title: string,
  field: keyof T,
  selectOptions: { value: string; label: string }[],
  options: Partial<DataGridColumn<T>> = {}
): DataGridColumn<T> => ({
  id,
  title,
  field,
  type: "select",
  selectOptions,
  sortable: true,
  filterable: true,
  ...options,
});

export const createBooleanColumn = <T>(
  id: string,
  title: string,
  field: keyof T,
  options: Partial<DataGridColumn<T>> = {}
): DataGridColumn<T> => ({
  id,
  title,
  field,
  type: "boolean",
  sortable: true,
  filterable: false,
  formatValue: (value: boolean) => formatBoolean(value),
  ...options,
});

export const createStatusColumn = <T>(
  id: string,
  title: string,
  field: keyof T,
  statusOptions: { value: string; label: string }[],
  options: Partial<DataGridColumn<T>> = {}
): DataGridColumn<T> => ({
  id,
  title,
  field,
  type: "select",
  selectOptions: statusOptions,
  sortable: true,
  filterable: true,
  renderCell: (value: string) => {
    const option = statusOptions.find((opt) => opt.value === value);
    return React.createElement(
      "span",
      {
        className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
          value
        )}`,
      },
      option?.label || value
    );
  },
  ...options,
});

export const createActionsColumn = <T>(
  actions: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (row: T) => void;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    show?: (row: T) => boolean;
  }>,
  options: Partial<DataGridColumn<T>> = {}
): DataGridColumn<T> => ({
  id: "actions",
  title: "Actions",
  renderCell: (_, row) =>
    React.createElement(
      "div",
      { className: "flex items-center gap-1" },
      actions
        .filter((action) => !action.show || action.show(row))
        .map((action, index) => {
          const IconComponent = action.icon;
          return React.createElement(
            "button",
            {
              key: index,
              onClick: () => action.onClick(row),
              className: `inline-flex items-center px-2 py-1 text-xs font-medium rounded-md transition-colors hover:bg-gray-100 ${
                action.variant === "destructive"
                  ? "text-red-600 hover:bg-red-50"
                  : "text-gray-600"
              }`,
              title: action.label,
            },
            IconComponent &&
              React.createElement(IconComponent, { className: "w-4 h-4" }),
            React.createElement("span", { className: "sr-only" }, action.label)
          );
        })
    ),
  sortable: false,
  filterable: false,
  width: actions.length * 40 + 20,
  ...options,
});

// Search and filter utilities
export const createGlobalFilter = (data: any[], searchTerm: string): any[] => {
  if (!searchTerm) return data;

  const lowercaseSearch = searchTerm.toLowerCase();

  return data.filter((row) =>
    Object.values(row).some((value) => {
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(lowercaseSearch);
    })
  );
};

export const createColumnFilter = (
  data: any[],
  columnId: string,
  filterValue: string
): any[] => {
  if (!filterValue) return data;

  const lowercaseFilter = filterValue.toLowerCase();

  return data.filter((row) => {
    const value = row[columnId];
    if (value === null || value === undefined) return false;
    return String(value).toLowerCase().includes(lowercaseFilter);
  });
};

// Data validation utilities
export const validateRowData = <T>(
  data: T[],
  requiredFields: (keyof T)[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  data.forEach((row, index) => {
    requiredFields.forEach((field) => {
      if (!row[field]) {
        errors.push(
          `Row ${index + 1}: Missing required field '${String(field)}'`
        );
      }
    });

    // Check for id field
    if (!Object.prototype.hasOwnProperty.call(row, "id") || !(row as any).id) {
      errors.push(`Row ${index + 1}: Missing required 'id' field`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Performance utilities
export const memoizeColumns = <T>(
  columns: DataGridColumn<T>[]
): DataGridColumn<T>[] => {
  // This function helps with memoization of column definitions
  return columns.map((col) => ({ ...col }));
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
