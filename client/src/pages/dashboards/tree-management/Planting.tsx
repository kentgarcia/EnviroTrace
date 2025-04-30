
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

// Define interfaces
interface TreePlantingActivity {
  id: string;
  planting_date: string;
  establishment_name: string;
  planted_by: string;
  tree_name: string;
  tree_type: "tree" | "ornamental" | "fruit" | "shade" | "decorative" | "other";
  quantity: number;
  status: "planted" | "pending" | "rejected" | "approved" | "in_progress";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Form validation schema
const plantingFormSchema = z.object({
  planting_date: z.string().min(1, "Date is required"),
  establishment_name: z.string().min(2, "Establishment name is required"),
  planted_by: z.string().min(2, "Planted by is required"),
  tree_name: z.string().min(2, "Tree name is required"),
  tree_type: z.enum(["tree", "ornamental", "fruit", "shade", "decorative", "other"]),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  status: z.enum(["planted", "pending", "rejected", "approved", "in_progress"]),
  notes: z.string().optional(),
});

export default function TreePlantingPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Modal states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<TreePlantingActivity | null>(null);

  // Fetch tree planting activities with optimized query
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['treePlantingActivities'],
    queryFn: async () => {
      // Only select needed fields to minimize payload
      const { data, error } = await supabase
        .from('tree_planting_activities')
        .select('id, planting_date, establishment_name, planted_by, tree_name, tree_type, quantity, status, notes, created_at, updated_at')
        .order('planting_date', { ascending: false });
      
      if (error) throw error;
      return data as TreePlantingActivity[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 60, // 1 hour garbage collection
  });

  // Filter activities based on search term
  const filteredActivities = activities?.filter(activity => 
    activity.establishment_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
    activity.tree_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    activity.planted_by.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  // Add activity form
  const addForm = useForm<z.infer<typeof plantingFormSchema>>({
    resolver: zodResolver(plantingFormSchema),
    defaultValues: {
      planting_date: new Date().toISOString().split('T')[0],
      establishment_name: "",
      planted_by: "",
      tree_name: "",
      tree_type: "tree",
      quantity: 1,
      status: "pending",
      notes: "",
    },
  });

  // Edit activity form
  const editForm = useForm<z.infer<typeof plantingFormSchema>>({
    resolver: zodResolver(plantingFormSchema),
    defaultValues: {
      planting_date: "",
      establishment_name: "",
      planted_by: "",
      tree_name: "",
      tree_type: "tree",
      quantity: 1,
      status: "pending",
      notes: "",
    },
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: async (data: z.infer<typeof plantingFormSchema>) => {
      const { error } = await supabase
        .from('tree_planting_activities')
        .insert({
          planting_date: data.planting_date,
          establishment_name: data.establishment_name,
          planted_by: data.planted_by,
          tree_name: data.tree_name,
          tree_type: data.tree_type,
          quantity: data.quantity,
          status: data.status,
          notes: data.notes
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treePlantingActivities'] });
      toast({
        title: "Success",
        description: "Tree planting activity added successfully",
      });
      setAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add tree planting activity: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async (data: z.infer<typeof plantingFormSchema> & { id: string }) => {
      const { id, ...updateData } = data;
      const { error } = await supabase
        .from('tree_planting_activities')
        .update({
          planting_date: updateData.planting_date,
          establishment_name: updateData.establishment_name,
          planted_by: updateData.planted_by,
          tree_name: updateData.tree_name,
          tree_type: updateData.tree_type,
          quantity: updateData.quantity,
          status: updateData.status,
          notes: updateData.notes
        })
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treePlantingActivities'] });
      toast({
        title: "Success",
        description: "Tree planting activity updated successfully",
      });
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update tree planting activity: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tree_planting_activities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treePlantingActivities'] });
      toast({
        title: "Success",
        description: "Tree planting activity deleted successfully",
      });
      setDeleteDialogOpen(false);
      setSelectedActivity(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete tree planting activity: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle edit
  const handleEdit = (activity: TreePlantingActivity) => {
    setSelectedActivity(activity);
    editForm.reset({
      planting_date: activity.planting_date,
      establishment_name: activity.establishment_name,
      planted_by: activity.planted_by,
      tree_name: activity.tree_name,
      tree_type: activity.tree_type,
      quantity: activity.quantity,
      status: activity.status,
      notes: activity.notes || "",
    });
    setEditDialogOpen(true);
  };

  // Handle delete
  const handleDelete = (activity: TreePlantingActivity) => {
    setSelectedActivity(activity);
    setDeleteDialogOpen(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Get status badge color
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
              <h1 className="text-3xl font-semibold">Tree Planting Activities</h1>
              <p className="text-muted-foreground">Manage tree planting activities and track progress</p>
            </header>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tree Planting Records</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search activities..."
                      className="w-[200px] pl-8 md:w-[300px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => setAddDialogOpen(true)}>
                    <Plus className="mr-1 h-4 w-4" /> Add Activity
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <SkeletonTable rows={5} columns={7} />
                ) : error ? (
                  <div className="text-center p-4 text-red-500">
                    Error loading tree planting activities: {(error as Error).message}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Establishment</TableHead>
                          <TableHead>Planted By</TableHead>
                          <TableHead>Trees</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredActivities && filteredActivities.length > 0 ? (
                          filteredActivities.map((activity) => (
                            <TableRow key={activity.id}>
                              <TableCell>{formatDate(activity.planting_date)}</TableCell>
                              <TableCell>{activity.establishment_name}</TableCell>
                              <TableCell>{activity.planted_by}</TableCell>
                              <TableCell>{activity.tree_name}</TableCell>
                              <TableCell className="capitalize">{activity.tree_type}</TableCell>
                              <TableCell>{activity.quantity}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadgeColor(activity.status)}`}>
                                  {activity.status.replace('_', ' ')}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(activity)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(activity)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center">
                              No tree planting activities found.
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

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Tree Planting Activity</DialogTitle>
            <DialogDescription>
              Enter the details of the tree planting activity.
            </DialogDescription>
          </DialogHeader>

          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit((data) => addMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="planting_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="establishment_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Establishment</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="planted_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Planted By</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="tree_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tree Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="tree_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tree Type</FormLabel>
                      <FormControl>
                        <select
                          className="w-full p-2 border rounded-md"
                          {...field}
                        >
                          <option value="tree">Tree</option>
                          <option value="ornamental">Ornamental</option>
                          <option value="fruit">Fruit</option>
                          <option value="shade">Shade</option>
                          <option value="decorative">Decorative</option>
                          <option value="other">Other</option>
                        </select>
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
                    <FormItem>
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Tree Planting Activity</DialogTitle>
            <DialogDescription>
              Update the details of the tree planting activity.
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => {
              if (selectedActivity) {
                editMutation.mutate({ ...data, id: selectedActivity.id });
              }
            })} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="planting_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="establishment_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Establishment</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="planted_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Planted By</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="tree_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tree Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="tree_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tree Type</FormLabel>
                      <FormControl>
                        <select
                          className="w-full p-2 border rounded-md"
                          {...field}
                        >
                          <option value="tree">Tree</option>
                          <option value="ornamental">Ornamental</option>
                          <option value="fruit">Fruit</option>
                          <option value="shade">Shade</option>
                          <option value="decorative">Decorative</option>
                          <option value="other">Other</option>
                        </select>
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
                    <FormItem>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tree planting activity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedActivity && deleteMutation.mutate(selectedActivity.id)}
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
