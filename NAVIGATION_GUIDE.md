# Navigation Guide - ISO Tree Requests

## Top Navigation Bar

When you're in the Urban Greening module, the top navigation will look like this:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ENVIROTRACE                                                              │
├─────────────────────────────────────────────────────────────────────────┤
│  Dashboard  │  Tree Registry  │  Tree Requests ▼  │  Greening  │  Fees │
└─────────────────────────────────────────────────────────────────────────┘
```

## Tree Requests Dropdown Menu

Click on "Tree Requests" to see the dropdown:

```
┌────────────────────────────────┐
│ Tree Requests ▼                │
├────────────────────────────────┤
│ 📋 Legacy Requests             │  ← Old system (backward compatible)
│ ✨ ISO Requests (New)          │  ← NEW! 4-phase tracking system
│ ⚙️  Processing Standards       │  ← Admin configuration
└────────────────────────────────┘
```

## Page Flow

### Option 1: ISO Requests (New) - Recommended
```
Click "ISO Requests (New)"
         ↓
┌─────────────────────────────────────────┐
│  ISO Tree Requests Page                 │
│  ┌─────────────────────────────────┐   │
│  │ [List View] [Dashboard View]    │   │
│  │                    [New Request]│   │
│  └─────────────────────────────────┘   │
│                                         │
│  Stats Overview:                        │
│  [Total: 12] [Receiving: 3] ...        │
│                                         │
│  Search and Filters:                    │
│  [Search...] [Status ▼] [Type ▼]      │
│                                         │
│  Requests Table:                        │
│  Request# │ Type │ Status │ Delay...   │
│  ─────────┼──────┼────────┼────────    │
│  TRQ2026-0001 │ Cutting │ ...         │
│  TRQ2026-0002 │ Pruning │ ...         │
└─────────────────────────────────────────┘
```

### Option 2: Processing Standards - Admin Only
```
Click "Processing Standards"
         ↓
┌─────────────────────────────────────────┐
│  Processing Standards Configuration     │
│                                         │
│  Standard Processing Days:              │
│  ┌─────────────────────────────────┐   │
│  │ Request Type │ Receiving │ ...  │   │
│  ├─────────────┼───────────┼──────│   │
│  │ Cutting     │  [3]  │  [7]  ...│   │
│  │ Pruning     │  [3]  │  [5]  ...│   │
│  │ Ball-out    │  [2]  │  [5]  ...│   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Save] buttons for each type           │
└─────────────────────────────────────────┘
```

## User Journey Examples

### Creating a New Request
```
1. Navigate: Urban Greening → Tree Requests ▼ → ISO Requests (New)
2. Click: [New Request] button
3. Fill: Multi-phase form opens with 4 tabs
   ┌────────────────────────────────────┐
   │ [Receiving] [Inspection] ...       │
   ├────────────────────────────────────┤
   │ Request Type: [Cutting ▼]          │
   │                                    │
   │ Date Received: [2026-01-11]        │
   │ Name: [John Doe]                   │
   │ Address: [123 Main St]             │
   │ ...                                │
   └────────────────────────────────────┘
4. Click: [Create Request]
5. Result: Request appears in list immediately
```

### Monitoring Delays
```
1. Navigate: Urban Greening → Tree Requests ▼ → ISO Requests (New)
2. Click: [Dashboard View] tab
3. View:
   ┌────────────────────────────────────┐
   │ Delayed Requests: 🔴 5             │
   │                                    │
   │ Currently Delayed:                 │
   │ TRQ2026-0001 │ +3 days overdue    │
   │ TRQ2026-0005 │ +7 days overdue    │
   │ ...                                │
   └────────────────────────────────────┘
4. Click: Any delayed request to see details
```

### Configuring Standards (Admin)
```
1. Navigate: Urban Greening → Tree Requests ▼ → Processing Standards
2. Edit: Change days in input fields
   Cutting: Receiving [3] → [5] days
3. Click: [Save] button next to Cutting row
4. Result: New standard applied to all new delay calculations
```

## Visual Indicators

### Status Badges
- 🔵 **Receiving** - Blue badge
- 🟣 **Inspection** - Purple badge
- 🟡 **Requirements** - Yellow badge
- 🟠 **Clearance** - Orange badge
- 🟢 **Completed** - Green badge
- 🔴 **Cancelled** - Red badge

### Delay Indicators
- ✅ **On Time** - Green outline badge
- ⏰ **Approaching** - Yellow background (>80% of standard)
- 🚨 **Delayed** - Red badge with alert icon

### Phase Progress
```
Timeline View in Details:
┌─────────────────────────────────────┐
│ Phase 1: Receiving          ✓       │
│ ├─ Date Received: 2026-01-01        │
│ └─ Days: 2 / 3 standard     🟢      │
│                                     │
│ Phase 2: Inspection         ⏳      │
│ ├─ Date of Inspection: 2026-01-03  │
│ └─ Days: 5 / 7 standard     🟡      │
│                                     │
│ Phase 3: Requirements       ○       │
│ └─ Not started yet                  │
│                                     │
│ Phase 4: Clearance          ○       │
│ └─ Not started yet                  │
└─────────────────────────────────────┘
```

## Keyboard Shortcuts

When on ISO Tree Requests page:
- `Ctrl/Cmd + K` - Focus search box
- `N` - Create new request (if implemented)
- `Enter` - Submit forms
- `Esc` - Close dialogs
- `Tab` - Navigate between form fields

## Mobile/Tablet View

The navigation adapts responsively:

**Desktop (1920px):**
```
[Dashboard] [Tree Registry] [Tree Requests ▼] [Greening] [Fees]
```

**Tablet (768px):**
```
[Dashboard] [Tree Registry] [Tree Requests ▼]
[Greening] [Fees]
```

**Mobile (< 640px):**
```
☰ Menu
```
(Hamburger menu with all options)

## Tips for Users

### First Time Setup
1. ✅ Admin configures Processing Standards first
2. ✅ Train staff on 4-phase workflow
3. ✅ Create 1-2 test requests
4. ✅ Review dashboard to understand delay tracking
5. ✅ Start using for real requests

### Daily Workflow
1. **Morning:** Check Dashboard for delayed requests
2. **Throughout day:** Update requests as phases progress
3. **Before leaving:** Mark requirements checklist items
4. **Weekly:** Review analytics for bottlenecks

### Best Practices
- ✅ Update dates as soon as events happen
- ✅ Use remarks field to explain delays
- ✅ Check all requirements before marking complete
- ✅ Monitor dashboard daily for delays
- ✅ Keep processing standards up-to-date

## Troubleshooting

### "Can't see ISO Requests menu item"
- Check if you're in Urban Greening module
- Verify user has `urban_greening` or `admin` role
- Refresh the page

### "Navigation dropdown not working"
- Click directly on "Tree Requests" text
- Wait for dropdown to appear
- Click on desired sub-item

### "Page not loading"
- Check backend is running
- Check frontend dev server is running
- Open browser console for errors
- Verify database migration was applied

---

**Need Help?** 
- Check: `FRONTEND_INTEGRATION_COMPLETE.md`
- Review: `ISO_TREE_REQUEST_QUICKSTART.md`
- Test: `ISO_TREE_REQUEST_TESTING_CHECKLIST.md`
