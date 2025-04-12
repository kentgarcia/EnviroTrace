import { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface SaplingRequest {
  id: string;
  request_date: string;
  requester_name: string;
  requester_address: string;
  sapling_name: string;
  quantity: number;
  status: "planted" | "pending" | "rejected" | "approved" | "in_progress";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const requestFormSchema = z.object({
  request_date: z.string().min(1, "Date is required"),
  requester_name: z.string().min(2, "Requester name is required"),
  requester_address: z.string().min(2, "Address is required"),
  sapling_name: z.string().min(2, "Sapling name is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  status: z.enum(["planted", "pending", "rejected", "approved", "in_progress"]),
  notes: z.string().optional(),
});

export default function SaplingRequestsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SaplingRequest | null>(null);

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['saplingRequests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sapling_requests')
        .select('id, request_date, requester_name, requester_address, sapling_name, quantity, status, notes, created_at, updated_at')
        .order('request_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });

  const filteredRequests = requests?.filter(request => 
    request.requester_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
    request.sapling_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
    request.requester_address.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const addForm = useForm<z.infer<typeof requestFormSchema>>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      request_date: new Date().toISOString().split('T')[0],
      requester_name: "",
      requester_address: "",
      sapling_name: "",
      quantity: 1,
      status: "pending",
      notes: "",
    },
  });

  const editForm = useForm<z.infer<typeof requestFormSchema>>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      request_date: "",
      requester_name: "",
      requester_address: "",
      sapling_name: "",
      quantity: 1,
      status: "pending",
      notes: "",
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: z.infer<typeof requestFormSchema>) => {
      const { error } = await supabase
        .from('sapling_requests')
        .insert({
          request_date: data.request_date,
          requester_name: data.requester_name,
          requester_address: data.requester_address,
          sapling_name: data.sapling_name,
          quantity: data.quantity,
          status: data.status,
          notes: data.notes
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saplingRequests'] });
      toast({
        title: "Success",
        description: "Sapling request added successfully",
      });
      setAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add sapling request: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async (data: z.infer<typeof requestFormSchema> & { id: string }) => {
      const { id, ...updateData } = data;
      const { error } = await supabase
        .from('sapling_requests')
        .update({
          request_date: updateData.request_date,
          requester_name: updateData.requester_name,
          requester_address: updateData.requester_address,
          sapling_name: updateData.sapling_name,
          quantity: updateData.quantity,
          status: updateData.status,
          notes: updateData.notes
        })
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saplingRequests'] });
      toast({
        title: "Success",
        description: "Sapling request updated successfully",
      });
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update sapling request: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sapling_requests')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saplingRequests'] });
      toast({
        title: "Success",
        description: "Sapling request deleted successfully",
      });
      setDeleteDialogOpen(false);
      setSelectedRequest(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete sapling request: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (request: SaplingRequest) => {
    setSelectedRequest(request);
    editForm.reset({
      request_date: request.request_date,
      requester_name: request.requester_name,
      requester_address: request.requester_address,
      sapling_name: request.sapling_name,
      quantity: request.quantity,
      status: request.status,
      notes: request.notes || "",
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (request: SaplingRequest) => {
    setSelectedRequest(request);
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'planted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="tree-management" />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <header className="mb-8">
              <h1 className="text-3xl font-semibold">Sapling/Seed Requests</h1>
              <p className="text-muted-foreground">Manage sapling and seed requests from individuals and organizations</p>
            </header>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sapling Requests</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search requests..."
                      className="w-[200px] pl-8 md:w-[300px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => setAddDialogOpen(true)}>
                    <Plus className="mr-1 h-4 w-4" /> Add Request
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <SkeletonTable rows={5} columns={6} />
                ) : error ? (
                  <div className="text-center p-4 text-red-500">
                    Error loading sapling requests: {(error as Error).message}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Requester</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Sapling Type</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests && filteredRequests.length > 0 ? (
                          filteredRequests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell>{formatDate(request.request_date)}</TableCell>
                              <TableCell>{request.requester_name}</TableCell>
                              <TableCell>{request.requester_address}</TableCell>
                              <TableCell>{request.sapling_name}</TableCell>
                              <TableCell>{request.quantity}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadgeColor(request.status)}`}>
                                  {request.status.replace('_', ' ')}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(request)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(request)}
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
                              No sapling requests found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Sapling Request</DialogTitle>
            <DialogDescription>
              Enter the details of the sapling or seed request.
            </DialogDescription>
          </DialogHeader>

          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit((data) => addMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="request_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="requester_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requester Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="sapling_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sapling Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <select
                          className="w-full p-2 border rounded-md"
                          {...field}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="in_progress">In Progress</option>
                          <option value="planted">Planted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={addForm.control}
                name="requester_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={addMutation.isPending}>
                  {addMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Sapling Request</DialogTitle>
            <DialogDescription>
              Update the details of the sapling or seed request.
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => {
              if (selectedRequest) {
                editMutation.mutate({ ...data, id: selectedRequest.id });
              }
            })} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="request_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="requester_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requester Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="sapling_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sapling Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <select
                          className="w-full p-2 border rounded-md"
                          {...field}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="in_progress">In Progress</option>
                          <option value="planted">Planted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="requester_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={editMutation.isPending}>
                  {editMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the sapling request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedRequest && deleteMutation.mutate(selectedRequest.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
