
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/lib/auth";
import { Loader2 } from "lucide-react";

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string | null;
  roles: UserRole[];
}

export default function UserManagement() {
  const navigate = useNavigate();
  const { user, userData, loading } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // New user form state
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserRoles, setNewUserRoles] = useState<UserRole[]>([]);
  
  // Edit user dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editRoles, setEditRoles] = useState<UserRole[]>([]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/");
      } else if (userData && !userData.roles.includes('admin')) {
        navigate("/dashboard-selection");
        toast.error("You don't have access to admin page");
      } else {
        fetchUsers();
      }
    }
  }, [user, userData, loading, navigate]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch all users with their profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name');
      
      if (profilesError) throw profilesError;

      // For each profile, fetch their roles
      const usersWithRoles: UserWithRoles[] = [];
      
      for (const profile of profiles) {
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.id);
        
        if (rolesError) throw rolesError;
        
        usersWithRoles.push({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          roles: roles.map(r => r.role as UserRole)
        });
      }
      
      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast.error('Email and password are required');
      return;
    }
    
    setIsCreating(true);
    try {
      // 1. Create the user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUserEmail,
        password: newUserPassword,
        email_confirm: true,
        user_metadata: { full_name: newUserFullName }
      });
      
      if (authError) throw authError;
      
      // 2. Add roles to the user
      if (newUserRoles.length > 0) {
        const rolePromises = newUserRoles.map(role => 
          supabase.from('user_roles').insert({
            user_id: authData.user.id,
            role
          })
        );
        
        await Promise.all(rolePromises);
      }
      
      toast.success('User created successfully');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserFullName('');
      setNewUserRoles([]);
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditUser = (user: UserWithRoles) => {
    setEditingUser(user);
    setEditFullName(user.full_name || '');
    setEditRoles(user.roles);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    
    try {
      // Update full name in profile
      await supabase
        .from('profiles')
        .update({ full_name: editFullName })
        .eq('id', editingUser.id);
      
      // Delete all existing roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', editingUser.id);
      
      // Add new roles
      if (editRoles.length > 0) {
        const roleInserts = editRoles.map(role => ({
          user_id: editingUser.id,
          role
        }));
        
        await supabase
          .from('user_roles')
          .insert(roleInserts);
      }
      
      toast.success('User updated successfully');
      setEditOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const toggleRole = (role: UserRole) => {
    if (newUserRoles.includes(role)) {
      setNewUserRoles(newUserRoles.filter(r => r !== role));
    } else {
      setNewUserRoles([...newUserRoles, role]);
    }
  };

  const toggleEditRole = (role: UserRole) => {
    if (editRoles.includes(role)) {
      setEditRoles(editRoles.filter(r => r !== role));
    } else {
      setEditRoles([...editRoles, role]);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="admin" />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <header className="mb-8">
              <h1 className="text-3xl font-semibold">User Management</h1>
              <p className="text-muted-foreground">Create and manage user accounts</p>
            </header>

            <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="w-full md:w-1/3">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create New User</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Add a new user account to the system.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="password" className="text-right">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="fullName" className="text-right">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        value={newUserFullName}
                        onChange={(e) => setNewUserFullName(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Roles</Label>
                      <div className="col-span-3 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="admin" 
                            checked={newUserRoles.includes('admin')}
                            onCheckedChange={() => toggleRole('admin')}
                          />
                          <label htmlFor="admin">Admin</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="air-quality" 
                            checked={newUserRoles.includes('air-quality')}
                            onCheckedChange={() => toggleRole('air-quality')}
                          />
                          <label htmlFor="air-quality">Air Quality</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="tree-management" 
                            checked={newUserRoles.includes('tree-management')}
                            onCheckedChange={() => toggleRole('tree-management')}
                          />
                          <label htmlFor="tree-management">Tree Management</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="government-emission" 
                            checked={newUserRoles.includes('government-emission')}
                            onCheckedChange={() => toggleRole('government-emission')}
                          />
                          <label htmlFor="government-emission">Government Emission</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button onClick={handleCreateUser} disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create User'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.full_name || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                              <span 
                                key={role} 
                                className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            onClick={() => handleEditUser(user)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and roles.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Email</Label>
              <div className="col-span-3">
                {editingUser?.email}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editFullName" className="text-right">
                Full Name
              </Label>
              <Input
                id="editFullName"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Roles</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-admin" 
                    checked={editRoles.includes('admin')}
                    onCheckedChange={() => toggleEditRole('admin')}
                  />
                  <label htmlFor="edit-admin">Admin</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-air-quality" 
                    checked={editRoles.includes('air-quality')}
                    onCheckedChange={() => toggleEditRole('air-quality')}
                  />
                  <label htmlFor="edit-air-quality">Air Quality</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-tree-management" 
                    checked={editRoles.includes('tree-management')}
                    onCheckedChange={() => toggleEditRole('tree-management')}
                  />
                  <label htmlFor="edit-tree-management">Tree Management</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-government-emission" 
                    checked={editRoles.includes('government-emission')}
                    onCheckedChange={() => toggleEditRole('government-emission')}
                  />
                  <label htmlFor="edit-government-emission">Government Emission</label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
