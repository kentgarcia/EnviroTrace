
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search, PlusCircle } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { SkeletonTable } from "@/components/ui/skeleton-table";

interface Record {
  id: string;
  name: string;
  date: string;
  status: "active" | "pending" | "completed" | string;
  [key: string]: string | number;
}

interface RecordTableProps {
  title: string;
  records: Record[];
  columns: {
    key: string;
    title: string;
  }[];
  isLoading?: boolean;
}

export function RecordTable({ 
  title, 
  records: initialRecords, 
  columns, 
  isLoading = false 
}: RecordTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [records, setRecords] = useState(initialRecords);
  
  // Update records when initialRecords changes
  useEffect(() => {
    setRecords(initialRecords);
  }, [initialRecords]);

  const filteredRecords = records.filter((record) => 
    Object.values(record).some(value => 
      value.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button size="sm" className="flex-shrink-0">
            <PlusCircle className="h-4 w-4 mr-1" />
            Add New
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        {isLoading ? (
          <SkeletonTable 
            rows={5} 
            columns={columns.length + 1} 
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key}>{column.title}</TableHead>
                ))}
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    {columns.map((column) => (
                      <TableCell key={`${record.id}-${column.key}`}>
                        {column.key === "status" ? (
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${record.status === "active" ? "bg-ems-green-100 text-ems-green-800" : 
                              record.status === "pending" ? "bg-amber-100 text-amber-800" : 
                              "bg-blue-100 text-blue-800"}`}>
                            {record[column.key]}
                          </div>
                        ) : (
                          record[column.key]
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-6 text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
