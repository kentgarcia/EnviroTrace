import { format, isValid, parseISO } from "date-fns";

// Safe date formatting function
export const formatSafeDate = (
  dateValue: string | Date | null | undefined,
  formatString: string = "MMM dd, yyyy"
): string => {
  if (!dateValue) return "N/A";

  try {
    let date: Date;
    if (typeof dateValue === "string") {
      // Try to parse ISO string first, then fallback to regular Date constructor
      date =
        dateValue.includes("T") || dateValue.includes("-")
          ? parseISO(dateValue)
          : new Date(dateValue);
    } else {
      date = dateValue;
    }

    if (isValid(date)) {
      return format(date, formatString);
    } else {
      return "Invalid Date";
    }
  } catch (error) {
    console.warn("Date formatting error:", error, dateValue);
    return "Invalid Date";
  }
};

// Safe date comparison function
export const safeDateCompare = (
  dateA: string | Date | null | undefined,
  dateB: string | Date | null | undefined
): number => {
  try {
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    let parsedA: Date, parsedB: Date;

    if (typeof dateA === "string") {
      parsedA =
        dateA.includes("T") || dateA.includes("-")
          ? parseISO(dateA)
          : new Date(dateA);
    } else {
      parsedA = dateA;
    }

    if (typeof dateB === "string") {
      parsedB =
        dateB.includes("T") || dateB.includes("-")
          ? parseISO(dateB)
          : new Date(dateB);
    } else {
      parsedB = dateB;
    }

    if (!isValid(parsedA) && !isValid(parsedB)) return 0;
    if (!isValid(parsedA)) return 1;
    if (!isValid(parsedB)) return -1;

    return parsedA.getTime() - parsedB.getTime();
  } catch (error) {
    console.warn("Date comparison error:", error, dateA, dateB);
    return 0;
  }
};

// Generate a unique control number
export const generateControlNumber = (): string => {
  // Generate a 7-digit random number
  const randomNumber = Math.floor(1000000 + Math.random() * 9000000);
  return randomNumber.toString();
};

// Get ordinal number (1st, 2nd, 3rd, etc.)
export const getOrdinalNumber = (num: number): string => {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = num % 100;
  return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
};
