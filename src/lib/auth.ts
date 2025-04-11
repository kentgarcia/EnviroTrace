
import { supabase } from "@/integrations/supabase/client";
import { type User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export type UserRole = 'admin' | 'air-quality' | 'tree-management' | 'government-emission';

export interface UserData {
  id: string;
  email: string;
  roles: UserRole[];
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getUserRoles(userId: string): Promise<UserRole[]> {
  // First check if we have roles in localStorage
  try {
    const cachedRoles = localStorage.getItem('cached_user_roles');
    if (cachedRoles) {
      const parsed = JSON.parse(cachedRoles);
      const timestamp = parsed.timestamp;
      
      // If cache is less than 24 hours old, use it
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        console.log('Using cached user roles');
        return parsed.data.map((item: any) => item.role as UserRole);
      }
    }
  } catch (error) {
    console.error('Error reading cached user roles:', error);
  }

  // If no valid cache, fetch from API
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
    
    // Cache the fetched data
    localStorage.setItem('cached_user_roles', JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    
    return data.map(item => item.role as UserRole);
  } catch (networkError) {
    console.error('Network error fetching user roles:', networkError);
    
    // If network request fails, try to use even stale cache as fallback
    try {
      const cachedRoles = localStorage.getItem('cached_user_roles');
      if (cachedRoles) {
        const parsed = JSON.parse(cachedRoles);
        console.log('Using stale cached user roles due to network error');
        return parsed.data.map((item: any) => item.role as UserRole);
      }
    } catch (cacheError) {
      console.error('Error reading cached user roles:', cacheError);
    }
    
    return [];
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOnline, safeSupabaseQuery } = useOfflineSync();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          // Fetch user roles when authentication state changes
          fetchUserData(session.user);
        } else {
          setUserData(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // When online status changes, try to fetch fresh data
  useEffect(() => {
    if (isOnline && user) {
      fetchUserData(user);
    }
  }, [isOnline, user]);

  const fetchUserData = async (user: User) => {
    try {
      // Try to get roles from the enhanced getUserRoles function with caching
      const roles = await getUserRoles(user.id);
      
      setUserData({
        id: user.id,
        email: user.email || '',
        roles: roles
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    userData,
    loading,
    isOnline,
    signIn,
    signUp,
    signOut
  };
}
