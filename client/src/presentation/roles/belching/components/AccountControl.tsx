import React from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/shared/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/shared/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface User {
  id: string;
  username: string;
  role: "admin" | "inspector" | "viewer";
  email: string;
  status: "active" | "inactive";
}

const mockUsers: User[] = [
  {
    id: "U001",
    username: "adminuser",
    role: "admin",
    email: "admin@email.com",
    status: "active",
  },
  {
    id: "U002",
    username: "inspector1",
    role: "inspector",
    email: "inspector1@email.com",
    status: "active",
  },
  {
    id: "U003",
    username: "viewer1",
    role: "viewer",
    email: "viewer1@email.com",
    status: "inactive",
  },
];

const roleBadge = {
  admin: "bg-red-100 text-red-700 border border-red-200",
  inspector: "bg-blue-100 text-blue-700 border border-blue-200",
  viewer: "bg-gray-100 text-gray-700 border border-gray-200",
};

const statusBadge = {
  active: "bg-green-100 text-green-700 border border-green-200",
  inactive: "bg-gray-100 text-gray-500 border border-gray-200",
};

const AccountControl = () => {
  const [users, setUsers] = React.useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleAddUser = () => {
    // TODO: Implement add user functionality
  };

  const handleEditUser = (id: string) => {
    // TODO: Implement edit user functionality
  };

  const handleDeleteUser = (id: string) => {
    // TODO: Implement delete user functionality
  };

  const handleRoleChange = (id: string, newRole: string) => {
    // TODO: Implement role change functionality
  };

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-blue-100 rounded-2xl shadow-xl p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            className="rounded-full px-4 py-2 shadow-sm w-full sm:w-64"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow flex items-center gap-2 px-4 py-2 rounded-lg"
          onClick={handleAddUser}
        >
          <Plus size={18} /> Add New User
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl border shadow text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-3 py-2 font-bold text-left tracking-wide uppercase text-xs">
                ID
              </th>
              <th className="px-3 py-2 font-bold text-left tracking-wide uppercase text-xs">
                Username
              </th>
              <th className="px-3 py-2 font-bold text-left tracking-wide uppercase text-xs">
                Email
              </th>
              <th className="px-3 py-2 font-bold text-left tracking-wide uppercase text-xs">
                Role
              </th>
              <th className="px-3 py-2 font-bold text-left tracking-wide uppercase text-xs">
                Status
              </th>
              <th className="px-3 py-2 font-bold text-left tracking-wide uppercase text-xs">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, idx) => (
              <tr
                key={user.id}
                className={
                  (idx % 2 === 0 ? "bg-white" : "bg-blue-50/50") +
                  " hover:bg-blue-100 transition"
                }
              >
                <td className="px-3 py-2 font-mono text-xs text-gray-400">
                  {user.id}
                </td>
                <td className="px-3 py-2 font-semibold text-gray-800">
                  {user.username}
                </td>
                <td className="px-3 py-2 text-gray-500">{user.email}</td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-semibold border ${
                      roleBadge[user.role]
                    }`}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  <Select
                    defaultValue={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                  >
                    <SelectTrigger className="w-[110px] ml-2 h-8 text-xs border-gray-200">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="inspector">Inspector</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                      statusBadge[user.status]
                    }`}
                  >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center gap-1 px-3 py-1 rounded-lg"
                      onClick={() => handleEditUser(user.id)}
                      title="Edit User"
                    >
                      <Pencil size={15} /> Edit
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow flex items-center gap-1 px-3 py-1 rounded-lg border-0"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Delete User"
                    >
                      <Trash2 size={15} /> Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountControl;
