import { TreeRequestWithAnalytics } from '../api/tree-management-request-api';

/**
 * Calculate the number of days between two dates
 * Returns 0 if either date is null or if the result would be negative
 */
function calculateDaysBetween(startDate: string | null, endDate: string | null): number {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const diffInMs = end.getTime() - start.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  // Prevent negative days
  return Math.max(0, diffInDays);
}

/**
 * Calculate days spent in each phase for a tree request
 * This is a client-side version that provides real-time updates
 */
export function calculateTreeRequestDays(request: Partial<TreeRequestWithAnalytics>) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // PHASE 1: RECEIVING
  // Starts when request is received, ends when inspection receives it
  let days_in_receiving = 0;
  if (request.receiving_date_received) {
    const endDate = request.inspection_date_received_by_inspectors || 
                   (request.overall_status === 'receiving' ? today : request.receiving_date_received);
    days_in_receiving = calculateDaysBetween(request.receiving_date_received, endDate);
  }
  
  // PHASE 2: INSPECTION
  // Starts when inspectors receive it, ends when submitted to dept head
  let days_in_inspection = 0;
  if (request.inspection_date_received_by_inspectors) {
    const endDate = request.inspection_date_submitted_to_dept_head || 
                   (request.overall_status === 'inspection' ? today : request.inspection_date_received_by_inspectors);
    days_in_inspection = calculateDaysBetween(request.inspection_date_received_by_inspectors, endDate);
  }
  
  // PHASE 3: REQUIREMENTS
  // Starts when inspection is submitted to dept head, ends when requirements are complete
  let days_in_requirements = 0;
  if (request.inspection_date_submitted_to_dept_head) {
    const endDate = request.requirements_date_completion || 
                   (request.overall_status === 'requirements' ? today : request.inspection_date_submitted_to_dept_head);
    days_in_requirements = calculateDaysBetween(request.inspection_date_submitted_to_dept_head, endDate);
  }
  
  // PHASE 4: CLEARANCE
  // Starts when requirements are complete, ends when clearance is issued
  let days_in_clearance = 0;
  if (request.requirements_date_completion) {
    const endDate = request.clearance_date_issued || 
                   (request.overall_status === 'clearance' ? today : request.requirements_date_completion);
    days_in_clearance = calculateDaysBetween(request.requirements_date_completion, endDate);
  }
  
  const total_days = days_in_receiving + days_in_inspection + days_in_requirements + days_in_clearance;
  
  // Check if delayed
  let is_delayed = false;
  if (request.overall_status === 'receiving' && request.receiving_standard_days) {
    is_delayed = days_in_receiving > request.receiving_standard_days;
  } else if (request.overall_status === 'inspection' && request.inspection_standard_days) {
    is_delayed = days_in_inspection > request.inspection_standard_days;
  } else if (request.overall_status === 'requirements' && request.requirements_standard_days) {
    is_delayed = days_in_requirements > request.requirements_standard_days;
  } else if (request.overall_status === 'clearance' && request.clearance_standard_days) {
    is_delayed = days_in_clearance > request.clearance_standard_days;
  }
  
  return {
    days_in_receiving,
    days_in_inspection,
    days_in_requirements,
    days_in_clearance,
    total_days,
    is_delayed,
  };
}

/**
 * Format days for display with proper pluralization
 */
export function formatDays(days: number): string {
  if (days === 0) return '0 days';
  if (days === 1) return '1 day';
  return `${days} days`;
}
