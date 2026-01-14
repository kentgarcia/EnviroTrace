# Quick Start Guide - ISO Tree Request System

## Overview
The ISO Tree Request Tracking System provides comprehensive tracking of tree cutting, pruning, and ball-out requests through 4 processing phases with automatic delay detection.

## Access the System

### Via URL (recommended way to integrate):
Add this route to your routing configuration to access the new ISO Tree Requests page:

```typescript
// In your routing file
import ISOTreeRequestsPage from "@/presentation/roles/urban-greening/pages/tree-requests/ISOTreeRequestsPage";

// Add route
{
  path: "/urban-greening/iso-tree-requests",
  element: <ISOTreeRequestsPage />,
}
```

### Processing Standards Configuration:
```typescript
// Add admin route for settings
import ProcessingStandardsSettings from "@/presentation/roles/urban-greening/pages/tree-requests/components/ProcessingStandardsSettings";

{
  path: "/urban-greening/processing-standards",
  element: <ProcessingStandardsSettings />,
}
```

## Usage Workflow

### 1. Configure Processing Standards (First Time Setup)
1. Navigate to Processing Standards Settings
2. Review default standards:
   - Cutting: 3/7/10/5 days (25 total)
   - Pruning: 3/5/7/3 days (18 total)
   - Ball-out: 2/5/7/3 days (17 total)
3. Adjust based on your Citizen's Charter
4. Save changes

### 2. Create a New Request
1. Go to ISO Tree Requests page
2. Click "New Request"
3. Select request type (cutting/pruning/ball_out)
4. Fill in the **Receiving** tab:
   - Date Received
   - Month (dropdown)
   - Received Through (dropdown: Walk-in, Online, etc.)
   - Date Received by Dept. Head
   - Name, Address, Contact
5. Click through tabs to fill other phases as they progress
6. Save

### 3. Update Request as it Progresses

**Option A: Use Phase-Specific Updates (Recommended)**
1. Click on a request to view details
2. Click "Edit" in the details dialog
3. Navigate to the specific phase tab
4. Update fields
5. Save - status auto-advances when phase is complete

**Option B: API Direct Update**
Use the phase-specific PATCH endpoints:
```typescript
// Example: Update inspection phase
await updateInspectionPhase(requestId, {
  inspection_date_of_inspection: "2026-01-15",
  inspection_proponent_present: "John Doe",
  inspection_report_control_number: "INS-2026-001"
});
```

### 4. Track Requirements
In the Requirements phase:
1. Check off each requirement as submitted:
   - Application Letter
   - Photos
   - Sketchmap
   - Brgy. Endorsement Letter
   - HOA Endorsement Letter
   - Replacement
   - TCT
   - ECC
2. Date is automatically recorded when checked
3. Add remarks and recommendations
4. Set completion date when all requirements met

### 5. Monitor Delays
**Dashboard View:**
1. Click "Dashboard" tab
2. View:
   - Total requests and completion rate
   - Requests by phase
   - Delayed requests table
3. Click on any delayed request to see details

**List View:**
1. Look for red "Delayed" badges
2. Use filters to find specific issues:
   - Filter by status (receiving/inspection/etc.)
   - Filter by type (cutting/pruning/ball_out)
   - Search by name/address

## Field Descriptions

### Phase 1: Receiving
- **Date Received**: When request was initially received
- **Month**: Month name for reporting
- **Received Through**: Channel of submission
- **Date Received by Dept. Head**: When forwarded to department head
- **Name**: Requester name
- **Address**: Property address
- **Contact**: Phone/email
- **Status of Request**: Current receiving status

### Phase 2: Inspection
- **Date Received by Inspectors**: When inspectors got the request letter
- **Date of Inspection**: Actual site inspection date
- **Month**: Month of inspection
- **Proponent Present**: Person present during inspection
- **Date Submitted to Dept. Head**: When inspection report submitted
- **Date Released to Inspectors**: When report released back
- **Report Control Number**: Inspection report tracking number

### Phase 3: Requirements
- **Checklist**: 8 standard requirements with auto-date tracking
- **Remarks**: Additional notes and recommendations
- **Status**: Requirements phase status
- **Date of Completion**: When all requirements submitted

### Phase 4: Clearance
- **Date Issued**: When clearance was issued
- **Date of Payment**: Payment date
- **Control Number**: Clearance tracking number
- **OR Number**: Official receipt number
- **Date Received**: When clearance received by requester
- **Status**: Clearance status

## Understanding Delay Calculations

### How Delays are Computed:
1. **Receiving Phase**: Date Received → Date Received by Inspectors
2. **Inspection Phase**: Date Received by Inspectors → Requirements Completion Date
3. **Clearance Phase**: Requirements Completion → Clearance Date Issued
4. **Total**: Sum of all phase days

### Delay Indicators:
- **Green**: Within standard timeframe
- **Yellow**: Approaching deadline (>80% of standard)
- **Red**: Exceeding standard timeframe

## API Endpoints Summary

All endpoints are under `/tree-management/v2/`

### Requests
- `POST /requests` - Create
- `GET /requests?status=receiving&request_type=cutting` - List with filters
- `GET /requests/{id}` - Get with analytics
- `PUT /requests/{id}` - Update
- `DELETE /requests/{id}` - Delete

### Phase Updates
- `PATCH /requests/{id}/receiving` - Update receiving
- `PATCH /requests/{id}/inspection` - Update inspection
- `PATCH /requests/{id}/requirements` - Update requirements
- `PATCH /requests/{id}/clearance` - Update clearance

### Analytics
- `GET /analytics/summary` - Dashboard stats
- `GET /analytics/delays` - Delayed requests

### Standards
- `GET /processing-standards` - Get all
- `PUT /processing-standards/{type}` - Update

## Best Practices

1. **Update Progressively**: Fill in phase data as it happens, don't wait until completion
2. **Use Auto-Status**: Let the system auto-advance status when phases complete
3. **Check Delays Daily**: Review the dashboard to catch bottlenecks
4. **Standardize Dropdown Values**: Be consistent with "Received Through" options
5. **Document Remarks**: Use the remarks field to explain delays or issues
6. **Archive Completed**: Consider adding filters for active vs completed requests

## Troubleshooting

### Request not advancing to next phase?
- Check that all required fields in current phase are filled
- Ensure dates are set (especially completion dates)

### Delay calculation seems wrong?
- Verify processing standards are configured correctly
- Check that dates are entered in correct sequence
- Ensure no gaps in date transitions between phases

### Cannot save requirements checklist?
- Make sure at least one requirement is in the list
- Check that requirement names are not empty
- Verify date format is YYYY-MM-DD

## Report Generation (Future)

Currently, data can be accessed via:
1. List view with search/filter
2. Dashboard analytics
3. API endpoints for custom reporting

Future enhancements may include:
- PDF export of request details
- CSV export of request lists
- Monthly summary reports
- Delay analysis charts

---

**Need Help?** Check the full implementation documentation in `ISO_TREE_REQUEST_IMPLEMENTATION.md`
