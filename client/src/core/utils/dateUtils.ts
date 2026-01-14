/**
 * Utility functions for date handling and formatting
 */

/**
 * Safely parse a date value that can be a string, number, or null
 * Handles both PostgreSQL timestamps and Unix timestamps (in milliseconds)
 *
 * @param dateValue - The date value to parse (string, number, or null)
 * @returns Date object or null if invalid
 */
export function parseDate(dateValue?: string | number | null): Date | null {
  if (!dateValue) return null;

  let date: Date;

  if (typeof dateValue === "number") {
    // If it's a number, treat it as Unix timestamp in milliseconds
    date = new Date(dateValue);
  } else if (typeof dateValue === "string") {
    // Try to parse as number first (Unix timestamp as string)
    const numericValue = Number(dateValue);
    if (!isNaN(numericValue)) {
      // If it's a valid number, treat as Unix timestamp in milliseconds
      date = new Date(numericValue);
    } else {
      // Try ISO format first (e.g., "2026-01-14T00:00:00Z")
      date = new Date(dateValue);
      
      // If that fails, try PostgreSQL timestamp format
      if (isNaN(date.getTime())) {
        date = parsePgTimestamp(dateValue);
      }
    }
  } else {
    return null;
  }

  // Check if the resulting date is valid
  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/**
 * Parse PostgreSQL timestamp with timezone
 * Example: "2024-01-15 10:30:00+08"
 *
 * @param dateString - PostgreSQL timestamp string
 * @returns Date object or null if invalid
 */
export function parsePgTimestamp(dateString: string): Date {
  if (!dateString) return new Date(NaN);

  // Replace first space with T to make it ISO compliant
  let isoString = dateString.replace(" ", "T");

  // Fix timezone: convert +08 or -08 to +08:00 or -08:00
  isoString = isoString.replace(/([+-]\d{2})(?!:)/, "$1:00");

  return new Date(isoString);
}

/**
 * Format a date value safely
 *
 * @param dateValue - The date value to format
 * @param formatPattern - The format pattern (default: "MMM dd, yyyy")
 * @param fallback - Fallback text when date is invalid (default: "Not available")
 * @returns Formatted date string or fallback
 */
export function formatDate(
  dateValue?: string | number | null,
  formatPattern: string = "MMM dd, yyyy",
  fallback: string = "Not available"
): string {
  const date = parseDate(dateValue);

  if (!date) {
    return fallback;
  }

  // Use Intl.DateTimeFormat for consistent formatting
  try {
    if (formatPattern === "MMM dd, yyyy") {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } else if (formatPattern === "yyyy-MM-dd") {
      return date.toISOString().split("T")[0];
    } else if (formatPattern === "MMM dd, yyyy HH:mm") {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      // Fallback to toLocaleDateString
      return date.toLocaleDateString();
    }
  } catch (error) {
    console.warn("Date formatting error:", error);
    return fallback;
  }
}

/**
 * Format a date for vehicle test date display
 *
 * @param dateValue - The date value to format
 * @returns Formatted date string or "Not tested"
 */
export function formatTestDate(dateValue?: string | number | null): string {
  return formatDate(dateValue, "MMM dd, yyyy", "Not tested");
}

/**
 * Format a date for vehicle test date display with time
 *
 * @param dateValue - The date value to format
 * @returns Formatted date string with time or "Not tested"
 */
export function formatTestDateTime(dateValue?: string | number | null): string {
  return formatDate(dateValue, "MMM dd, yyyy HH:mm", "Not tested");
}
