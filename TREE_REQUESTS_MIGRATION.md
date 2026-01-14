# Tree Request System Migration Guide

## ✅ Legacy System Deprecated (January 11, 2026)

The legacy Tree Request system has been officially deprecated and replaced with the new **ISO Tree Request Tracking System**.

---

## What Changed?

### 🔗 URL Changes

| Old URL | New URL | Status |
|---------|---------|--------|
| `/urban-greening/tree-requests` | `/urban-greening/tree-requests` | ✅ Now serves ISO system |
| `/urban-greening/iso-tree-requests` | `/urban-greening/tree-requests` | 🔄 Merged into main route |
| Legacy system | Not accessible via navigation | ⚠️ Deprecated (still accessible if bookmarked) |

### 📋 Navigation Changes

**Before:**
```
Tree Requests (dropdown)
├── Legacy Requests
├── ISO Requests (New)
└── Processing Standards
```

**After:**
```
Tree Requests (direct link)
```

Processing Standards is now accessible via admin settings or direct URL: `/urban-greening/processing-standards`

---

## Why the Change?

The new ISO Tree Request Tracking System provides:

✅ **4-Phase Workflow**
- Receiving Phase
- Inspection Phase  
- Requirements Checking Phase
- Clearance Phase

✅ **Automated Delay Monitoring**
- Real-time calculation of processing days
- Automatic delay detection per phase
- Analytics dashboard with delay reports

✅ **ISO Compliance**
- Configurable processing standards
- Audit trails for each phase
- Requirements checklist tracking

✅ **Better UX**
- Modern, responsive interface
- Consistent design with other modules
- Improved search and filtering

---

## For Users

### If you see the deprecation warning:

1. **Click "Go to New System"** to navigate to the ISO tracking system
2. All existing requests are available in the new system
3. The legacy page will remain accessible for reference but should not be used for new requests

### Key Differences:

| Feature | Legacy System | ISO System |
|---------|---------------|------------|
| **Status Tracking** | 4 statuses (Filed, On Hold, For Signature, Payment Pending) | 6 statuses (Receiving, Inspection, Requirements, Clearance, Completed, Cancelled) |
| **Phases** | Single-stage tracking | 4-phase workflow |
| **Delay Monitoring** | Manual | Automated with analytics |
| **Requirements** | Notes field | Structured checklist with dates |
| **Reports** | Basic stats | Analytics dashboard with trends |

---

## For Developers

### Files Changed:

1. **Routes** (`urban-greening.routes.tsx`)
   - Removed legacy TreeRequestsPage route
   - Made ISOTreeRequestsPage the main `/tree-requests` route

2. **Navigation** (`TopNavBarContainer.tsx`)
   - Removed dropdown menu
   - Made Tree Requests a direct navigation item

3. **Legacy Page** (`TreeRequestsPage.tsx`)
   - Added deprecation warning banner
   - Updated header with "LEGACY" badge
   - Added auto-redirect suggestion

4. **ISO Page** (`ISOTreeRequestsPage.tsx`)
   - Updated title to "Tree Request Tracking"
   - Now the primary interface

### Data Migration:

- ✅ No data migration needed
- ✅ Both systems use separate database tables (`tree_management_requests` vs `tree_requests`)
- ✅ Legacy data remains accessible for historical reference

### Backend:

- ✅ Legacy API endpoints remain active for backward compatibility
- ✅ New ISO endpoints are under `/tree-management/v2/` prefix
- ✅ Database tables are separate (no conflicts)

---

## Rollback Plan (If Needed)

If you need to temporarily restore legacy system access:

1. **Add route back** in `urban-greening.routes.tsx`:
   ```tsx
   createUrbanGreeningRoute("/urban-greening/legacy-tree-requests", TreeRequestsPage),
   ```

2. **Add to navigation** in `TopNavBarContainer.tsx`:
   ```tsx
   {
     label: "Tree Requests",
     path: `${basePath}/tree-requests`,
     children: [
       { label: "Current (ISO)", path: `${basePath}/tree-requests` },
       { label: "Legacy System", path: `${basePath}/legacy-tree-requests` },
     ],
   },
   ```

---

## Support

For questions or issues with the migration:

1. Check the implementation docs:
   - `ISO_TREE_REQUEST_IMPLEMENTATION.md`
   - `ISO_TREE_REQUEST_QUICKSTART.md`
   - `TESTING_CHECKLIST.md`

2. Review the deprecation warning in the legacy page
3. Contact the development team

---

## Timeline

- **January 11, 2026**: Legacy system deprecated
- **Current**: ISO system is the default
- **Future**: Legacy system may be fully removed after transition period

---

**Status**: ✅ Migration Complete
**Last Updated**: January 11, 2026
