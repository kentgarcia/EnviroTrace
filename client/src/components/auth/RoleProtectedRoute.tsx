import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuthStore';
import { UserRole } from '@/integrations/types/userData';
import { toast } from 'sonner';

interface RoleProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
    redirectPath?: string;
    showErrorMessage?: boolean;
}

/**
 * A wrapper component that checks if the user has at least one of the allowed roles
 * and renders the children only if they do; otherwise redirects to the specified path
 */
export const RoleProtectedRoute = ({
    children,
    allowedRoles,
    redirectPath = '/dashboard-selection',
    showErrorMessage = true
}: RoleProtectedRouteProps) => {
    const { token, roles } = useAuthStore();
    const isAuthenticated = token !== null;
    const location = useLocation();

    // Check if the user is authenticated at all
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Check if the user has at least one of the allowed roles
    const hasRequiredRole = roles.some(role => allowedRoles.includes(role));

    useEffect(() => {
        // Show an error message if access is denied and showErrorMessage is true
        if (isAuthenticated && !hasRequiredRole && showErrorMessage) {
            const requiredRolesList = allowedRoles.join(', ');
            toast.error(
                `Access denied. You need one of these roles to access this page: ${requiredRolesList}`,
                {
                    duration: 5000,
                    id: 'access-denied' // Prevent duplicate toasts
                }
            );
        }
    }, [isAuthenticated, hasRequiredRole, showErrorMessage, location.pathname]);

    if (!hasRequiredRole) {
        // Pass the current location to redirect back after gaining appropriate permissions
        return <Navigate to={redirectPath} replace state={{ from: location }} />;
    }

    return <>{children}</>;
};