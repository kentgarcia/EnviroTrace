# Government Emission Mobile App - Feature Documentation

## Overview
The mobile app for Government Emission monitoring has been enhanced to match the desktop client functionality, providing comprehensive vehicle emission testing management on the go.

## Core Features

### 1. **Overview Dashboard** 📊
**Location:** `src/screens/roles/gov-emission/overview/OverviewScreen.tsx`

**Features:**
- Welcome header with user information
- Real-time sync status indicator
- Key metrics cards:
  - Total Vehicles (with trend indicators)
  - Tested Vehicles (monthly count)
  - Compliance Rate (pass rate average)
  - Government Offices (active units)
- Quick action buttons:
  - Add Vehicle
  - Record Test
  - Quarterly Testing
  - Reports
- Pull-to-refresh functionality
- Responsive card-based layout

**Navigation:**
- Tap stat cards to navigate to respective sections
- Quick actions provide one-tap access to common tasks

---

### 2. **Vehicle Management** 🚗
**Location:** `src/screens/roles/gov-emission/vehicles/`

**Features:**
- **Vehicle List** (`VehiclesScreen.tsx`)
  - Searchable vehicle directory
  - Filter by office/department
  - Plate number display
  - Vehicle status indicators
  
- **Vehicle Details** (`VehicleDetailScreen.tsx`)
  - Complete vehicle information
  - Test history
  - Compliance status
  - Quick test scheduling

- **Add Vehicle** (`AddVehicleScreen.tsx`)
  - Modal form for new vehicle registration
  - Required fields validation
  - Department assignment
  - Plate number input

---

### 3. **Emission Testing** 🔬
**Location:** `src/screens/roles/gov-emission/test/`

**Features:**
- **Testing List** (`TestingScreen.tsx`)
  - Recent test records
  - Pass/fail status
  - Date and inspector information
  - Search and filter options

- **Add Test Record** (`AddTestScreen.tsx`)
  - Quick test form
  - Vehicle selection
  - Result entry (pass/fail)
  - Inspector assignment
  - Date selection
  - Notes and remarks

---

### 4. **Quarterly Testing** 📅 *NEW*
**Location:** `src/screens/roles/gov-emission/quarterly/QuarterlyTestingScreen.tsx`

**Features:**
- Year and quarter selector
- Quarterly statistics:
  - Total scheduled tests
  - Completed tests
  - Pending tests
  - Pass rate for quarter
- Test schedule management
- Department-wise testing breakdown
- Search functionality
- Status tracking (pending/completed)

**UI Components:**
- Interactive quarter buttons (Q1, Q2, Q3, Q4)
- Year navigation (previous/next)
- Color-coded status chips
- Detailed schedule cards

---

### 5. **Reports & Analytics** 📄 *NEW*
**Location:** `src/screens/roles/gov-emission/reports/ReportsScreen.tsx`

**Features:**
- **Quick Generate**
  - One-tap report generation
  - Configurable report period (monthly/quarterly/annual)
  - Export format selection (Excel/PDF)

- **Report Templates**
  - Vehicle Inventory Report
  - Emission Test Results
  - Compliance Summary
  - Quarterly Analysis

- **Recent Reports**
  - Download history
  - Quick re-download access
  - Generated date tracking

**Functionality:**
- Dialog-based report configuration
- Period selection (monthly, quarterly, annual)
- Format selection (Excel .xlsx, PDF)
- Email delivery notification

---

### 6. **Offices Management** 🏢
**Location:** `src/screens/roles/gov-emission/offices/OfficesScreen.tsx`

**Features:**
- Government office directory
- Department listing
- Vehicle count per office
- Compliance tracking
- Office details navigation

---

### 7. **Profile & Settings** ⚙️
**Location:** `src/screens/roles/gov-emission/profile/`

**Features:**
- **Profile Screen** (`ProfileScreen.tsx`)
  - User information
  - Role display
  - Settings access
  - About and Help links

- **Offline Data** (`OfflineDataScreen.tsx`)
  - Cached data management
  - Storage statistics
  - Clear cache option

- **Sync Settings** (`SyncSettingsScreen.tsx`)
  - Auto-sync configuration
  - Manual sync trigger
  - Sync frequency settings

---

## Navigation Structure

### Bottom Tab Navigation
The app uses a 5-tab bottom navigation bar:

1. **Overview** - Dashboard and statistics
2. **Vehicles** - Vehicle management (with nested stack)
3. **Testing** - Test records (with nested stack)
4. **Quarterly** - Quarterly testing management *NEW*
5. **Reports** - Report generation and analytics *NEW*
6. **Profile** - User settings and information

### Stack Navigators
- **Vehicles Stack:**
  - VehiclesList (main)
  - VehicleDetail
  - AddVehicle (modal)

- **Testing Stack:**
  - TestingList (main)
  - AddTest (modal)

- **Profile Stack:**
  - ProfileHome (main)
  - About
  - Help
  - OfflineData
  - SyncSettings

---

## Features Matching Desktop Client

