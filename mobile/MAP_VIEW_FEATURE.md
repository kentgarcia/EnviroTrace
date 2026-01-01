# Map View Feature - Mobile

## Overview

The Map View feature provides an interactive geographical visualization of tree locations in the urban greening system. This screen is currently in setup mode and requires `react-native-maps` to be installed for full functionality.

## Current Status

**Setup Screen Active** - The feature displays installation instructions until react-native-maps is configured.

## Installation Steps

### 1. Install react-native-maps

```bash
npx expo install react-native-maps
```

### 2. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Maps SDK for Android and iOS
4. Create API credentials (API Key)
5. Restrict the API key to your app

### 3. Configure API Key

Add to `app.json`:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

### 4. Rebuild the App

```bash
# For Android
npx expo run:android

# For iOS  
npx expo run:ios
```

## Features (After Setup)

### Interactive Map Display
- **Google Maps Integration**: Full-featured map with standard controls
- **Tree Markers**: Custom markers showing tree locations with color coding
- **Marker Clustering**: Automatic grouping of nearby trees for better performance
- **User Location**: Shows current GPS location on the map

### Tree Status Visualization
- 🟢 **Healthy** (Green) - Trees in good health
- 💛 **Needs Attention** (Yellow) - Trees requiring care
- 🧡 **Diseased** (Orange) - Trees with health issues
- 🔴 **Cut** (Red) - Trees that have been removed
- ⚫ **Dead** (Gray) - Non-living trees

### Filtering System
- **Status Filters**: Alive, Cut, Dead, Replaced
- **Health Filters**: Healthy, Needs Attention, Diseased
- **Multi-select**: Combine multiple filters
- **Active Indicator**: Shows when filters are applied

### Tree Details
- **Tap to View**: Click any marker for quick info
- **Full Details Modal**: Comprehensive tree information including:
  - Tree code and species
  - Status and health badges
  - Location (address, barangay)
  - Measurements (height, diameter)
  - Planting date and notes

### Map Controls
- **Legend**: Color-coded reference guide
- **Tree Count**: Live count of visible trees
- **Filter Button**: Quick access to filtering options
- **Zoom/Pan**: Standard map navigation gestures

## Navigation

### Access Points
1. **Overview Screen** → Quick Actions → "Map" button
2. **Bottom Tab Bar** → "Map" tab (7th tab in Tree Management section)

### Navigation Structure
```
TreeManagementNavigator
├── Overview
├── TreeInventory
├── MapView ← New screen
├── TreeRequests
├── GreeningProjects
├── FeeRecords
└── Profile
```

## Technical Implementation

### API Integration

The map view uses the Tree Inventory API (`tree-inventory-api.ts`):

```typescript
// Fetch trees in map bounds
const { data } = await treeInventoryApi.getTreesInBounds({
  min_lat: region.latitude - region.latitudeDelta / 2,
  max_lat: region.latitude + region.latitudeDelta / 2,
  min_lng: region.longitude - region.longitudeDelta / 2,
  max_lng: region.longitude + region.longitudeDelta / 2,
  status: filterStatus,
  health: filterHealth,
});
```

### Data Flow
1. User pans/zooms map
2. `onRegionChangeComplete` fires
3. New bounds calculated
4. API call fetches trees in viewport
5. Markers updated on map
6. User taps marker → fetch detailed tree data

### Performance Optimizations
- **Lazy Loading**: Only fetch trees in current viewport
- **Debounced Updates**: Prevent excessive API calls during panning
- **Marker Clustering**: Improve performance with many trees
- **Memoized Components**: Reduce re-renders

## File Structure

```
mobile/src/
├── screens/roles/tree-management/
│   └── MapViewScreen.tsx           # Main map view component
├── core/api/
│   └── tree-inventory-api.ts       # API client for tree data
└── navigation/
    └── TreeManagementNavigator.tsx # Navigation config
```

## Development Roadmap

### Phase 1: Setup (Current)
- ✅ Create setup instruction screen
- ✅ Add navigation integration
- ✅ Create API client
- ⏳ Install react-native-maps
- ⏳ Configure Google Maps API key

### Phase 2: Core Features
- ⏳ Interactive map with tree markers
- ⏳ Status-based color coding
- ⏳ Basic filtering (status, health)
- ⏳ Tree detail modals

### Phase 3: Advanced Features
- ⏳ Marker clustering
- ⏳ Search by tree code
- ⏳ Navigation to tree location
- ⏳ Offline map caching
- ⏳ Export visible trees to CSV

## Troubleshooting

### Map Not Displaying
- Verify Google Maps API key is correct
- Check API key restrictions (Android/iOS package names)
- Ensure Maps SDK is enabled in Google Cloud Console
- Rebuild the app after configuration changes

### Markers Not Showing
- Check API endpoint is reachable
- Verify trees have valid lat/lng coordinates
- Check filters aren't excluding all trees
- Review network requests in dev tools

### Performance Issues
- Enable marker clustering for large datasets
- Reduce zoom level to show fewer markers
- Clear filters to reduce data load
- Check network connection speed

## Support

For implementation assistance or feature requests:
1. Check mobile app documentation
2. Review Tree Inventory API documentation
3. Contact development team

---

**Last Updated**: December 27, 2025
**Version**: 1.0.0 (Setup Phase)
**Status**: Setup Instructions Active
