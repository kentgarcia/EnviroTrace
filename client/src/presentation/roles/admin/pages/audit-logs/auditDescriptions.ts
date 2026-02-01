import { AuditLog } from "@/core/api/admin-api";

/**
 * Generate human-readable descriptions for audit logs
 * Maps API endpoints and HTTP methods to user-friendly descriptions
 */
export const getAuditDescription = (log: AuditLog): string => {
    const method = log.http_method;
    const path = log.route_path.toLowerCase();
    const event = log.event_name.toLowerCase();
    
    // ==================== AUTHENTICATION ====================
    if (path.includes('/auth')) {
        if (path.includes('/me')) return 'Checked authentication status';
        if (path.includes('/login')) return 'User signed in';
        if (path.includes('/logout')) return 'User signed out';
        if (path.includes('/refresh')) return 'Refreshed authentication token';
        if (path.includes('/register')) return 'New user registered';
    }
    
    // ==================== ADMIN - USER MANAGEMENT ====================
    if (path.includes('/admin/users')) {
        if (path.includes('/reactivate')) return 'Reactivated user account';
        if (path.includes('/roles')) {
            if (method === 'POST') return 'Assigned user role';
            if (method === 'DELETE') return 'Removed user role';
            if (method === 'GET') return 'Viewed user roles';
        }
        if (method === 'POST') return 'Created new user account';
        if (method === 'PUT') return 'Updated user account';
        if (method === 'DELETE') return 'Deleted user account';
        if (method === 'GET') {
            if (path.match(/\/users\/[^\/]+$/)) return 'Viewed user details';
            return 'Viewed user list';
        }
    }
    
    // ==================== ADMIN - AUDIT LOGS ====================
    if (path.includes('/admin/audit')) {
        if (method === 'GET') {
            if (path.match(/\/logs\/[a-f0-9-]+$/)) return 'Viewed audit log details';
            return 'Viewed audit logs';
        }
    }
    
    // ==================== PROFILE MANAGEMENT ====================
    if (path.includes('/profile')) {
        if (path.includes('/me')) {
            if (method === 'GET') return 'Viewed personal profile';
            return 'Updated personal profile';
        }
        if (method === 'PUT' || method === 'PATCH') return 'Updated user profile';
        if (method === 'POST') return 'Created user profile';
        if (method === 'GET') return 'Viewed user profile';
    }
    
    // ==================== EMISSIONS - OFFICES ====================
    if (path.includes('/offices')) {
        if (method === 'POST') return 'Registered new office';
        if (method === 'PUT') return 'Updated office information';
        if (method === 'DELETE') return 'Deleted office';
        if (method === 'GET') {
            if (path.match(/\/offices\/[^\/]+$/)) return 'Viewed office details';
            return 'Viewed office list';
        }
    }
    
    // ==================== EMISSIONS - VEHICLES ====================
    if (path.includes('/vehicles')) {
        if (path.includes('/remarks')) {
            if (method === 'PUT') return 'Updated vehicle remarks';
            if (method === 'GET') return 'Viewed vehicle remarks';
        }
        if (method === 'POST') return 'Registered new vehicle';
        if (method === 'PUT') return 'Updated vehicle information';
        if (method === 'DELETE') return 'Deleted vehicle';
        if (method === 'GET') {
            if (path.match(/\/vehicles\/[^\/]+$/)) return 'Viewed vehicle details';
            return 'Viewed vehicle list';
        }
    }
    
    // ==================== EMISSIONS - TESTS ====================
    if (path.includes('/tests') && !path.includes('/test-schedules')) {
        if (method === 'POST') return 'Recorded emission test result';
        if (method === 'PUT') return 'Updated emission test record';
        if (method === 'DELETE') return 'Deleted emission test record';
        if (method === 'GET') {
            if (path.match(/\/tests\/[^\/]+$/)) return 'Viewed test details';
            return 'Viewed emission tests';
        }
    }
    
    // ==================== EMISSIONS - TEST SCHEDULES ====================
    if (path.includes('/test-schedules') || path.includes('/schedules')) {
        if (method === 'POST') return 'Created emission test schedule';
        if (method === 'PUT') return 'Updated test schedule';
        if (method === 'DELETE') return 'Deleted test schedule';
        if (method === 'GET') {
            if (path.match(/\/schedules\/[^\/]+/)) return 'Viewed test schedule';
            return 'Viewed test schedules';
        }
    }
    
    // ==================== PLANTING - URBAN GREENING ====================
    if (path.includes('/planting/urban-greening')) {
        if (method === 'POST') return 'Recorded urban greening planting';
        if (method === 'PUT') return 'Updated planting record';
        if (method === 'DELETE') return 'Deleted planting record';
        if (method === 'GET') {
            if (path.match(/\/urban-greening\/[^\/]+$/)) return 'Viewed planting details';
            return 'Viewed urban greening plantings';
        }
    }
    
    // ==================== PLANTING - SAPLINGS ====================
    if (path.includes('/planting/saplings')) {
        if (path.includes('/statistics')) return 'Viewed sapling statistics';
        if (method === 'POST') return 'Recorded sapling collection';
        if (method === 'PUT') return 'Updated sapling collection';
        if (method === 'DELETE') return 'Deleted sapling collection';
        if (method === 'GET') {
            if (path.match(/\/saplings\/[^\/]+$/)) return 'Viewed sapling details';
            return 'Viewed sapling collections';
        }
    }
    
    // ==================== SAPLING REQUESTS ====================
    if (path.includes('/sapling-requests')) {
        if (method === 'POST') return 'Submitted sapling request';
        if (method === 'PUT') return 'Updated sapling request';
        if (method === 'DELETE') return 'Cancelled sapling request';
        if (method === 'GET') {
            if (path.match(/\/sapling-requests\/[^\/]+$/)) return 'Viewed sapling request details';
            return 'Viewed sapling requests';
        }
    }
    
    // ==================== SESSION MANAGEMENT ====================
    if (path.includes('/session')) {
        if (path.includes('/terminate-all')) return 'Terminated all user sessions';
        if (path.includes('/terminate')) return 'Terminated user session';
        if (method === 'POST') return 'Created new session';
    }
    
    // ==================== TREE INVENTORY - SPECIES ====================
    if (path.includes('/tree-inventory/species')) {
        if (method === 'POST') return 'Added tree species';
        if (method === 'PUT') return 'Updated tree species information';
        if (method === 'DELETE') return 'Deleted tree species';
        if (method === 'GET') {
            if (path.match(/\/species\/[^\/]+$/)) return 'Viewed tree species details';
            return 'Viewed tree species list';
        }
    }
    
    // ==================== TREE INVENTORY - TREES ====================
    if (path.includes('/tree-inventory/trees')) {
        if (path.includes('/stats')) return 'Viewed tree inventory statistics';
        if (path.includes('/restore')) return 'Restored deleted tree record';
        if (path.includes('/batch')) return 'Batch imported tree records';
        if (path.includes('/add-trees')) return 'Added trees to project';
        if (method === 'POST') return 'Added tree to inventory';
        if (method === 'PUT') return 'Updated tree inventory record';
        if (method === 'DELETE') return 'Removed tree from inventory';
        if (method === 'GET') {
            if (path.match(/\/trees\/[^\/]+$/)) return 'Viewed tree details';
            return 'Viewed tree inventory';
        }
    }
    
    // ==================== TREE INVENTORY - MONITORING ====================
    if (path.includes('/tree-inventory/monitoring')) {
        if (method === 'POST') return 'Logged tree monitoring activity';
        if (method === 'GET') {
            if (path.match(/\/monitoring\/[^\/]+$/)) return 'Viewed monitoring log details';
            return 'Viewed tree monitoring logs';
        }
    }
    
    // ==================== TREE INVENTORY - PROJECTS ====================
    if (path.includes('/tree-inventory/projects')) {
        if (method === 'POST') return 'Created planting project';
        if (method === 'PUT') return 'Updated planting project';
        if (method === 'DELETE') return 'Deleted planting project';
        if (method === 'GET') {
            if (path.match(/\/projects\/[^\/]+$/)) return 'Viewed planting project details';
            return 'Viewed planting projects';
        }
    }
    
    // ==================== TREE MANAGEMENT - REQUESTS ====================
    if (path.includes('/tree-management')) {
        if (path.includes('/v2/requests')) {
            if (path.includes('/receiving')) return 'Updated request receiving status';
            if (path.includes('/inspection')) return 'Updated request inspection status';
            if (path.includes('/requirements')) return 'Updated request requirements';
            if (path.includes('/clearance')) return 'Updated clearance status';
            if (path.includes('/denr')) return 'Updated DENR information';
            if (method === 'POST') return 'Submitted tree management request';
            if (method === 'PUT') return 'Updated tree management request';
            if (method === 'DELETE') return 'Cancelled tree management request';
            if (method === 'GET') {
                if (path.match(/\/requests\/[^\/]+$/)) return 'Viewed request details';
                return 'Viewed tree management requests';
            }
        }
        if (path.includes('/requests') && !path.includes('/v2')) {
            if (method === 'POST') return 'Submitted tree management request';
            if (method === 'PUT') return 'Updated tree management request';
            if (method === 'DELETE') return 'Cancelled tree management request';
            if (method === 'GET') {
                if (path.match(/\/requests\/[^\/]+$/)) return 'Viewed request details';
                return 'Viewed tree management requests';
            }
        }
        if (path.includes('/processing-standards')) {
            if (method === 'PUT') return 'Updated processing standards';
            if (method === 'DELETE') return 'Deleted processing standards';
            if (method === 'GET') return 'Viewed processing standards';
        }
        if (path.includes('/dropdown-options')) {
            if (method === 'POST') return 'Created dropdown option';
            if (method === 'PUT') return 'Updated dropdown option';
            if (method === 'DELETE') return 'Deleted dropdown option';
            if (method === 'GET') return 'Viewed dropdown options';
        }
    }
    
    // ==================== URBAN GREENING PROJECTS ====================
    if (path.includes('/urban-greening-projects') || (path.includes('/urban-greening') && !path.includes('/fees') && !path.includes('/planting'))) {
        if (method === 'POST') return 'Created urban greening project';
        if (method === 'PUT' || method === 'PATCH') return 'Updated urban greening project';
        if (method === 'DELETE') return 'Deleted urban greening project';
        if (method === 'GET') {
            if (path.match(/\/urban-greening(-projects)?\/[^\/]+$/)) return 'Viewed urban greening project details';
            return 'Viewed urban greening projects';
        }
    }
    
    // ==================== FILE UPLOADS ====================
    if (path.includes('/upload')) {
        if (path.includes('/create-bucket')) return 'Created storage bucket';
        if (path.includes('/tree-images')) return 'Uploaded multiple tree images';
        if (path.includes('/tree-image')) {
            if (method === 'POST') return 'Uploaded tree image';
            if (method === 'DELETE') return 'Deleted tree image';
            if (method === 'GET') return 'Viewed tree images';
        }
    }
    
    // ==================== GEMINI AI ====================
    if (path.includes('/gemini')) {
        if (path.includes('/text/stream')) return 'Streamed AI text generation';
        if (path.includes('/text')) return 'Generated AI text response';
        if (path.includes('/image/analyze-json')) return 'Analyzed image with structured output';
        if (path.includes('/image/analyze')) return 'Analyzed image with AI';
        if (path.includes('/multimodal/upload')) return 'Uploaded multimodal content';
        if (path.includes('/multimodal')) return 'Generated multimodal AI response';
        if (path.includes('/environmental/analyze-upload')) return 'Uploaded environmental analysis';
        if (path.includes('/environmental/analyze')) return 'Analyzed environmental data';
        if (path.includes('/tokens/count')) return 'Calculated token usage';
        if (path.includes('/recognize-plate')) return 'Recognized license plate';
        if (path.includes('/test-plate-recognition')) return 'Tested plate recognition';
    }
    
    // ==================== DASHBOARD ====================
    if (path.includes('/dashboard')) {
        return 'Accessed dashboard analytics';
    }
    
    // ==================== RECOMMENDATIONS ====================
    if (path.includes('/recommendation')) {
        return 'Generated environmental recommendations';
    }
    
    // ==================== FEES ====================
    if (path.includes('/fees')) {
        if (path.includes('/urban-greening')) {
            if (method === 'POST') return 'Created urban greening fee record';
            if (method === 'PUT') return 'Updated fee record';
            if (method === 'DELETE') return 'Deleted fee record';
            if (method === 'GET') {
                if (path.match(/\/urban-greening\/[^\/]+$/)) return 'Viewed fee record details';
                return 'Viewed urban greening fees';
            }
        }
    }
    
    // ==================== FALLBACK ====================
    // Format event_name as fallback for unmatched paths
    return event
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};