### ✅ Implemented Features
- [x] Overview dashboard with key metrics
- [x] Vehicle management (CRUD operations)
- [x] Emission testing records
- [x] Quarterly testing schedule
- [x] Reports generation
- [x] Department/office tracking
- [x] Real-time sync
- [x] Offline data support

### 📱 Mobile-Specific Enhancements
- Pull-to-refresh on all screens
- Touch-optimized UI components
- Bottom sheet modals for forms
- Responsive card layouts
- Native navigation patterns
- Optimized for small screens
- Offline-first architecture
- Background sync capabilities

---

## Technical Stack

### Navigation
- **@react-navigation/native** - Core navigation
- **@react-navigation/bottom-tabs** - Tab bar navigation
- **@react-navigation/native-stack** - Stack navigation
- **Custom bottom tab bar** - Branded UI

### UI Components
- **react-native-paper** - Material Design components
- **react-native-svg** - Charts and graphics
- **expo-linear-gradient** - Gradient backgrounds
- **Custom components** - Branded design system

### Data Management
- **React Query** - Server state management
- **Zustand** - Client state management
- **AsyncStorage** - Local persistence
- **Custom hooks** - Data fetching and sync

---

## Comparison: Desktop vs Mobile

| Feature | Desktop | Mobile | Status |
|---------|---------|--------|--------|
| Overview Dashboard | ✅ | ✅ | Fully Matched |
| Vehicle Management | ✅ | ✅ | Fully Matched |
| Emission Testing | ✅ | ✅ | Fully Matched |
| Quarterly Testing | ✅ | ✅ | **NEW** - Added |
| Reports Generation | ✅ | ✅ | **NEW** - Added |
| Office Management | ✅ | ✅ | Fully Matched |
| Detail Pages | ✅ | ⚠️ | Planned Enhancement |
| Advanced Charts | ✅ | 📊 | Simplified for mobile |
| Spreadsheet View | ✅ | 📱 | Mobile-optimized cards |
| Word/Excel Export | ✅ | 📧 | Email delivery |

---

## Recent Updates (Dec 27, 2025)

### Added
1. **Quarterly Testing Screen**
   - Full quarter-by-quarter testing management
   - Year selector with navigation
   - Quarter statistics dashboard
   - Test schedule with status tracking

2. **Reports Screen**
   - Report template selection
   - Period and format configuration
   - Recent reports history
   - Download functionality

3. **Enhanced Overview**
   - Updated quick actions
   - Added Quarterly and Reports shortcuts
   - Improved navigation flow

### Modified
- Updated `MainNavigator.tsx` to include new screens
- Replaced "Offices" tab with "Quarterly" and "Reports"
- Enhanced bottom navigation with 5 tabs
- Updated icon mappings

---

## Future Enhancements

### Planned Features
- [ ] Detail drill-down pages (match desktop)
- [ ] Advanced filtering and sorting
- [ ] Data visualization enhancements
- [ ] Push notifications for test due dates
- [ ] Camera integration for document capture
- [ ] Barcode/QR code scanning for vehicles
- [ ] Voice input for quick data entry

### Performance Optimizations
- [ ] Virtual scrolling for large lists
- [ ] Image caching and optimization
- [ ] Background data prefetching
- [ ] Incremental sync strategies

---

## Usage Guide

### For Government Officials
1. **Daily Workflow:**
   - Open app → View Overview dashboard
   - Check quarterly testing status
   - Record new emission tests
   - Generate monthly reports

2. **Vehicle Management:**
   - Navigate to Vehicles tab
   - Search or filter vehicles
   - View details and test history
   - Add new vehicles as needed

3. **Quarterly Planning:**
   - Go to Quarterly tab
   - Select year and quarter
   - Review scheduled tests
   - Track completion status

4. **Report Generation:**
   - Access Reports tab
   - Choose report template
   - Configure period and format
   - Receive via email

---

## Development Notes

### File Structure
```
mobile/src/screens/roles/gov-emission/
├── overview/
│   └── OverviewScreen.tsx
├── vehicles/
│   ├── VehiclesScreen.tsx
│   ├── VehicleDetailScreen.tsx
│   └── AddVehicleScreen.tsx
├── test/
│   ├── TestingScreen.tsx
│   └── AddTestScreen.tsx
├── quarterly/          # NEW
│   └── QuarterlyTestingScreen.tsx
├── reports/            # NEW
│   └── ReportsScreen.tsx
├── offices/
│   └── OfficesScreen.tsx
└── profile/
    ├── ProfileScreen.tsx
    ├── AboutScreen.tsx
    ├── HelpScreen.tsx
    ├── OfflineDataScreen.tsx
    └── SyncSettingsScreen.tsx
```

### Navigation Configuration
```typescript
export type MainStackParamList = {
  Overview: undefined;
  Vehicles: undefined;
  Testing: undefined;
  QuarterlyTesting: undefined;  // NEW
  Reports: undefined;            // NEW
  Profile: undefined;
  VehicleDetail: { vehicleId: string };
  AddVehicle: undefined;
  AddTest: { vehicleId?: string };
};
```

---

## Support & Maintenance

For issues or feature requests, please contact the development team.

**Last Updated:** December 27, 2025
**Version:** 1.0.0
**Platform:** React Native (iOS & Android)
