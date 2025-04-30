import { supabase } from "@/integrations/supabase/client";
import { type User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useAuthStore } from "@/hooks/useAuthStore";
import { UserData, UserRole } from "@/integrations/types/userData";

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signUp(
  email: string,
  password: string,
  fullName: string
) {
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
  const { roles, setRoles } = useAuthStore.getState();
  if (roles && roles.length > 0) {
    return roles;
  }

  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (error) {
      console.error("Error fetching user roles:", error);
      return [];
    }
    const fetchedRoles = data.map((item) => item.role as UserRole);
    setRoles(fetchedRoles);
    return fetchedRoles;
  } catch (networkError) {
    console.error("Network error fetching user roles:", networkError);
    return [];
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOnline, safeSupabaseQuery } = useOfflineSync();
  const { setRoles, clearRoles } = useAuthStore();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user);
      } else {
        setUserData(null);
        clearRoles();
        setLoading(false);
      }
    });

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

  useEffect(() => {
    if (isOnline && user) {
      fetchUserData(user);
    }
  }, [isOnline, user]);

  const fetchUserData = async (user: User) => {
    try {
      const roles = await getUserRoles(user.id);
      setRoles(roles);
      setUserData({
        id: user.id,
        email: user.email || "",
        roles: roles,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
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
    signOut,
  };
}
