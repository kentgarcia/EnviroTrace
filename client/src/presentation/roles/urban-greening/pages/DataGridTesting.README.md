# Data Grid Testing Page

A comprehensive testing environment for the DataGrid component with various scenarios and performance tests.

## Overview

The Data Grid Testing page provides a dedicated environment to test all features of the reusable DataGrid component. It includes different testing scenarios to validate functionality, performance, and edge cases.

## Features

### 🔍 Basic Testing Tab

- **Purpose**: Test core DataGrid functionality
- **Dataset**: 50 test user records
- **Features Tested**:
  - Sorting (all columns)
  - Filtering (text, select, date filters)
  - Cell editing (inline editing with different input types)
  - Row selection (single and multi-select)
  - Pagination with customizable page sizes
  - Global search across all columns
  - Column visibility toggle
  - Data export to CSV

### ⚡ Performance Testing Tab

- **Purpose**: Test DataGrid performance with large datasets
- **Dataset**: 1000+ transaction records
- **Features Tested**:
  - Rendering performance with large data
  - Filtering performance
  - Sorting performance
  - Search performance
  - Memory usage optimization
  - Virtual scrolling capabilities

### 🛠️ Feature Testing Tab

- **Purpose**: Test advanced features and edge cases
- **Status**: Coming Soon
- **Planned Features**:
  - Complex filtering scenarios
  - Custom cell renderers
  - Nested data structures
  - Async operations
  - Error handling
  - Edge cases

## Data Types

### TestRecord Interface

```typescript
interface TestRecord {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "pending" | "suspended";
  role: "admin" | "user" | "moderator" | "guest";
  createdDate: string;
  lastLogin?: string;
  score: number;
  isVerified: boolean;
  department: string;
  tags: string[];
}
```

### PerformanceTestRecord Interface

```typescript
interface PerformanceTestRecord {
  id: string;
  transactionId: string;
  amount: number;
  currency: "PHP" | "USD" | "EUR";
  type: "income" | "expense" | "transfer";
  category: string;
  description: string;
  date: string;
  status: "completed" | "pending" | "failed" | "cancelled";
  reference: string;
}
```

## Column Types Tested

1. **Text Columns**: Basic text display and editing
2. **Select Columns**: Dropdown selection with predefined options
3. **Number Columns**: Numeric input and validation
4. **Currency Columns**: Formatted currency display
5. **Date Columns**: Date picker and formatting
6. **Boolean Columns**: Checkbox/toggle controls
7. **Badge Columns**: Status indicators with custom styling
8. **Action Columns**: Custom buttons and operations

## Mock API Integration

The page includes realistic API simulation with:

- **Loading States**: Simulated network delays
- **Error Handling**: Error states and recovery
- **Optimistic Updates**: Immediate UI updates with rollback on failure
- **Cache Management**: TanStack Query integration for caching

## Testing Scenarios

### ✅ Functionality Tests

- [ ] Sort by each column type
- [ ] Filter by text, select, and date
- [ ] Edit cells inline
- [ ] Select single and multiple rows
- [ ] Navigate through pages
- [ ] Search globally
- [ ] Toggle column visibility
- [ ] Export data to CSV
- [ ] Refresh data

### ⚡ Performance Tests

- [ ] Render 1000+ rows
- [ ] Filter large datasets
- [ ] Sort large datasets
- [ ] Search across large datasets
- [ ] Memory usage monitoring
- [ ] Scroll performance

### 🔧 Edge Case Tests

- [ ] Empty dataset handling
- [ ] Loading state management
- [ ] Error state recovery
- [ ] Network failure scenarios
- [ ] Invalid data handling
- [ ] Concurrent updates

## Usage Instructions

1. **Access the Page**: Navigate to Urban Greening → Data Grid Testing
2. **Select Test Scenario**: Choose from Basic, Performance, or Feature testing tabs
3. **Interact with Data**: Try sorting, filtering, editing, and selecting rows
4. **Monitor Performance**: Check browser dev tools for performance metrics
5. **Test Edge Cases**: Try various scenarios to validate robustness

## Benefits

- **Quality Assurance**: Comprehensive testing of DataGrid functionality
- **Performance Validation**: Ensure smooth operation with large datasets
- **Feature Documentation**: Live examples of all DataGrid capabilities
- **Development Aid**: Quick environment for testing new features
- **User Training**: Demonstration environment for end users

## Future Enhancements

- [ ] Automated test suite integration
- [ ] Performance benchmarking
- [ ] Visual regression testing
- [ ] Accessibility testing
- [ ] Mobile responsiveness testing
- [ ] Load testing scenarios

## Technical Notes

- Uses TanStack Table v8 for core functionality
- Integrates with TanStack Query for state management
- Implements React optimization patterns (useMemo, useCallback)
- Follows TypeScript best practices
- Includes proper error boundaries
- Supports both light and dark themes
