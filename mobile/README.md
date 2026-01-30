eas build --platform android --profile preview

# Government Emission Mobile App

A local-first mobile application for government emission monitoring and vehicle management, built with React Native and Expo.

## 🚀 Features

### Core Functionality

- **Dashboard Overview**: Real-time statistics and quick actions
- **Vehicle Management**: Add, view, and manage government vehicles
- **Emission Testing**: Record and track emission test results
- **Office Management**: Manage government offices and compliance
- **User Profiles**: User authentication and settings

### Local-First Architecture

- **Offline Support**: Full functionality without internet connection
- **Local Database**: SQLite for reliable local data storage
- **Background Sync**: Automatic synchronization when online
- **Conflict Resolution**: Smart merging of local and remote changes

### Authentication & Security

- **Role-Based Access**: Government emission role validation
- **Secure Storage**: Encrypted token storage
- **API Integration**: Seamless backend communication

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **State Management**: Zustand
- **Database**: Expo SQLite
- **UI Components**: React Native Paper (Material Design)
- **Icons**: React Native Vector Icons
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Network**: Axios with interceptors

## 📱 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Devices

```bash
# Android
npx expo start --android

# iOS (macOS only)
npx expo start --ios

# Web (for testing)
npx expo start --web
```

## 🏗️ Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── LoadingScreen.tsx
│   │   └── StatsCard.tsx
│   ├── core/               # Core functionality
│   │   ├── api/            # API client and services
│   │   ├── database/       # SQLite database manager
│   │   ├── stores/         # Zustand state stores
│   │   └── theme/          # App theme configuration
│   ├── hooks/              # Custom React hooks
│   │   ├── useDashboardData.ts
│   │   └── useNetworkSync.ts
│   ├── navigation/         # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── screens/            # Screen components
│   │   ├── auth/           # Authentication screens
│   │   ├── OverviewScreen.tsx
│   │   ├── VehiclesScreen.tsx
│   │   └── ...
│   └── types/              # TypeScript type definitions
├── App.tsx                 # Main app component
├── app.json               # Expo configuration
└── package.json           # Dependencies and scripts
```

## 🔧 Configuration

### Backend API Configuration

Update the API base URL in `src/core/api/api-client.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? "http://localhost:8000/api/v1" // Development
  : "https://your-production-api.com/api/v1"; // Production
```

### Environment Variables

Create a `.env` file in the mobile directory:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
EXPO_PUBLIC_ENABLE_AI_ASSISTANT=true
```

Set `EXPO_PUBLIC_ENABLE_AI_ASSISTANT` to `false` in environments where the AI assistant should be hidden.

## 📊 Database Schema

The app uses SQLite with the following main tables:

### Vehicles

- Vehicle information (plate number, driver, type, etc.)
- Office association
- Sync status tracking

### Emission Tests

- Test results and dates
- Quarter and year tracking
- Remarks and created by information

### Offices

- Government office details
- Contact information
- Compliance tracking

## 🔄 Sync Strategy

### Local-First Approach

1. **Read**: Always from local database for instant response
2. **Write**: Immediately to local database, marked as 'pending'
3. **Sync**: Background process uploads pending changes
4. **Merge**: Download latest data and resolve conflicts

### Conflict Resolution

- Local changes take precedence during sync
- Server data updates local cache
- User notified of sync status

## 🎨 UI/UX Design

### Design System

- **Material Design 3**: Modern, accessible interface
- **Government Emission Theme**: Green primary colors
- **Responsive Layout**: Adapts to different screen sizes
- **Dark Mode**: Automatic system theme support

### Navigation

- **Bottom Tabs**: Main navigation between features
- **Stack Navigation**: Detailed views and forms
- **Modal Screens**: Add/edit operations

## 🔐 Authentication Flow

1. **Login Screen**: Username/password authentication
2. **Role Validation**: Government emission role required
3. **Token Storage**: Secure token persistence
4. **Auto-Login**: Automatic authentication on app start
5. **Logout**: Secure cleanup of stored credentials

## 📱 Offline Capabilities

### What Works Offline

- ✅ View all vehicles and tests
- ✅ Add new vehicles
- ✅ Record emission tests
- ✅ View dashboard statistics
- ✅ Search and filter data

### Sync Required

- 🔄 Initial data download
- 🔄 Uploading new records
- 🔄 Real-time collaboration

## 🚀 Deployment

### Production Build

```bash
# Create production build
npx expo build:android  # or build:ios
```

### Over-the-Air Updates

```bash
# Publish updates
npx expo publish
```

## 🐛 Troubleshooting

### Common Issues

**Database Errors**: Clear app data and restart

```bash
npx expo r -c  # Clear cache and restart
```

**Network Issues**: Check API URL configuration

```bash
# Verify API connectivity
curl http://localhost:8000/api/v1/auth/profile
```

**Build Errors**: Clean and reinstall dependencies

```bash
rm -rf node_modules
npm install
```

## 🔮 Future Enhancements

- [ ] Push notifications for test reminders
- [ ] Barcode scanning for vehicle identification
- [ ] Photo attachments for test records
- [ ] Advanced reporting and analytics
- [ ] Multi-language support
- [ ] Biometric authentication

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Write descriptive commit messages
4. Test on both Android and iOS
5. Update documentation for new features

## 📝 License

This project is part of the EPNRO eco-dash-navigator system.

---

For questions or support, contact the development team.
