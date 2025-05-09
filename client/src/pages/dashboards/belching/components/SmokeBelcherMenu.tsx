import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SmokeBelcher {
  id: string;
  name: string;
  location: string;
  status: "active" | "inactive";
  lastInspection: string;
}

const SmokeBelcherMenu = () => {
  const [smokeBelchers, setSmokeBelchers] = React.useState<SmokeBelcher[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleAddNew = () => {
    // TODO: Implement add new smoke belcher functionality
  };

  const handleEdit = (id: string) => {
    // TODO: Implement edit functionality
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search smoke belchers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleAddNew}>Add New Smoke Belcher</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Inspection</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {smokeBelchers.map((belcher) => (
            <TableRow key={belcher.id}>
              <TableCell>{belcher.id}</TableCell>
              <TableCell>{belcher.name}</TableCell>
              <TableCell>{belcher.location}</TableCell>
              <TableCell>{belcher.status}</TableCell>
              <TableCell>{belcher.lastInspection}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(belcher.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(belcher.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SmokeBelcherMenu;
