import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { OfficeComplianceTableWrapper } from "@/components/dashboards/government-emission/OfficeComplianceTableWrapper";

interface Office {
  id: string;
  name: string;
  department: string;
  address: string;
  contact_person: string;
  contact_email: string;
  compliance_status: "compliant" | "non_compliant" | "pending";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface AddOfficeFormValues {
  name: string;
  department: string;
  address: string;
  contact_person: string;
  contact_email: string;
  compliance_status: "compliant" | "non_compliant" | "pending";
  notes: string | null;
}

export default function OfficesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [addOfficeDialogOpen, setAddOfficeDialogOpen] = useState(false);
  const [editOfficeDialogOpen, setEditOfficeDialogOpen] = useState(false);
  const [deleteOfficeDialogOpen, setDeleteOfficeDialogOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);

  const { data: offices, isLoading, error } = useQuery({
    queryKey: ['offices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offices')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });

  const filteredOffices = offices?.filter(office => 
    office.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    office.department.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    office.address.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const [addOfficeFormValues, setAddOfficeFormValues] = useState<AddOfficeFormValues>({
    name: "",
    department: "",
    address: "",
    contact_person: "",
    contact_email: "",
    compliance_status: "pending",
    notes: "",
  });

  const [editOfficeFormValues, setEditOfficeFormValues] = useState<AddOfficeFormValues>({
    name: "",
    department: "",
    address: "",
    contact_person: "",
    contact_email: "",
    compliance_status: "pending",
    notes: "",
  });

  const addOfficeMutation = useMutation({
    mutationFn: async (newOffice: AddOfficeFormValues) => {
      const { error } = await supabase
        .from('offices')
        .insert([newOffice]);
      
      if (error) throw error;
      return newOffice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offices'] });
      toast({
        title: "Success",
        description: "Office added successfully",
      });
      setAddOfficeDialogOpen(false);
      setAddOfficeFormValues({
        name: "",
        department: "",
        address: "",
        contact_person: "",
        contact_email: "",
        compliance_status: "pending",
        notes: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add office: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const editOfficeMutation = useMutation({
    mutationFn: async (updatedOffice: AddOfficeFormValues & { id: string }) => {
      const { id, ...officeData } = updatedOffice;
      const { error } = await supabase
        .from('offices')
        .update(officeData)
        .eq('id', id);
      
      if (error) throw error;
      return updatedOffice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offices'] });
      toast({
        title: "Success",
        description: "Office updated successfully",
      });
      setEditOfficeDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update office: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteOfficeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('offices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offices'] });
      toast({
        title: "Success",
        description: "Office deleted successfully",
      });
      setDeleteOfficeDialogOpen(false);
      setSelectedOffice(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete office: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleEditOffice = (office: Office) => {
    setSelectedOffice(office);
    setEditOfficeFormValues({
      name: office.name,
      department: office.department,
      address: office.address,
      contact_person: office.contact_person,
      contact_email: office.contact_email,
      compliance_status: office.compliance_status,
      notes: office.notes || "",
    });
    setEditOfficeDialogOpen(true);
  };

  const handleDeleteOffice = (office: Office) => {
    setSelectedOffice(office);
    setDeleteOfficeDialogOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="government-emission" />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <header className="mb-8">
              <h1 className="text-3xl font-semibold">Offices & Departments</h1>
              <p className="text-muted-foreground">Manage offices and departments within the organization</p>
            </header>
            
            <main className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card className="xl:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Office & Department Compliance</CardTitle>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search offices..."
                        className="w-[200px] pl-8 md:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button onClick={() => setAddOfficeDialogOpen(true)}>
                      <Plus className="mr-1 h-4 w-4" /> Add Office
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <SkeletonTable rows={5} columns={7} />
                  ) : error ? (
                    <div className="rounded-md bg-red-50 p-4 my-4">
                      <div className="flex">
                        <div className="text-red-700">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Error loading offices</h3>
                          <div className="mt-2 text-sm text-red-700">{(error as Error).message}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Contact Person</TableHead>
                            <TableHead>Contact Email</TableHead>
                            <TableHead>Compliance Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOffices && filteredOffices.length > 0 ? (
                            filteredOffices.map((office) => (
                              <TableRow key={office.id}>
                                <TableCell>{office.name}</TableCell>
                                <TableCell>{office.department}</TableCell>
                                <TableCell>{office.address}</TableCell>
                                <TableCell>{office.contact_person}</TableCell>
                                <TableCell>{office.contact_email}</TableCell>
                                <TableCell>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize 
                                    ${office.compliance_status === "compliant" ? "bg-green-100 text-green-800" : 
                                      office.compliance_status === "non_compliant" ? "bg-red-100 text-red-800" : 
                                      "bg-yellow-100 text-yellow-800"}`}>
                                    {office.compliance_status.replace('_', ' ')}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditOffice(office)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteOffice(office)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center">
                                No offices found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Overview</CardTitle>
                  <CardDescription>Current month compliance summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <OfficeComplianceTableWrapper
                    offices={offices || []}
                    loading={isLoading}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance by Department</CardTitle>
                  <CardDescription>Grouped by department category</CardDescription>
                </CardHeader>
                <CardContent>
                  <OfficeComplianceTableWrapper
                    offices={offices || []}
                    loading={isLoading}
                  />
                </CardContent>
              </Card>
            </main>

            <Dialog open={addOfficeDialogOpen} onOpenChange={setAddOfficeDialogOpen}>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Add New Office</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new office or department.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input 
                      type="text" 
                      id="name" 
                      value={addOfficeFormValues.name}
                      onChange={(e) => setAddOfficeFormValues({ ...addOfficeFormValues, name: e.target.value })}
                      className="col-span-3" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="department" className="text-right">
                      Department
                    </Label>
                    <Input 
                      type="text" 
                      id="department" 
                      value={addOfficeFormValues.department}
                      onChange={(e) => setAddOfficeFormValues({ ...addOfficeFormValues, department: e.target.value })}
                      className="col-span-3" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">
                      Address
                    </Label>
                    <Textarea 
                      id="address" 
                      value={addOfficeFormValues.address}
                      onChange={(e) => setAddOfficeFormValues({ ...addOfficeFormValues, address: e.target.value })}
                      className="col-span-3" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contact_person" className="text-right">
                      Contact Person
                    </Label>
                    <Input 
                      type="text" 
                      id="contact_person" 
                      value={addOfficeFormValues.contact_person}
                      onChange={(e) => setAddOfficeFormValues({ ...addOfficeFormValues, contact_person: e.target.value })}
                      className="col-span-3" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contact_email" className="text-right">
                      Contact Email
                    </Label>
                    <Input 
                      type="email" 
                      id="contact_email" 
                      value={addOfficeFormValues.contact_email}
                      onChange={(e) => setAddOfficeFormValues({ ...addOfficeFormValues, contact_email: e.target.value })}
                      className="col-span-3" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="compliance_status" className="text-right">
                      Compliance Status
                    </Label>
                    <select 
                      id="compliance_status" 
                      value={addOfficeFormValues.compliance_status}
                      onChange={(e) => setAddOfficeFormValues({ ...addOfficeFormValues, compliance_status: e.target.value as "compliant" | "non_compliant" | "pending" })}
                      className="col-span-3 p-2 border rounded-md"
                    >
                      <option value="compliant">Compliant</option>
                      <option value="non_compliant">Non Compliant</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notes
                    </Label>
                    <Textarea 
                      id="notes" 
                      value={addOfficeFormValues.notes}
                      onChange={(e) => setAddOfficeFormValues({ ...addOfficeFormValues, notes: e.target.value })}
                      className="col-span-3" 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" onClick={() => {
                    addOfficeMutation.mutate(addOfficeFormValues);
                  }} disabled={addOfficeMutation.isPending}>
                    {addOfficeMutation.isPending ? "Adding..." : "Add Office"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={editOfficeDialogOpen} onOpenChange={setEditOfficeDialogOpen}>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Edit Office</DialogTitle>
                  <DialogDescription>
                    Edit the details for the selected office or department.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_name" className="text-right">
                      Name
                    </Label>
                    <Input 
                      type="text" 
                      id="edit_name" 
                      value={editOfficeFormValues.name}
                      onChange={(e) => setEditOfficeFormValues({ ...editOfficeFormValues, name: e.target.value })}
                      className="col-span-3" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_department" className="text-right">
                      Department
                    </Label>
                    <Input 
                      type="text" 
                      id="edit_department" 
                      value={editOfficeFormValues.department}
                      onChange={(e) => setEditOfficeFormValues({ ...editOfficeFormValues, department: e.target.value })}
                      className="col-span-3" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_address" className="text-right">
                      Address
                    </Label>
                    <Textarea 
                      id="edit_address" 
                      value={editOfficeFormValues.address}
                      onChange={(e) => setEditOfficeFormValues({ ...editOfficeFormValues, address: e.target.value })}
                      className="col-span-3" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_contact_person" className="text-right">
                      Contact Person
                    </Label>
                    <Input 
                      type="text" 
                      id="edit_contact_person" 
                      value={editOfficeFormValues.contact_person}
                      onChange={(e) => setEditOfficeFormValues({ ...editOfficeFormValues, contact_person: e.target.value })}
                      className="col-span-3" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_contact_email" className="text-right">
                      Contact Email
                    </Label>
                    <Input 
                      type="email" 
                      id="edit_contact_email" 
                      value={editOfficeFormValues.contact_email}
                      onChange={(e) => setEditOfficeFormValues({ ...editOfficeFormValues, contact_email: e.target.value })}
                      className="col-span-3" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_compliance_status" className="text-right">
                      Compliance Status
                    </Label>
                    <select 
                      id="edit_compliance_status" 
                      value={editOfficeFormValues.compliance_status}
                      onChange={(e) => setEditOfficeFormValues({ ...editOfficeFormValues, compliance_status: e.target.value as "compliant" | "non_compliant" | "pending" })}
                      className="col-span-3 p-2 border rounded-md"
                    >
                      <option value="compliant">Compliant</option>
                      <option value="non_compliant">Non Compliant</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_notes" className="text-right">
                      Notes
                    </Label>
                    <Textarea 
                      id="edit_notes" 
                      value={editOfficeFormValues.notes}
                      onChange={(e) => setEditOfficeFormValues({ ...editOfficeFormValues, notes: e.target.value })}
                      className="col-span-3" 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" onClick={() => {
                    if (selectedOffice) {
                      editOfficeMutation.mutate({ ...editOfficeFormValues, id: selectedOffice.id });
                    }
                  }} disabled={editOfficeMutation.isPending}>
                    {editOfficeMutation.isPending ? "Updating..." : "Update Office"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog open={deleteOfficeDialogOpen} onOpenChange={setDeleteOfficeDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the office.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => selectedOffice && deleteOfficeMutation.mutate(selectedOffice.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleteOfficeMutation.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
