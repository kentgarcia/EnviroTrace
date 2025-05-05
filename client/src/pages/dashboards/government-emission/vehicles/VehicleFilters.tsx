// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import React from "react";

// interface VehicleFiltersProps {
//   searchQuery: string;
//   setSearchQuery: (v: string) => void;
//   statusFilter: string;
//   setStatusFilter: (v: string) => void;
//   vehicleTypeFilter: string;
//   setVehicleTypeFilter: (v: string) => void;
//   engineTypeFilter: string;
//   setEngineTypeFilter: (v: string) => void;
//   wheelsFilter: string;
//   setWheelsFilter: (v: string) => void;
//   vehicleTypes: string[];
//   engineTypes: string[];
//   wheelCounts: number[];
// }

// /**
//  * Filter controls for the vehicles table in the government emission dashboard.
//  *
//  * @param props - VehicleFiltersProps
//  * @returns React component
//  */
// export const VehicleFilters: React.FC<VehicleFiltersProps> = ({
//   searchQuery, setSearchQuery,
//   statusFilter, setStatusFilter,
//   vehicleTypeFilter, setVehicleTypeFilter,
//   engineTypeFilter, setEngineTypeFilter,
//   wheelsFilter, setWheelsFilter,
//   vehicleTypes, engineTypes, wheelCounts
// }) => (
//   <div className="flex flex-col sm:flex-row gap-4 mb-4">
//     <div className="relative grow">
//       <Input
//         placeholder="Search by plate number, driver, or office..."
//         className="pl-8"
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//       />
//     </div>
//     <Select value={statusFilter} onValueChange={setStatusFilter}>
//       <SelectTrigger className="w-[140px]">
//         <SelectValue placeholder="Test Status" />
//       </SelectTrigger>
//       <SelectContent>
//         <SelectItem value="all">All Statuses</SelectItem>
//         <SelectItem value="passed">Passed</SelectItem>
//         <SelectItem value="failed">Failed</SelectItem>
//         <SelectItem value="untested">Not Tested</SelectItem>
//       </SelectContent>
//     </Select>
//     <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
//       <SelectTrigger className="w-[130px]">
//         <SelectValue placeholder="Vehicle Type" />
//       </SelectTrigger>
//       <SelectContent>
//         <SelectItem value="all">All Types</SelectItem>
//         {vehicleTypes.map(type => (
//           <SelectItem key={type} value={type}>{type}</SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//     <Select value={engineTypeFilter} onValueChange={setEngineTypeFilter}>
//       <SelectTrigger className="w-[130px]">
//         <SelectValue placeholder="Engine Type" />
//       </SelectTrigger>
//       <SelectContent>
//         <SelectItem value="all">All Engines</SelectItem>
//         {engineTypes.map(type => (
//           <SelectItem key={type} value={type}>{type}</SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//     <Select value={wheelsFilter} onValueChange={setWheelsFilter}>
//       <SelectTrigger className="w-[120px]">
//         <SelectValue placeholder="Wheels" />
//       </SelectTrigger>
//       <SelectContent>
//         <SelectItem value="all">All Wheels</SelectItem>
//         {wheelCounts.map(count => (
//           <SelectItem key={count} value={count.toString()}>{count} Wheels</SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//   </div>
// );
