// import { useEffect, useState } from "react";
// import { AppSidebar } from "@/components/layout/AppSidebar";
// import { SidebarProvider } from "@/components/ui/sidebar";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Calendar, Eye, Edit, Plus } from "lucide-react";
// import { Calendar as CalendarUI } from "@/components/ui/calendar";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "@/lib/auth";
// import { format } from "date-fns";
// import { toast } from "sonner";
// import { YearSelector } from "@/components/dashboards/government-emission/YearSelector";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { cn } from "@/lib/utils";
// import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
// import Tesseract from "tesseract.js";
// import { 
//   fetchTestSchedules, 
//   createTestSchedule, 
//   fetchEmissionTests,
//   createEmissionTest, 
//   fetchVehicleSummaries
// } from "@/lib/emission-api";
// import { useQuery } from "@apollo/client";

// interface TestSchedule {
//   id: string;
//   year: number;
//   quarter: number;
//   assignedPersonnel: string;
//   location: string;
//   conductedOn: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

// interface VehicleTest {
//   id: string;
//   vehicleId: string;
//   testDate: string;
//   quarter: number;
//   year: number;
//   result: boolean;
//   vehicle?: {
//     id: string;
//     plateNumber: string;
//     driverName: string;
//     officeName: string;
//     vehicleType: string;
//     engineType: string;
//   };
// }

// export default function QuarterlyTestingPage() {
//   const navigate = useNavigate();
//   const { user, loading } = useAuth();
//   const currentYear = new Date().getFullYear();
//   const [availableYears, setAvailableYears] = useState<number[]>(
//     Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
//   );
//   const [selectedYear, setSelectedYear] = useState<number>(currentYear);
//   const [openAddDialog, setOpenAddDialog] = useState(false);
//   const [activeTab, setActiveTab] = useState("schedule");
//   const [isLoading, setIsLoading] = useState(true);
//   const [schedules, setSchedules] = useState<TestSchedule[]>([]);
//   const [selectedSchedule, setSelectedSchedule] = useState<TestSchedule | null>(null);
//   const [vehicleTests, setVehicleTests] = useState<VehicleTest[]>([]);
//   const [isLoadingTests, setIsLoadingTests] = useState(false);
//   const [imageSrc, setImageSrc] = useState<string | null>(null);
//   const [croppedAreaPixels, setCroppedAreaPixels] = useState<null | { x: number; y: number; width: number; height: number }>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [testDialogOpen, setTestDialogOpen] = useState(false);
//   const [newTest, setNewTest] = useState({
//     vehicleId: "",
//     testDate: "",
//     result: true,
//   });
//   const [vehicleDetails, setVehicleDetails] = useState<null | { 
//     id: string; 
//     plateNumber: string; 
//     vehicleType: string; 
//     engineType: string 
//   }>(null);
//   const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

//   // Form state for new schedule
//   const [newSchedule, setNewSchedule] = useState({
//     year: currentYear,
//     quarter: 1,
//     assignedPersonnel: "",
//     location: "",
//     conductedOn: new Date(),
//   });

//   useEffect(() => {
//     if (!loading && !user) {
//       navigate("/");
//     }
//   }, [user, loading, navigate]);

//   useEffect(() => {
//     fetchSchedules();
//   }, [selectedYear]);

//   const fetchSchedules = async () => {
//     setIsLoading(true);
//     try {
//       const scheduleData = await fetchTestSchedules(selectedYear);
//       setSchedules(scheduleData);
//     } catch (error) {
//       console.error("Error fetching test schedules:", error);
//       toast.error("Failed to load quarterly test schedules");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleYearChange = (year: string) => {
//     setSelectedYear(parseInt(year));
//   };

//   const handleViewTests = async (schedule: TestSchedule) => {
//     setSelectedSchedule(schedule);
//     setActiveTab("tests");
//     setIsLoadingTests(true);
    
