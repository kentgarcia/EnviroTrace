// import { useEffect, useState, useCallback } from "react";
// import { AppSidebar } from "@/components/layout/AppSidebar";
// import { SidebarProvider } from "@/components/ui/sidebar";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { FileDown, Plus } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "@/lib/auth";
// import { format } from "date-fns";
// import { toast } from "sonner";
// import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
// import { VehicleTable } from "./vehicles/VehicleTable";
// import { VehicleFilters } from "./vehicles/VehicleFilters";
// import { VehicleModals } from "./vehicles/VehicleModals";
// import { useVehicles } from "./vehicles/useVehicles";
// import { Vehicle, EmissionTest } from "./vehicles/types";

// /**
//  * Vehicles page for the government emission dashboard.
//  * Displays, filters, and manages vehicles and their emission test records.
//  *
//  * @returns React component
//  */
// export default function VehiclesPage() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user, loading } = useAuth();

//   const {
//     vehicles,
//     filteredVehicles,
//     pendingVehicles,
//     isLoading,
//     isOffline,
//     offlineNotice,
//     searchQuery,
//     setSearchQuery,
//     statusFilter,
//     setStatusFilter,
//     vehicleTypeFilter,
//     setVehicleTypeFilter,
//     engineTypeFilter,
//     setEngineTypeFilter,
//     wheelsFilter,
//     setWheelsFilter,
//     vehicleTypes,
//     engineTypes,
//     wheelCounts,
//     setPendingVehicles,
//     set,
//     save
//   } = useVehicles();

//   const [viewModalOpen, setViewModalOpen] = useState(false);
//   const [editModalOpen, setEditModalOpen] = useState(false);
//   const [addModalOpen, setAddModalOpen] = useState(false);
//   const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
//   const [vehicleTestHistory, setVehicleTestHistory] = useState<EmissionTest[]>([]);
//   const [testHistoryLoading, setTestHistoryLoading] = useState(false);
//   const [editFormData, setEditFormData] = useState({
//     plate_number: "",
//     driver_name: "",
//     office_name: "",
//     vehicle_type: "",
//     engine_type: "",
//     wheels: 0,
//     contact_number: ""
//   });
//   const [addFormData, setAddFormData] = useState({
//     plate_number: "",
//     driver_name: "",
//     office_name: "",
//     vehicle_type: "",
//     engine_type: "Gas",
//     wheels: 4,
//     contact_number: ""
//   });

//   useEffect(() => {
//     if (!loading && !user) {
//       navigate("/");
//     }
//   }, [user, loading, navigate]);

//   const handleExportToCSV = () => {
//     let csvContent = "data:text/csv;charset=utf-8,";
//     csvContent += "Plate Number,Office,Driver,Vehicle Type,Engine Type,Wheels,Contact,Latest Test,Test Result\n";
//     filteredVehicles.forEach(vehicle => {
//       const testDate = vehicle.latest_test_date
//         ? format(new Date(vehicle.latest_test_date), 'MMM dd, yyyy')
//         : "Not Tested";
//       const testResult = vehicle.latest_test_result === null
//         ? "Not Tested"
//         : vehicle.latest_test_result
//           ? "Passed"
//           : "Failed";
//       csvContent += `"${vehicle.plate_number}","${vehicle.office_name}","${vehicle.driver_name}","${vehicle.vehicle_type}","${vehicle.engine_type}","${vehicle.wheels}","${vehicle.contact_number}","${testDate}","${testResult}"\n`;
//     });
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", `vehicles_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     toast.success("Vehicle data exported successfully");
//   };

