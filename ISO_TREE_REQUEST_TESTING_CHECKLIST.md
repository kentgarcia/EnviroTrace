# ISO Tree Request System - Testing Checklist

## ✅ Pre-Testing Setup

- [ ] Backend server is running
- [ ] Frontend dev server is running
- [ ] Database migration has been applied successfully
- [ ] Processing standards are seeded in database
- [ ] User is authenticated and has access to Urban Greening module

## 🧪 Backend API Testing

### Processing Standards Endpoints

- [ ] **GET /tree-management/v2/processing-standards**
  - Returns array of 3 request types (cutting, pruning, ball_out)
  - Each has receiving/inspection/requirements/clearance standard days
  
- [ ] **GET /tree-management/v2/processing-standards/cutting**
  - Returns single standard object for cutting
  - Default: 3/7/10/5 days
  
- [ ] **PUT /tree-management/v2/processing-standards/cutting**
  - Updates standards successfully
  - Returns updated object
  - Verify in database that values changed

### Tree Request CRUD

- [ ] **POST /tree-management/v2/requests**
  - Create with minimal data (request_type only)
  - Auto-generates request_number (format: TRQ{YEAR}-####)
  - Returns created object with all fields
  - Check database for new record
  
- [ ] **POST /tree-management/v2/requests** (with full data)
  - Create with all 4 phases filled
  - Requirements checklist is stored as JSON
  - Verify dates are saved correctly
  
- [ ] **GET /tree-management/v2/requests**
  - Returns array of requests
  - Each has analytics fields (days_in_*, is_delayed)
  - Test with ?status=receiving filter
  - Test with ?request_type=cutting filter
  
- [ ] **GET /tree-management/v2/requests/{id}**
  - Returns single request with analytics
  - Delay calculation is accurate
  - Requirements checklist is parsed from JSON
  
- [ ] **PUT /tree-management/v2/requests/{id}**
  - Update succeeds
  - updated_at timestamp changes
  - Verify in database
  
- [ ] **DELETE /tree-management/v2/requests/{id}**
  - Deletes successfully
  - Returns success message
  - Record removed from database

### Phase Updates

- [ ] **PATCH /tree-management/v2/requests/{id}/receiving**
  - Updates only receiving fields
  - Other phase fields unchanged
  - Status auto-advances when complete
  
- [ ] **PATCH /tree-management/v2/requests/{id}/inspection**
  - Updates only inspection fields
  - Status auto-advances to 'requirements' when dates set
  
- [ ] **PATCH /tree-management/v2/requests/{id}/requirements**
  - Checklist items update correctly
  - Date submitted auto-recorded when checked
  - Status advances to 'clearance' when date_completion set
  
- [ ] **PATCH /tree-management/v2/requests/{id}/clearance**
  - Updates clearance fields
  - Status changes to 'completed' when date_issued set

### Analytics

- [ ] **GET /tree-management/v2/analytics/summary**
  - Returns total_requests count
  - by_status breakdown is accurate
  - delayed_count matches expectations
  
- [ ] **GET /tree-management/v2/analytics/delays**
  - Returns only delayed requests
  - is_delayed flag is true for all
  - Delay calculation matches manual calculation

## 🎨 Frontend Component Testing

### ISOTreeRequestForm

- [ ] **Create Mode**
  - Dialog opens when clicking "New Request"
  - Request type selector works
  - All 4 phase tabs are present
  - Can navigate between tabs
  
- [ ] **Receiving Tab**
  - Date picker works for all date fields
  - Month dropdown shows all 12 months
  - Received Through dropdown shows all options
  - Text inputs accept data
  
- [ ] **Inspection Tab**
  - All date pickers functional
  - Month dropdown works
  - Text inputs accept data
  
- [ ] **Requirements Tab**
  - 8 checkboxes displayed by default
  - Checking a box shows date submitted
  - Remarks textarea accepts multi-line text
  - Date completion picker works
  
- [ ] **Clearance Tab**
  - All date pickers functional
  - Text inputs for control numbers work
  - OR number field accepts input
  
- [ ] **Form Submission**
  - Create button is disabled while loading
  - Success toast appears
  - Dialog closes automatically
  - Request appears in list immediately
  
- [ ] **Edit Mode**
  - Opens with existing data pre-filled
  - All fields show current values
  - Requirements checklist loads with checked states
  - Update button saves changes
  - Changes reflect immediately in list

### ISOTreeRequestDetails

- [ ] **Timeline Display**
  - All 4 phases shown vertically
  - Active phase highlighted correctly
  - Completed phases show green checkmark
  - Connection lines between phases
  
- [ ] **Delay Indicators**
  - Days in phase shown correctly
  - Red highlighting for delayed phases
  - Yellow for approaching deadline
  - Green for on-time
  
- [ ] **Requirements Checklist**
  - All items displayed with checkmarks
  - Checked items show submission date
  - Unchecked items shown clearly
  
- [ ] **Summary Stats Cards**
  - Total days calculated correctly
  - Days per phase match timeline
  - Standard days shown for comparison
  
- [ ] **Edit Button**
  - Opens edit form
  - Pre-fills with current data
  - Saving updates the details view
  
- [ ] **Metadata**
  - Created date displayed
  - Updated date shown if exists
  - Formatted as locale string

### ISOTreeRequestDashboard

- [ ] **Summary Cards**
  - Total requests count accurate
  - Delayed requests count correct
  - In Progress sum is right
  - Completed count matches
  - Percentages calculated correctly
  
- [ ] **Requests by Phase Chart**
  - All statuses shown with counts
  - Progress bars width proportional
  - Colors match status theme
  
- [ ] **Delayed Requests Table**
  - Shows only delayed requests
  - Days overdue calculated correctly
  - Delayed phase identified properly
  - Click navigates to request details
  - Empty state shown when no delays

### ISOTreeRequestsPage

- [ ] **View Switcher**
  - List/Dashboard toggle works
  - Maintains state when switching
  
- [ ] **Stats Overview**
  - 5 cards show correct counts
  - Delayed card highlighted if count > 0
  - Updates in real-time after actions
  
- [ ] **Search**
  - Filters by request number
  - Filters by name
  - Filters by address
  - Case-insensitive search
  - Real-time filtering
  
- [ ] **Status Filter**
  - Dropdown shows all status options
  - Filtering works correctly
  - "All Status" shows everything
  
- [ ] **Type Filter**
  - Shows cutting/pruning/ball_out
  - Filtering works
  - "All Types" shows everything
  
- [ ] **Requests Table**
  - All columns display data
  - Status badges colored correctly
  - Delay badges show on delayed requests
  - On-time badges show when not delayed
  - Dates formatted properly
  - Click opens details dialog
  
- [ ] **New Request Button**
  - Opens create form
  - Form is in "add" mode

### ProcessingStandardsSettings

- [ ] **Standards Table**
  - Shows all 3 request types
  - All 4 phase columns editable
  - Total days auto-calculates
  
- [ ] **Edit Functionality**
  - Number inputs accept only numbers
  - Min value of 0 enforced
  - Changes tracked per request type
  - Save button enabled only when changed
  
- [ ] **Save Operation**
  - Saves individual request type
  - Success toast appears
  - Table updates with new values
  - Changes persist after refresh
  
- [ ] **Guidelines Card**
  - Shows phase descriptions
  - Note about Citizen's Charter visible

## 🔄 Integration Testing

### End-to-End Workflows

- [ ] **Complete Request Lifecycle**
  1. Create new cutting request
  2. Fill receiving phase, save
  3. Update to inspection phase
  4. Add inspection dates, save
  5. Check all requirements, set completion date
  6. Add clearance information
  7. Verify status is 'completed'
  8. Check timeline shows all phases
  9. Confirm no delays if within standards
  
- [ ] **Delayed Request Detection**
  1. Create request with old receiving date
  2. Set date > standard days ago
  3. Verify is_delayed flag is true
  4. Check appears in delayed dashboard
  5. Red badge shows in list
  6. Days overdue calculated correctly
  
- [ ] **Requirements Checklist Flow**
  1. Create request
  2. Navigate to requirements phase
  3. Check first 4 items
  4. Verify dates auto-populated
  5. Uncheck one item
  6. Verify date cleared
  7. Re-check with new date
  
- [ ] **Filter Combinations**
  1. Apply status filter
  2. Apply type filter
  3. Add search query
  4. Verify all filters work together
  5. Clear filters one by one
  
- [ ] **Standards Update Impact**
  1. Note current delay count
  2. Increase standards (e.g., receiving from 3 to 10 days)
  3. Refresh analytics
  4. Verify delay count decreased
  5. Reset standards
  6. Verify count returns

## 📊 Data Validation

- [ ] **Date Sequence Validation**
  - Test creating request with future dates
  - Test inspection date before receiving date
  - Verify system handles gracefully
  
- [ ] **Required Fields**
  - Create request with only request_type
  - Verify saves successfully
  - Verify optional fields are truly optional
  
- [ ] **Large Data Sets**
  - Create 50+ requests
  - Verify list loads quickly
  - Verify dashboard calculations accurate
  - Test pagination if implemented
  
- [ ] **Special Characters**
  - Enter special chars in name/address
  - Verify saves and displays correctly
  - Test search with special chars

## 🐛 Error Handling

- [ ] **Backend Errors**
  - Disconnect backend
  - Try to create request
  - Verify error toast appears
  - Verify form doesn't close on error
  
- [ ] **Network Errors**
  - Simulate slow network
  - Verify loading states show
  - Verify timeouts handled
  
- [ ] **Invalid Data**
  - Try to save with invalid date format
  - Try negative numbers in standards
  - Verify validation messages
  
- [ ] **Not Found**
  - Try to access non-existent request ID
  - Verify 404 error handled
  - Verify user-friendly message

## 🎯 Performance Testing

- [ ] **Initial Load**
  - Time to first paint < 3s
  - List renders smoothly
  
- [ ] **Analytics Calculation**
  - Dashboard loads < 2s with 100+ requests
  - Delay calculations don't block UI
  
- [ ] **Form Responsiveness**
  - Tab switching is instant
  - Typing has no lag
  - Dropdowns open quickly

## ♿ Accessibility Testing

- [ ] **Keyboard Navigation**
  - Tab through form fields works
  - Enter submits form
  - Escape closes dialogs
  
- [ ] **Screen Reader**
  - Form labels read correctly
  - Status badges announced
  - Error messages read
  
- [ ] **Color Contrast**
  - All text readable
  - Badges have sufficient contrast
  - Delay indicators distinguishable

## 📱 Responsive Testing

- [ ] **Desktop (1920x1080)**
  - All components visible
  - No horizontal scroll
  - Proper spacing
  
- [ ] **Laptop (1366x768)**
  - Layout adjusts
  - All features accessible
  
- [ ] **Tablet (768x1024)**
  - Responsive grid works
  - Touch targets adequate
  - Forms usable

## 🔐 Security Testing

- [ ] **Authentication**
  - Unauthenticated users redirected
  - API returns 401 if not logged in
  
- [ ] **Authorization**
  - Only admin can access standards settings
  - Users can only see their requests (if applicable)
  
- [ ] **Input Sanitization**
  - XSS attempts in text fields blocked
  - SQL injection attempts fail
  - Script tags in remarks don't execute

## ✅ Sign-Off

- [ ] All critical tests passed
- [ ] All bugs documented in issue tracker
- [ ] Performance meets requirements
- [ ] Accessibility guidelines followed
- [ ] Security vulnerabilities addressed
- [ ] Documentation complete
- [ ] Ready for production deployment

---

**Tested By:** _______________
**Date:** _______________
**Environment:** Development / Staging / Production
**Notes:** _______________________________________________