//     try {
//       // Fetch tests related to this schedule (matching year & quarter)
//       const testsData = await fetchEmissionTests({
//         year: schedule.year,
//         quarter: schedule.quarter
//       });
      
//       // Tests already come in the correct format with vehicle info
//       setVehicleTests(testsData);
//     } catch (error) {
//       console.error("Error fetching vehicle tests:", error);
//       toast.error("Failed to load vehicle test data");
//     } finally {
//       setIsLoadingTests(false);
//     }
//   };

//   const handleEditSchedule = (schedule: TestSchedule) => {
//     setNewSchedule({
//       year: schedule.year,
//       quarter: schedule.quarter,
//       assignedPersonnel: schedule.assigned_personnel,
//       location: schedule.location,
//       conductedOn: new Date(schedule.conducted_on),
//     });
//     setOpenAddDialog(true);
//   };

//   const handleAddSchedule = async () => {
//     try {
//       const { error } = await supabase
//         .from('emission_test_schedules')
//         .insert({
//           year: newSchedule.year,
//           quarter: newSchedule.quarter,
//           assigned_personnel: newSchedule.assignedPersonnel,
//           location: newSchedule.location,
//           conducted_on: format(newSchedule.conductedOn, 'yyyy-MM-dd'),
//         });

//       if (error) throw error;
      
//       toast.success("Quarterly test schedule added successfully");
//       setOpenAddDialog(false);
//       fetchSchedules();
      
//       // Reset form
//       setNewSchedule({
//         year: currentYear,
//         quarter: 1,
//         assignedPersonnel: "",
//         location: "",
//         conductedOn: new Date(),
//       });
//     } catch (error) {
//       console.error("Error adding schedule:", error);
//       toast.error("Failed to add quarterly test schedule");
//     }
//   };

// const handleAddVehicleTest = async (vehicle_id: string) => {
//   if (!selectedSchedule || !vehicle_id || !newTest.testDate) {
//     toast.error("Please fill in all fields");
//     return;
//   }

//   try {
//     // Check if the vehicle exists in the database
//     const { data: vehicleData, error: vehicleError } = await supabase
//       .from("vehicles")
//       .select("id, plate_number, vehicle_type, engine_type")
//       .eq("plate_number", vehicle_id)
//       .single();

//     if (vehicleError && vehicleError.code !== "PGRST116") {
//       // Handle unexpected errors
//       throw vehicleError;
//     }

//     if (!vehicleData) {
//       // Vehicle does not exist, prompt to register
//       setConfirmDialogOpen(true);
//       return;
//     }

//     // Show vehicle details in a modal for confirmation
//     setVehicleDetails(vehicleData);
//     setConfirmDialogOpen(true);
//   } catch (error) {
//     console.error("Error fetching vehicle details:", error);
//     toast.error("Failed to fetch vehicle details");
//   }
// };

// const confirmAddVehicleTest = async () => {
//   if (!vehicleDetails || !selectedSchedule) return;

//   // Validate test date
//   if (!newTest.testDate || isNaN(new Date(newTest.testDate).getTime())) {
//     toast.error("Invalid test date. Please select a valid date.");
//     return;
//   }

//   try {
//     // Proceed to add the vehicle test
//     const { error } = await supabase
//       .from("emission_tests")
//       .insert({
//         year: selectedSchedule.year,
//         quarter: selectedSchedule.quarter,
//         vehicle_id: vehicleDetails.id,
//         test_date: newTest.test_date,
//         result: newTest.result,
//       });

//     if (error) throw error;

//     toast.success("Vehicle test added successfully");
//     setTestDialogOpen(false);
//     setConfirmDialogOpen(false);
//     setNewTest({ vehicleId: "", testDate: "", result: true });
//     handleViewTests(selectedSchedule); // Refresh the tests
//   } catch (error) {
//     console.error("Error adding vehicle test:", error);
//     toast.error("Failed to add vehicle test");
//   }
// };

