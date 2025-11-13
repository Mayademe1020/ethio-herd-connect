import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AdminUser, AdminRole, AdminPermission } from '@/types/admin';
import { useToastNotifications } from '@/hooks/useToastNotifications';

interface AdminContextType {
  adminUser: AdminUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  permissions: AdminPermission[];
  loading: boolean;
  signInAsAdmin: (email: string, password: string) => Promise<{ error: any }>;
  signOutAdmin: () => Promise<void>;
  hasPermission: (resource: string, action: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

// Admin role hierarchy and permissions
const ADMIN_ROLES: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    { id: 'all', name: 'Full Access', description: 'Complete system access', resource: '*', action: '*' },
  ],
  system_admin: [
    { id: 'users_manage', name: 'User Management', description: 'Manage user accounts', resource: 'users', action: 'manage' },
    { id: 'system_monitor', name: 'System Monitoring', description: 'Monitor system health', resource: 'system', action: 'read' },
    { id: 'database_manage', name: 'Database Management', description: 'Manage database operations', resource: 'database', action: 'manage' },
    { id: 'security_monitor', name: 'Security Monitoring', description: 'Monitor security events', resource: 'security', action: 'read' },
    { id: 'analytics_read', name: 'Analytics Access', description: 'View analytics data', resource: 'analytics', action: 'read' },
    { id: 'deployments_manage', name: 'Deployment Management', description: 'Manage deployments', resource: 'deployments', action: 'manage' },
  ],
  support_admin: [
    { id: 'users_read', name: 'User Data Access', description: 'View user information', resource: 'users', action: 'read' },
    { id: 'support_tickets', name: 'Support Tickets', description: 'Handle support requests', resource: 'support', action: 'manage' },
    { id: 'system_read', name: 'System Status', description: 'View system status', resource: 'system', action: 'read' },
    { id: 'emergency_response', name: 'Emergency Response', description: 'Respond to emergencies', resource: 'emergency', action: 'manage' },
  ],
  readonly_admin: [
    { id: 'users_readonly', name: 'Read-only User Access', description: 'View user data only', resource: 'users', action: 'read' },
    { id: 'system_readonly', name: 'Read-only System Access', description: 'View system data only', resource: 'system', action: 'read' },
    { id: 'analytics_readonly', name: 'Read-only Analytics', description: 'View analytics only', resource: 'analytics', action: 'read' },
  ],
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToastNotifications();

  // Check if current user is an admin
  const checkAdminStatus = async (user: User): Promise<AdminUser | null> => {
    try {
      // For now, check if user email is in a hardcoded list of admin emails
      // In production, this would check the admin_users table
      const adminEmails = ['admin@ethioherdconnect.com', 'superadmin@ethioherdconnect.com'];

      if (!adminEmails.includes(user.email || '')) {
        return null;
      }

      // Mock admin data - in production this would come from the database
      const mockAdminData: AdminUser = {
        id: 'admin-' + user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || 'Admin User',
        role: user.email === 'superadmin@ethioherdconnect.com' ? 'super_admin' : 'system_admin',
        is_active: true,
        last_login: new Date().toISOString(),
        created_at: user.created_at,
        updated_at: new Date().toISOString(),
        permissions: ADMIN_ROLES[user.email === 'superadmin@ethioherdconnect.com' ? 'super_admin' : 'system_admin'] || [],
      };

      return mockAdminData;
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      return null;
    }
  };

  // Initialize admin context
  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const adminData = await checkAdminStatus(user);
          setAdminUser(adminData);
          setPermissions(adminData?.permissions || []);
        }
      } catch (error) {
        console.error('Error initializing admin context:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAdmin();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const adminData = await checkAdminStatus(session.user);
          setAdminUser(adminData);
          setPermissions(adminData?.permissions || []);
        } else if (event === 'SIGNED_OUT') {
          setAdminUser(null);
          setPermissions([]);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInAsAdmin = async (email: string, password: string) => {
    try {
      setLoading(true);

      // First, authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        // Check if user is an admin
        const adminData = await checkAdminStatus(data.user);
        if (!adminData) {
          // Sign out if not an admin
          await supabase.auth.signOut();
          return { error: new Error('Access denied. Admin privileges required.') };
        }

        setAdminUser(adminData);
        setPermissions(adminData.permissions);
        showSuccess('Admin Access Granted', `Welcome back, ${adminData.full_name}`);
      }

      return { error: null };
    } catch (error) {
      console.error('Admin sign in error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOutAdmin = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setAdminUser(null);
      setPermissions([]);
      showSuccess('Admin Signed Out', 'You have been signed out of admin mode.');
    } catch (error) {
      console.error('Admin sign out error:', error);
      showError('Sign Out Error', 'Failed to sign out properly.');
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!adminUser) return false;

    // Super admin has all permissions
    if (adminUser.role === 'super_admin') return true;

    // Check specific permissions
    return permissions.some(permission =>
      (permission.resource === '*' || permission.resource === resource) &&
      (permission.action === '*' || permission.action === action)
    );
  };

  const refreshPermissions = async () => {
    if (!adminUser) return;

    try {
      const updatedPermissions = ADMIN_ROLES[adminUser.role] || [];
      setPermissions(updatedPermissions);
    } catch (error) {
      console.error('Error refreshing permissions:', error);
    }
  };

  const value = {
    adminUser,
    isAdmin: !!adminUser,
    isSuperAdmin: adminUser?.role === 'super_admin',
    permissions,
    loading,
    signInAsAdmin,
    signOutAdmin,
    hasPermission,
    refreshPermissions,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};