//   const handleViewDetails = async (vehicle: Vehicle) => {
//     setSelectedVehicle(vehicle);
//     setTestHistoryLoading(true);
//     setViewModalOpen(true);
//     // Fetch emission test history for this vehicle
//     const { data, error } = await supabase
//       .from('emission_tests')
//       .select('id, vehicle_id, test_date, year, quarter, result')
//       .eq('vehicle_id', vehicle.id)
//       .order('year', { ascending: false })
//       .order('quarter', { ascending: false });
//     if (!error && data) {
//       setVehicleTestHistory(data);
//     } else {
//       setVehicleTestHistory([]);
//     }
//     setTestHistoryLoading(false);
//   };

//   const handleEditVehicle = (vehicle: Vehicle) => {
//     setSelectedVehicle(vehicle);
//     setEditFormData({
//       plate_number: vehicle.plate_number,
//       driver_name: vehicle.driver_name,
//       office_name: vehicle.office_name,
//       vehicle_type: vehicle.vehicle_type,
//       engine_type: vehicle.engine_type,
//       wheels: vehicle.wheels,
//       contact_number: vehicle.contact_number || ""
//     });
//     setEditModalOpen(true);
//   };

//   const handleSaveEdit = async () => {
//     if (!selectedVehicle) return;
//     if (!editFormData.plate_number.trim() || !editFormData.driver_name.trim() || !editFormData.office_name.trim() || !editFormData.vehicle_type.trim() || !editFormData.engine_type.trim() || !editFormData.wheels) {
//       toast.error("Please fill in all required fields.");
//       return;
//     }
//     const duplicate = vehicles.find(v => v.plate_number.toLowerCase() === editFormData.plate_number.trim().toLowerCase() && v.id !== selectedVehicle.id);
//     if (duplicate) {
//       toast.error("A vehicle with this plate number already exists.");
//       return;
//     }
//     try {
//       const { error } = await supabase
//         .from('vehicles')
//         .update({
//           plate_number: editFormData.plate_number,
//           driver_name: editFormData.driver_name,
//           office_name: editFormData.office_name,
//           vehicle_type: editFormData.vehicle_type,
//           engine_type: editFormData.engine_type,
//           wheels: editFormData.wheels,
//           contact_number: editFormData.contact_number
//         })
//         .eq('id', selectedVehicle.id);
//       if (error) throw error;
//       toast.success("Vehicle updated successfully");
//       setEditModalOpen(false);
//     } catch (error) {
//       console.error("Error updating vehicle:", error);
//       toast.error("Failed to update vehicle");
//     }
//   };

