// Helper functions for inspection record badge variants
import { type VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/presentation/components/shared/ui/badge";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export const getTypeBadgeVariant = (type: string): BadgeVariant => {
  switch (type) {
    case "Pruning":
      return "outline";
    case "Cutting":
      return "outline";
    case "Ballout":
      return "outline";
    case "Violation/Complaint":
      return "outline";
    default:
      return "outline";
  }
};

export const getStatusBadgeVariant = (status: string): BadgeVariant => {
  switch (status) {
    case "Pending":
      return "yellow";
    case "In Progress":
      return "blue";
    case "Completed":
      return "green";
    case "Rejected":
      return "red";
    default:
      return "gray";
  }
};
