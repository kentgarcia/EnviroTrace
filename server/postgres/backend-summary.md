# Backend Server Refactoring Summary

## Overview

The backend server is a Node.js/Apollo Server application that has been refactored to align with a new PostgreSQL database schema defined in `server\migrations\new_db.sql`. The system serves as the API layer for environmental monitoring and compliance tracking, including vehicle emissions, belching violations, and driver records.

## Database Structure

The PostgreSQL database is organized into three main schemas:

- **auth**: Handles users, profiles, and roles
- **belching**: Manages vehicle emissions violations and related entities
- **emission**: Tracks government vehicle emissions testing

## Completed Modules

### Auth Module

- **Purpose**: User authentication and authorization
- **Key Tables**: `auth.users`, `auth.profiles`, `auth.user_roles`
- **Features**: User registration, login, role management
- **Status**: Fully refactored to new schema

### User Module

- **Purpose**: User entity management
- **Features**: CRUD operations for user accounts
- **Status**: Refactored to include `deletedAt` field for soft deletion

### Belching Module

- **Purpose**: Track vehicle emissions violations for public transportation
- **Key Tables**:
  - `belching.records` - Core vehicle records
  - `belching.violations` - Specific violation instances
  - `belching.drivers` - Driver information
  - `belching.fees` - Fee structure for violations
  - `belching.record_history` - Payment and status tracking
- **Features**: Comprehensive violation tracking, payment status, driver-vehicle relationships
- **Status**: Fully refactored with specialized repositories:
  - BelchingFeeRepository
  - BelchingDriverRepository
  - BelchingRecordRepository
  - BelchingRecordHistoryRepository
  - BelchingViolationRepository

### Emission Module

- **Purpose**: Government vehicle emissions compliance tracking
- **Key Tables**:
  - `emission.vehicles` - Government vehicles
  - `emission.tests` - Emission test results
  - `emission.test_schedules` - Testing schedules
  - `emission.vehicle_driver_history` - Historical driver assignments
- **Features**: Vehicle management, emission testing, compliance tracking
- **Status**: Fully refactored with specialized repositories:
  - VehicleRepository
  - VehicleDriverHistoryRepository
  - EmissionTestRepository
  - TestScheduleRepository

### Driver Module

- **Purpose**: Driver information management
- **Key Tables**: `belching.drivers`
- **Features**: Driver registration, search, violations association
- **Status**: Refactored to align with new schema:
  - Restructured to match new table fields (firstName, middleName, lastName)
  - Removed direct offense handling (now in belching.violations)
  - Added proper error handling

### Order of Payments Module

- **Purpose**: Track payments for violations
- **Key Tables**: `belching.record_history`
- **Features**: Payment tracking, receipt management
- **Status**: Completely refactored:
  - Aligned with new belching.record_history table
  - Added filtering capabilities
  - Improved error handling

## Architectural Patterns

### Repository Pattern

- Each domain entity has a dedicated repository
- Repositories handle CRUD operations and specialized queries
- Clean separation of database logic from resolvers

### GraphQL Schema Design

- Types closely mirror database structures but with GraphQL naming conventions
- Inputs for creating/updating entities
- Filter inputs for complex queries

### Error Handling

- Consistent error typing using ErrorType enum
- Proper error propagation from repositories to resolvers

## Technical Improvements

1. **Strong Typing**: TypeScript interfaces for all entities
2. **Transaction Support**: For operations affecting multiple tables
3. **Improved Filtering**: More robust query filtering options
4. **Error Handling**: Consistent approach across modules
5. **Naming Consistency**: camelCase in GraphQL, snake_case in DB

## Pending Work

- Testing: Comprehensive tests for all modules
- Service Layer: Review business logic for additional refinements
- Client Integration: Ensure client-side compatibility with schema changes

## Database Schema Changes

Major structural changes include:

- Moved from a flat database to schema-based organization
- Added proper foreign key constraints
- Standardized timestamp fields across all tables
- Enhanced violation tracking with more detailed metadata
- Improved driver entity with more comprehensive attributes