//   return (
//     <SidebarProvider>
//       <div className="flex min-h-screen w-full">
//         <AppSidebar dashboardType="government-emission" />
//         <div className="flex-1 flex flex-col overflow-hidden">
//           <DashboardNavbar dashboardTitle="Government Vehicles" />
//           <div className="flex-1 overflow-y-auto p-6">
//             <div className="flex items-center justify-between mb-6">
//               <div>
//                 <h1 className="text-2xl font-bold">Vehicles Database</h1>
//                 <p className="text-muted-foreground">Manage and view all vehicles in the system</p>
//                 {offlineNotice && (
//                   <div className="text-sm text-yellow-600 mt-2">Offline mode: showing last available data</div>
//                 )}
//               </div>
//               <div className="flex gap-2">
//                 <Button variant="outline" onClick={handleExportToCSV}>
//                   <FileDown className="mr-2 h-4 w-4" />
//                   Export to CSV
//                 </Button>
//                 <Button onClick={() => setAddModalOpen(true)}>
//                   <Plus className="mr-2 h-4 w-4" />
//                   Add Vehicle
//                 </Button>
//               </div>
//             </div>
//             <Card>
//               <CardHeader className="pb-2">
//                 <CardTitle>Vehicles List</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <VehicleFilters
//                   searchQuery={searchQuery}
//                   setSearchQuery={setSearchQuery}
//                   statusFilter={statusFilter}
//                   setStatusFilter={setStatusFilter}
//                   vehicleTypeFilter={vehicleTypeFilter}
//                   setVehicleTypeFilter={setVehicleTypeFilter}
//                   engineTypeFilter={engineTypeFilter}
//                   setEngineTypeFilter={setEngineTypeFilter}
//                   wheelsFilter={wheelsFilter}
//                   setWheelsFilter={setWheelsFilter}
//                   vehicleTypes={vehicleTypes}
//                   engineTypes={engineTypes}
//                   wheelCounts={wheelCounts}
//                 />
//                 <VehicleTable
//                   vehicles={filteredVehicles}
//                   pendingVehicles={pendingVehicles}
//                   isLoading={isLoading}
//                   onView={handleViewDetails}
//                   onEdit={handleEditVehicle}
//                 />
//               </CardContent>
//             </Card>
//             <VehicleModals
//               viewModalOpen={viewModalOpen}
//               setViewModalOpen={setViewModalOpen}
//               selectedVehicle={selectedVehicle}
//               vehicleTestHistory={vehicleTestHistory}
//               testHistoryLoading={testHistoryLoading}
//               editModalOpen={editModalOpen}
//               setEditModalOpen={setEditModalOpen}
//               editFormData={editFormData}
//               setEditFormData={setEditFormData}
//               handleSaveEdit={handleSaveEdit}
//               addModalOpen={addModalOpen}
//               setAddModalOpen={setAddModalOpen}
//               addFormData={addFormData}
//               setAddFormData={setAddFormData}
//               handleAddVehicle={async () => {
//                 if (!addFormData.plate_number.trim() || !addFormData.driver_name.trim() || !addFormData.office_name.trim() || !addFormData.vehicle_type.trim() || !addFormData.engine_type.trim() || !addFormData.wheels) {
//                   toast.error("Please fill in all required fields.");
//                   return;
//                 }
//                 if (vehicles.some(v => v.plate_number.toLowerCase() === addFormData.plate_number.trim().toLowerCase()) ||
//                     pendingVehicles.some(v => v.plate_number.toLowerCase() === addFormData.plate_number.trim().toLowerCase())) {
//                   toast.error("A vehicle with this plate number already exists.");
//                   return;
//                 }
//                 if (isOffline) {
//                   const newVehicle = {
//                     ...addFormData,
//                     id: `pending-${Date.now()}`,
//                     latest_test_date: null,
//                     latest_test_result: null
//                   };
//                   const updatedPending = [...pendingVehicles, newVehicle];
//                   await set("pending_vehicles", updatedPending);
//                   await save();
//                   setPendingVehicles(updatedPending);
//                   toast.success("Vehicle added offline. Will sync when online.");
//                   setAddModalOpen(false);
//                   setAddFormData({
//                     plate_number: "",
//                     driver_name: "",
//                     office_name: "",
//                     vehicle_type: "",
//                     engine_type: "Gas",
//                     wheels: 4,
//                     contact_number: ""
//                   });
//                   return;
//                 }
//                 try {
//                   const { error } = await supabase
//                     .from('vehicles')
//                     .insert({
//                       plate_number: addFormData.plate_number,
//                       driver_name: addFormData.driver_name,
//                       office_name: addFormData.office_name,
//                       vehicle_type: addFormData.vehicle_type,
//                       engine_type: addFormData.engine_type,
//                       wheels: addFormData.wheels,
//                       contact_number: addFormData.contact_number
//                     });
//                   if (error) throw error;
//                   toast.success("Vehicle added successfully");
//                   setAddModalOpen(false);
//                   setAddFormData({
//                     plate_number: "",
//                     driver_name: "",
//                     office_name: "",
//                     vehicle_type: "",
//                     engine_type: "Gas",
//                     wheels: 4,
//                     contact_number: ""
//                   });
//                 } catch (error) {
//                   console.error("Error adding vehicle:", error);
//                   toast.error("Failed to add vehicle");
//                 }
//               }}
//             />
//           </div>
//         </div>
//       </div>
//     </SidebarProvider>
//   );
// }
