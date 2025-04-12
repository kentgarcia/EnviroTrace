
import { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Building2,
  XCircle,
  CheckCircle,
  AlertCircle,
  Plus,
  ClipboardList,
  Calendar,
} from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { OfficeComplianceTable } from "@/components/dashboards/government-emission/OfficeComplianceTable";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

// Interfaces
interface Office {
  id: string;
  name: string;
  address: string;
  contact_number: string;
  contact_person: string;
  total_vehicles: number;
  compliant_vehicles: number;
  compliance_percentage: number;
  created_at: string;
  updated_at: string;
}

// Form schema
const officeFormSchema = z.object({
  name: z.string().min(2, {
    message: "Office name must be at least 2 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  contact_number: z.string().min(7, {
    message: "Contact number must be at least 7 characters.",
  }),
  contact_person: z.string().min(2, {
    message: "Contact person name must be at least 2 characters.",
  }),
  notes: z.string().optional(),
});

export default function OfficesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>("name");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isAddOfficeOpen, setIsAddOfficeOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch offices data
  const { data: offices, isLoading, error } = useQuery({
    queryKey: ['offices'],
    queryFn: async () => {
      try {
        // This is a mock API call - in a real application, you would fetch from your API or Supabase
        const mockOffices: Office[] = [
          {
            id: "1",
            name: "City Hall",
            address: "123 Main St",
            contact_number: "+63 2 8555 1234",
            contact_person: "John Doe",
            total_vehicles: 45,
            compliant_vehicles: 42,
            compliance_percentage: 93.3,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-04-01T00:00:00Z"
          },
          {
            id: "2",
            name: "Public Works Department",
            address: "456 Engineering Ave",
            contact_number: "+63 2 8555 5678",
            contact_person: "Jane Smith",
            total_vehicles: 78,
            compliant_vehicles: 65,
            compliance_percentage: 83.3,
            created_at: "2024-01-05T00:00:00Z",
            updated_at: "2024-04-02T00:00:00Z"
          },
          {
            id: "3", 
            name: "Parks and Recreation",
            address: "789 Green Park Blvd",
            contact_number: "+63 2 8555 9012",
            contact_person: "Robert Johnson",
            total_vehicles: 32,
            compliant_vehicles: 32,
            compliance_percentage: 100,
            created_at: "2024-01-10T00:00:00Z",
            updated_at: "2024-03-28T00:00:00Z"
          },
          {
            id: "4",
            name: "Department of Education",
            address: "101 Learning Way",
            contact_number: "+63 2 8555 3456",
            contact_person: "Maria Garcia",
            total_vehicles: 56,
            compliant_vehicles: 48,
            compliance_percentage: 85.7,
            created_at: "2024-01-15T00:00:00Z",
            updated_at: "2024-04-05T00:00:00Z"
          },
          {
            id: "5",
            name: "Health Department",
            address: "202 Hospital Road",
            contact_number: "+63 2 8555 7890",
            contact_person: "David Kim",
            total_vehicles: 39,
            compliant_vehicles: 35,
            compliance_percentage: 89.7,
            created_at: "2024-01-20T00:00:00Z",
            updated_at: "2024-04-03T00:00:00Z"
          }
        ];
        
        return mockOffices;
      } catch (error) {
        console.error("Error fetching offices:", error);
        throw error;
      }
    },
  });

  // Add office form
  const form = useForm<z.infer<typeof officeFormSchema>>({
    resolver: zodResolver(officeFormSchema),
    defaultValues: {
      name: "",
      address: "",
      contact_number: "",
      contact_person: "",
      notes: "",
    },
  });

  // Handle sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter and sort offices
  const filteredAndSortedOffices = offices
    ? offices
        .filter(office => 
          office.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          office.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          office.contact_person.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          if (!sortColumn) return 0;
          
          const direction = sortDirection === 'asc' ? 1 : -1;
          
          if (sortColumn === 'compliance_percentage') {
            return (a.compliance_percentage - b.compliance_percentage) * direction;
          } else if (sortColumn === 'total_vehicles') {
            return (a.total_vehicles - b.total_vehicles) * direction;
          } else {
            // Default string comparison for other columns
            return a[sortColumn as keyof Office].toString().localeCompare(
              b[sortColumn as keyof Office].toString()
            ) * direction;
          }
        })
    : [];

  // View office details
  const handleViewDetails = (office: Office) => {
    setSelectedOffice(office);
    setIsViewDetailsOpen(true);
  };

  // Get compliance status color
  const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-100 text-green-800";
    if (percentage >= 75) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Add office mutation
  const addOfficeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof officeFormSchema>) => {
      // In a real app, this would be a call to your API or Supabase
      // For now, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newOffice: Office = {
        id: Math.random().toString(36).substring(7),
        ...data,
        total_vehicles: 0,
        compliant_vehicles: 0,
        compliance_percentage: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      return newOffice;
    },
    onSuccess: (newOffice) => {
      // In a real app, you would invalidate queries to refresh data
      queryClient.setQueryData(['offices'], (old: Office[] = []) => [...old, newOffice]);
      
      toast({
        title: "Office Added",
        description: `${newOffice.name} has been successfully added.`,
      });
      
      setIsAddOfficeOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add office: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Submit handler
  const onSubmit = (data: z.infer<typeof officeFormSchema>) => {
    addOfficeMutation.mutate(data);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar dashboardType="government-emission" />
        <div className="flex-1 p-6 bg-gray-50 overflow-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Government Offices</h1>
            <p className="text-muted-foreground">
              Monitor emission compliance across government offices and departments
            </p>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                className="pl-9 w-[300px]" 
                placeholder="Search offices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsAddOfficeOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Office
            </Button>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Offices</TabsTrigger>
              <TabsTrigger value="compliant">Compliant</TabsTrigger>
              <TabsTrigger value="non-compliant">Non-Compliant</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>Government Offices & Departments</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <SkeletonTable rows={5} columns={7} />
                  ) : error ? (
                    <div className="text-center text-red-500 py-4">
                      Error loading offices: {(error as Error).message}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead 
                              className="cursor-pointer"
                              onClick={() => handleSort('name')}
                            >
                              Office Name
                              {sortColumn === 'name' && (
                                sortDirection === 'asc' ? 
                                <ChevronUp className="inline ml-1 h-4 w-4" /> : 
                                <ChevronDown className="inline ml-1 h-4 w-4" />
                              )}
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer hidden md:table-cell"
                              onClick={() => handleSort('address')}
                            >
                              Address
                              {sortColumn === 'address' && (
                                sortDirection === 'asc' ? 
                                <ChevronUp className="inline ml-1 h-4 w-4" /> : 
                                <ChevronDown className="inline ml-1 h-4 w-4" />
                              )}
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer hidden lg:table-cell"
                              onClick={() => handleSort('contact_person')}
                            >
                              Contact Person
                              {sortColumn === 'contact_person' && (
                                sortDirection === 'asc' ? 
                                <ChevronUp className="inline ml-1 h-4 w-4" /> : 
                                <ChevronDown className="inline ml-1 h-4 w-4" />
                              )}
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer text-center"
                              onClick={() => handleSort('total_vehicles')}
                            >
                              Vehicles
                              {sortColumn === 'total_vehicles' && (
                                sortDirection === 'asc' ? 
                                <ChevronUp className="inline ml-1 h-4 w-4" /> : 
                                <ChevronDown className="inline ml-1 h-4 w-4" />
                              )}
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer text-center"
                              onClick={() => handleSort('compliance_percentage')}
                            >
                              Compliance
                              {sortColumn === 'compliance_percentage' && (
                                sortDirection === 'asc' ? 
                                <ChevronUp className="inline ml-1 h-4 w-4" /> : 
                                <ChevronDown className="inline ml-1 h-4 w-4" />
                              )}
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAndSortedOffices.length > 0 ? (
                            filteredAndSortedOffices.map(office => (
                              <TableRow key={office.id}>
                                <TableCell className="font-medium">{office.name}</TableCell>
                                <TableCell className="hidden md:table-cell">{office.address}</TableCell>
                                <TableCell className="hidden lg:table-cell">{office.contact_person}</TableCell>
                                <TableCell className="text-center">
                                  {office.compliant_vehicles} / {office.total_vehicles}
                                </TableCell>
                                <TableCell>
                                  <div className="flex justify-center">
                                    <Badge className={getComplianceColor(office.compliance_percentage)}>
                                      {office.compliance_percentage}%
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleViewDetails(office)}
                                  >
                                    View Details
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8">
                                No offices found matching your search.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="compliant">
              <OfficeComplianceTable 
                title="Compliant Offices" 
                offices={offices?.filter(o => o.compliance_percentage >= 85) || []}
                loading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="non-compliant">
              <OfficeComplianceTable 
                title="Non-Compliant Offices" 
                offices={offices?.filter(o => o.compliance_percentage < 85) || []}
                loading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Office Dialog */}
      <Dialog open={isAddOfficeOpen} onOpenChange={setIsAddOfficeOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Office</DialogTitle>
            <DialogDescription>
              Enter the details for the new government office or department.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Office Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Department of Public Works" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter office address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input placeholder="Name of contact person" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contact_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. +63 2 8555 1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional information"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={addOfficeMutation.isPending}
                >
                  {addOfficeMutation.isPending ? "Saving..." : "Save Office"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Office Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Office Details</DialogTitle>
          </DialogHeader>
          
          {selectedOffice && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Building2 className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="text-xl font-semibold">{selectedOffice.name}</h3>
                  <p className="text-muted-foreground">{selectedOffice.address}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="font-medium">{selectedOffice.contact_person}</p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Contact Number</p>
                  <p className="font-medium">{selectedOffice.contact_number}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Total Vehicles</p>
                  <p className="font-medium text-xl">{selectedOffice.total_vehicles}</p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Compliant</p>
                  <p className="font-medium text-xl text-green-600">{selectedOffice.compliant_vehicles}</p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Compliance Rate</p>
                  <div className="flex items-center">
                    <p className="font-medium text-xl">{selectedOffice.compliance_percentage}%</p>
                    {selectedOffice.compliance_percentage >= 90 ? (
                      <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                    ) : selectedOffice.compliance_percentage >= 75 ? (
                      <AlertCircle className="ml-2 h-5 w-5 text-yellow-500" />
                    ) : (
                      <XCircle className="ml-2 h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <ClipboardList className="h-5 w-5 mr-2 text-primary" />
                  <h4 className="font-medium">Recent Activity</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <p>Last emission test conducted</p>
                    <p className="text-muted-foreground">March 28, 2024</p>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <p>New vehicles registered</p>
                    <p className="text-muted-foreground">February 15, 2024</p>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <p>Compliance report submitted</p>
                    <p className="text-muted-foreground">January 10, 2024</p>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  <h4 className="font-medium">Upcoming Tests</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <p>Q2 Emission Testing</p>
                    <p className="text-muted-foreground">June 15, 2024</p>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <p>Annual Compliance Review</p>
                    <p className="text-muted-foreground">December 5, 2024</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsViewDetailsOpen(false)}
            >
              Close
            </Button>
            <Button>Manage Vehicles</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
