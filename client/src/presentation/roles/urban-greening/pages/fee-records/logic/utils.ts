import { FeeRecord } from "./useFeeRecords";

export const convertToCSV = (data: FeeRecord[]): string => {
  if (!data.length) return "";

  const headers = [
    "Reference Number",
    "Type",
    "Payer Name",
    "Amount",
    "Date",
    "Due Date",
    "Status",
    "OR Number",
    "Payment Date",
    "Created At",
  ];

  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      [
        `"${row.reference_number}"`,
        `"${row.type.replace("_", " ")}"`,
        `"${row.payer_name}"`,
        row.amount,
        `"${row.date}"`,
        `"${row.due_date}"`,
        `"${row.status}"`,
        `"${row.or_number || ""}"`,
        `"${row.payment_date || ""}"`,
        `"${row.created_at}"`,
      ].join(",")
    ),
  ].join("\n");

  return csvContent;
};

export const downloadCSV = (csv: string, filename: string): void => {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const formatCurrency = (amount: number): string => {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "overdue":
      return "bg-red-100 text-red-800";
    case "cancelled":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getTypeLabel = (type: string): string => {
  return type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export const generateReferenceNumber = (type: string): string => {
  const prefix =
    type === "cutting_permit"
      ? "UG-CP"
      : type === "pruning_permit"
      ? "UG-PP"
      : "UG-VF";
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}-${year}-${random}`;
};

export const isOverdue = (dueDate: string, status: string): boolean => {
  if (status === "paid" || status === "cancelled") return false;
  return new Date(dueDate) < new Date();
};