//   const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = async () => {
//         const imageSrc = reader.result as string;
//         setImageSrc(imageSrc); // Optional: Store the image source if needed
//         await extractPlateNumber(imageSrc); // Directly extract the plate number
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const extractPlateNumber = async (imageSrc: string) => {
//     setIsProcessing(true);
  
//     try {
//       // Use Tesseract.js to extract text from the image
//       const { data } = await Tesseract.recognize(imageSrc, "eng");
//       const detectedPlateNumber = data.text.trim();
  
//       setNewTest({ ...newTest, vehicleId: detectedPlateNumber });
//       toast.success("Plate number detected successfully!");
//     } catch (error) {
//       console.error("Error extracting plate number:", error);
//       toast.error("Failed to detect plate number. Please try again.");
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <SidebarProvider>
//       <div className="flex min-h-screen w-full">
//       <AppSidebar dashboardType="government-emission" />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <DashboardNavbar dashboardTitle="Quarterly Emissions Testing" />
//         <div className="flex-1 overflow-y-auto p-6">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h1 className="text-2xl font-bold">Quarterly Emissions Testing</h1>
//               <p className="text-muted-foreground">Schedule and manage quarterly emission tests</p>
//             </div>
//           </div>

//           <div className="mb-6">
//             <YearSelector
//               selectedYear={selectedYear}
//               availableYears={availableYears}
//               onYearChange={handleYearChange}
//               showQuarters={false}
//             />
//           </div>

//           <Tabs value={activeTab} onValueChange={setActiveTab}>
//             <TabsList className="mb-6">
//               <TabsTrigger value="schedule">Test Schedules</TabsTrigger>
//               <TabsTrigger value="tests" disabled={!selectedSchedule}>Vehicle Tests</TabsTrigger>
//             </TabsList>
            
//             <TabsContent value="schedule">
//             <Card>
//             <CardHeader className="pb-2">
//   <CardTitle>
//     {selectedYear} Test Schedules
//   </CardTitle>
//   <Button 
//     size="sm" 
//     className="ml-auto"
//     onClick={() => setOpenAddDialog(true)}
//   >
//     <Plus className="mr-2 h-4 w-4" />
//     Add Test Schedule
//   </Button>
// </CardHeader>
//   <CardContent>
//     {isLoading ? (
//       <div className="flex justify-center py-8">
//         <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
//       </div>
//     ) : schedules.length === 0 ? (
//       <div className="text-center py-8 text-muted-foreground">
//         No test schedules found for {selectedYear}.
//       </div>
//     ) : (
//       <div className="rounded-md border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Quarter</TableHead>
//               <TableHead>Location</TableHead>
//               <TableHead>Assigned Personnel</TableHead>
//               <TableHead>Conducted On</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {schedules.map((schedule) => (
//               <TableRow key={schedule.id}>
//                 <TableCell>Q{schedule.quarter}</TableCell>
//                 <TableCell>{schedule.location}</TableCell>
//                 <TableCell>{schedule.assigned_personnel}</TableCell>
//                 <TableCell>
//                   {format(new Date(schedule.conducted_on), 'MMMM d, yyyy')}
//                 </TableCell>
//                 <TableCell className="text-right">
//                   <div className="flex justify-end gap-2">
//                     <Button 
//                       variant="outline" 
//                       size="sm"
//                       onClick={() => handleViewTests(schedule)}
//                     >
//                       <Eye className="h-4 w-4 mr-1" />
//                       View Tests
//                     </Button>
//                     <Button 
//                       variant="ghost" 
//                       size="sm"
//                       onClick={() => handleEditSchedule(schedule)}
//                     >
//                       <Edit className="h-4 w-4 mr-1" />
//                       Edit
//                     </Button>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     )}
//   </CardContent>
// </Card>
//             </TabsContent>
            
//             <TabsContent value="tests">
//   <Card>
//     <CardHeader className="pb-2">
//       <CardTitle>
//         {selectedSchedule
//           ? `Q${selectedSchedule.quarter} ${selectedSchedule.year} - Vehicle Tests at ${selectedSchedule.location}`
//           : "Vehicle Tests"}
//       </CardTitle>
//       {selectedSchedule && (
//         <Button
//           size="sm"
//           className="ml-auto"
//           onClick={() => {
//             setTestDialogOpen(true);
//           }}
//         >
//           <Plus className="mr-2 h-4 w-4" />
//           Add Vehicle Test
//         </Button>
//       )}
//     </CardHeader>
//     <CardContent>
//       {isLoadingTests ? (
//         <div className="flex justify-center py-8">
//           <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
//         </div>
//       ) : vehicleTests.length === 0 ? (
//         <div className="text-center py-8 text-muted-foreground">
//           No vehicle tests found for this schedule.
//         </div>
//       ) : (
//         <div className="rounded-md border">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Plate Number</TableHead>
//                 <TableHead>Vehicle Type</TableHead>
//                 <TableHead>Engine Type</TableHead>
//                 <TableHead>Test Date</TableHead>
//                 <TableHead>Result</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {vehicleTests.map((test) => (
//                 <TableRow key={test.id}>
//                   <TableCell>{test.plate_number}</TableCell>
//                   <TableCell>{test.vehicle_type}</TableCell>
//                   <TableCell>{test.engine_type}</TableCell>
//                   <TableCell>
//                     {format(new Date(test.test_date), "MMMM d, yyyy")}
//                   </TableCell>
//                   <TableCell>
//                     {test.result ? (
//                       <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                         Passed
//                       </span>
//                     ) : (
//                       <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
//                         Failed
//                       </span>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       )}
//     </CardContent>
//   </Card>
// </TabsContent>
//           </Tabs>
//         </div>
//       </div>

//       {/* Add Schedule Dialog */}
//       <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Add Quarterly Test Schedule</DialogTitle>
//           </DialogHeader>
          
//           <div className="grid gap-4 py-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="year">Year</Label>
//                 <Input
//                   id="year"
//                   type="number"
//                   value={newSchedule.year}
//                   onChange={(e) => setNewSchedule({ ...newSchedule, year: parseInt(e.target.value) })}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="quarter">Quarter</Label>
//                 <Input
//                   id="quarter"
//                   type="number"
//                   min="1"
//                   max="4"
//                   value={newSchedule.quarter}
//                   onChange={(e) => setNewSchedule({ ...newSchedule, quarter: parseInt(e.target.value) })}
//                 />
//               </div>
//             </div>

//             <div>
//               <Label htmlFor="personnel">Assigned Personnel</Label>
//               <Input
//                 id="personnel"
//                 value={newSchedule.assignedPersonnel}
//                 onChange={(e) => setNewSchedule({ ...newSchedule, assignedPersonnel: e.target.value })}
//                 placeholder="Enter name of assigned personnel"
//               />
//             </div>

//             <div>
//               <Label htmlFor="location">Test Location</Label>
//               <Input
//                 id="location"
//                 value={newSchedule.location}
//                 onChange={(e) => setNewSchedule({ ...newSchedule, location: e.target.value })}
//                 placeholder="Enter test location"
//               />
//             </div>

//             <div>
//               <Label>Conducted On</Label>
//               <Popover>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant={"outline"}
//                     className={cn(
//                       "w-full justify-start text-left font-normal",
//                       !newSchedule.conductedOn && "text-muted-foreground"
//                     )}
//                   >
//                     <Calendar className="mr-2 h-4 w-4" />
//                     {format(newSchedule.conductedOn, "PPP")}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0">
//                   <CalendarUI
//                     mode="single"
//                     selected={newSchedule.conductedOn}
//                     onSelect={(date) => date && setNewSchedule({ ...newSchedule, conductedOn: date })}
//                     initialFocus
//                   />
//                 </PopoverContent>
//               </Popover>
//             </div>
//           </div>
          
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setOpenAddDialog(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleAddSchedule}>Save Schedule</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Add Vehicle Test Dialog */}
//       <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
//   <DialogContent>
//     <DialogHeader>
//       <DialogTitle>Add Vehicle Test</DialogTitle>
//     </DialogHeader>
//     <div className="grid gap-4 py-4">
//       <div>
//         <Label htmlFor="vehicle">Vehicle</Label>
//         <Input
//           id="vehicle"
//           placeholder="Enter vehicle ID or plate number"
//           value={newTest.vehicleId}
//           onChange={(e) => setNewTest({ ...newTest, vehicleId: e.target.value })}
//         />
//       </div>
//       <div className="mt-4">
//         <Label>Upload Image</Label>
//         <Input
//           type="file"
//           accept="image/*"
//           onChange={handleImageUpload}
//         />
//       </div>
//       {isProcessing && (
//         <div className="mt-4 text-center">
//           <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
//           <p className="mt-2">Processing image...</p>
//         </div>
//       )}
//       <div>
//         <Label htmlFor="testDate">Test Date</Label>
//         <Popover>
//           <PopoverTrigger asChild>
//             <Button
//               variant="outline"
//               className={cn(
//                 "w-full justify-start text-left font-normal",
//                 !newTest.testDate && "text-muted-foreground"
//               )}
//             >
//               <Calendar className="mr-2 h-4 w-4" />
//               {newTest.testDate ? format(new Date(newTest.testDate), "PPP") : "Select a date"}
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-auto p-0">
//             <CalendarUI
//               mode="single"
//               selected={newTest.testDate ? new Date(newTest.testDate) : undefined}
//               onSelect={(date) => date && setNewTest({ ...newTest, testDate: date.toISOString() })}
//               initialFocus
//             />
//           </PopoverContent>
//         </Popover>
//       </div>
//       <div>
//         <Label htmlFor="result">Result</Label>
//         <select
//           id="result"
//           className="w-full border rounded-md p-2"
//           value={newTest.result ? "pass" : "fail"}
//           onChange={(e) => setNewTest({ ...newTest, result: e.target.value === "pass" })}
//         >
//           <option value="pass">Pass</option>
//           <option value="fail">Fail</option>
//         </select>
//       </div>
//     </div>
//     <DialogFooter>
//       <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
//         Cancel
//       </Button>
//       <Button onClick={() => handleAddVehicleTest(newTest.vehicleId)}>Save Test</Button>
//     </DialogFooter>
//   </DialogContent>
// </Dialog>

