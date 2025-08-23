import React from "react";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { STATUS_CONFIG } from "./constants";

// Helper function to get status badge
export const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
};
