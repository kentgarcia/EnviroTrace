import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Edit, ChevronDown } from "lucide-react";
import { Vehicle } from "./types";
import React from "react";

/**
 * Props for VehicleTable component.
 */
export interface VehicleTableProps {
  vehicles: Vehicle[];
  pendingVehicles: Vehicle[];
  isLoading: boolean;
  onView: (vehicle: Vehicle) => void;
  onEdit: (vehicle: Vehicle) => void;
}

/**
 * Vehicles table component for the government emission dashboard.
 * Renders a table of vehicles with actions for view and edit.
 *
 * @param props - VehicleTableProps
 * @returns React component
 */
export const VehicleTable: React.FC<VehicleTableProps> = ({ vehicles, pendingVehicles, isLoading, onView, onEdit }) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Plate Number</TableHead>
          <TableHead>Office</TableHead>
          <TableHead>Driver</TableHead>
          <TableHead>Vehicle Type</TableHead>
          <TableHead>Engine Type</TableHead>
          <TableHead>Wheels</TableHead>
          <TableHead>Latest Test</TableHead>
          <TableHead>Result</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-8">
              <div className="flex justify-center">
                <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            </TableCell>
          </TableRow>
        ) : vehicles.length === 0 && pendingVehicles.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-8">
              No vehicles found.
            </TableCell>
          </TableRow>
        ) : (
          [...vehicles, ...pendingVehicles].map((vehicle) => (
            <TableRow key={vehicle.id} className={vehicle.id?.toString().startsWith('pending-') ? 'opacity-60' : ''}>
              <TableCell 
                className="font-medium text-blue-900 cursor-pointer hover:text-blue-600" 
                onClick={() => onView(vehicle)}
                title="View vehicle details"
              >
                {vehicle.plate_number}
              </TableCell>
              <TableCell>{vehicle.office_name}</TableCell>
              <TableCell>{vehicle.driver_name}</TableCell>
              <TableCell>{vehicle.vehicle_type}</TableCell>
              <TableCell>{vehicle.engine_type}</TableCell>
              <TableCell>{vehicle.wheels}</TableCell>
              <TableCell>{vehicle.latest_test_date ? vehicle.latest_test_date : "Not tested"}</TableCell>
              <TableCell>
                {vehicle.latest_test_result === null ? (
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Not tested</span>
                ) : vehicle.latest_test_result ? (
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Passed</span>
                ) : (
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Failed</span>
                )}
                {vehicle.id?.toString().startsWith('pending-') && (
                  <span className="ml-2 text-xs text-yellow-600">(pending sync)</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {vehicle.id?.toString().startsWith('pending-') ? null : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Actions <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(vehicle)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(vehicle)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Vehicle
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
);
