import React, { createContext, useContext, ReactNode } from 'react';
import { useMatches } from '@tanstack/react-router';
import { queryClient } from '../api/query-provider';
import { toast } from 'sonner';

// Route to query key mapping
const ROUTE_QUERY_MAP: Record<string, string[]> = {
  // Emission routes
  '/government-emission/vehicles': ['vehicles'],
  '/government-emission/overview': ['emissionStats', 'recentTests', 'vehicles'],
  '/government-emission/quarterly-testing': ['quarterlyTests'],
  '/government-emission/offices': ['offices'],
  
  // Urban Greening routes
  '/urban-greening/tree-inventory': ['tree-inventory', 'tree-stats'],
  '/urban-greening/tree-requests': ['tree-management-requests'],
  '/urban-greening/greening-projects': ['greening-projects'],
  '/urban-greening/sapling-requests': ['sapling-requests'],
  '/urban-greening/overview': ['tree-stats', 'greening-projects', 'tree-management-requests'],
  
  // Admin routes
  '/admin/user-management': ['users'],
  '/admin/session-management': ['sessions'],
  '/admin/audit-logs': ['audit-logs'],
};

// Friendly names for toast notifications
const ROUTE_NAMES: Record<string, string> = {
  '/government-emission/vehicles': 'Vehicle List',
  '/government-emission/overview': 'Emission Overview',
  '/government-emission/quarterly-testing': 'Quarterly Testing',
  '/government-emission/offices': 'Offices',
  '/urban-greening/tree-inventory': 'Tree Inventory',
  '/urban-greening/tree-requests': 'Tree Requests',
  '/urban-greening/greening-projects': 'Greening Projects',
  '/urban-greening/sapling-requests': 'Sapling Requests',
  '/urban-greening/overview': 'Urban Greening Overview',
  '/admin/user-management': 'User Management',
  '/admin/session-management': 'Session Management',
  '/admin/audit-logs': 'Audit Logs',
};

interface RefreshContextValue {
  refreshCurrentPage: () => void;
  getCurrentRoute: () => string;
}

const RefreshContext = createContext<RefreshContextValue | undefined>(undefined);

export const RefreshProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const matches = useMatches();
  
  const getCurrentRoute = (): string => {
    // Get the deepest match (most specific route)
    const currentMatch = matches[matches.length - 1];
    return currentMatch?.pathname || '/';
  };

  const refreshCurrentPage = () => {
    const currentRoute = getCurrentRoute();
    
    // Find exact match first
    let queryKeys = ROUTE_QUERY_MAP[currentRoute];
    
    // If no exact match, try pattern matching
    if (!queryKeys) {
      // Try to match parent routes or patterns
      const matchedKey = Object.keys(ROUTE_QUERY_MAP).find(key => 
        currentRoute.startsWith(key)
      );
      if (matchedKey) {
        queryKeys = ROUTE_QUERY_MAP[matchedKey];
      }
    }

    if (queryKeys && queryKeys.length > 0) {
      // Invalidate all relevant queries for this route
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });

      const routeName = ROUTE_NAMES[currentRoute] || 'Page';
      toast.success(`Refreshing ${routeName}...`, {
        duration: 2000,
      });
    } else {
      // Fallback: invalidate all queries
      queryClient.invalidateQueries();
      toast.info('Refreshing all data...', {
        duration: 2000,
      });
    }
  };

  return (
    <RefreshContext.Provider value={{ refreshCurrentPage, getCurrentRoute }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = (): RefreshContextValue => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within RefreshProvider');
  }
  return context;
};