// <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
//   <DialogContent>
//     <DialogHeader>
//       <DialogTitle>Confirm Add Vehicle Test</DialogTitle>
//     </DialogHeader>
//     {vehicleDetails ? (
//       <div className="grid gap-4 py-4">
//         <div>
//           <Label>Plate Number</Label>
//           <p>{vehicleDetails.plate_number}</p>
//         </div>
//         <div>
//           <Label>Vehicle Type</Label>
//           <p>{vehicleDetails.vehicle_type}</p>
//         </div>
//         <div>
//           <Label>Engine Type</Label>
//           <p>{vehicleDetails.engine_type}</p>
//         </div>
//         <div>
//           <Label>Test Date</Label>
//           <p>
//             {newTest.testDate
//               ? format(new Date(newTest.testDate), "PPP")
//               : "Invalid or missing test date"}
//           </p>
//         </div>
//         <div>
//           <Label>Result</Label>
//           <p>{newTest.result ? "Pass" : "Fail"}</p>
//         </div>
//       </div>
//     ) : (
//       <p>The vehicle does not exist. Would you like to register it?</p>
//     )}
//     <DialogFooter>
//       <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
//         Cancel
//       </Button>
//       {vehicleDetails ? (
//         <Button onClick={confirmAddVehicleTest}>Confirm</Button>
//       ) : (
//         <Button onClick={() => navigate("/vehicles")}>Register Vehicle</Button>
//       )}
//     </DialogFooter>
//   </DialogContent>
// </Dialog>
//     </div>
//     </SidebarProvider>
//   );
// }
