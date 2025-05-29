import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/presentation/components/shared/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/shared/ui/tabs";
import { Input } from "@/presentation/components/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/shared/ui/table";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Skeleton } from "@/presentation/components/shared/ui/skeleton";
import {
  Vehicle,
  VehicleFormInput,
  useEmissionTests
} from "@/core/api/emission-service";
import { useVehicle } from "@/core/api/vehicle-service";
import { formatTestDate, formatTestDateTime, parseDate } from "@/core/utils/dateUtils";

interface VehicleDetailsProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onEditVehicle?: (data: VehicleFormInput) => void;
  isEditing?: boolean;
  onRegisterRefetch?: (refetch: () => void) => void;
}

export const VehicleDetails: React.FC<VehicleDetailsProps> = ({
  vehicle,
  isOpen, // not used for inline
  onClose, // not used for inline
  onEditVehicle,
  isEditing: isEditingProp = false,
  onRegisterRefetch,
}) => {
  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(isEditingProp);  // Always use the latest vehicle data for editing
  const [editData, setEditData] = useState<VehicleFormInput | null>(null);
  // Fetch full vehicle details (with driverHistory) when modal is open
  const {
    data: vehicleData,
    isLoading: isVehicleLoading,
    refetch,
  } = useVehicle(vehicle?.id || "", {
    enabled: isOpen && !!vehicle && !vehicle.id.startsWith("pending-"),
  });

  // Register the refetch function for parent
  React.useEffect(() => {
    if (onRegisterRefetch) {
      onRegisterRefetch(() => refetch());
    }
  }, [refetch, onRegisterRefetch, vehicle?.id]);

  const fullVehicle = vehicleData || vehicle;
  const driverHistory = fullVehicle?.driverHistory || [];  // When entering edit mode, set editData to current vehicle data
  React.useEffect(() => {
    if (isEditing && fullVehicle) {
      setEditData({
        plateNumber: fullVehicle.plate_number,
        driverName: fullVehicle.driver_name,
        contactNumber: fullVehicle.contact_number || "",
        officeName: fullVehicle.office?.name || "Unknown Office",
        vehicleType: fullVehicle.vehicle_type,
        engineType: fullVehicle.engine_type,
        wheels: fullVehicle.wheels,
      });
    }
  }, [isEditing, fullVehicle?.id]); // Only depend on vehicle ID to prevent infinite re-renders
  // Fetch vehicle test history using TanStack Query
  const {
    data: testData,
    isLoading
  } = useEmissionTests({
    vehicleId: vehicle?.id
  }, {
    enabled: isOpen && !!vehicle && !vehicle.id.startsWith("pending-"),
  });

  // Extract test history from the query result
  const testHistory = testData || [];
  if (!vehicle) return null;

  const isPendingVehicle = vehicle.id.startsWith("pending-");

  return (
    <div className="max-w-3xl w-full mx-auto">
      <div className="mb-4 flex items-center gap-2">        <div className="text-xl font-semibold flex-1">
        {fullVehicle?.plate_number}
      </div>
        {isEditing ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        )}
      </div>
      <div className="text-muted-foreground text-sm flex items-center gap-2 mb-4">
        Vehicle Details
        {fullVehicle?.id.startsWith("pending-") && (
          <Badge
            variant="outline"
            className="ml-2 text-yellow-600 bg-yellow-50"
          >
            Pending Sync
          </Badge>
        )}
      </div>
      <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="info">Vehicle Information</TabsTrigger>
          <TabsTrigger
            value="history"
            disabled={fullVehicle?.id.startsWith("pending-")}
          >
            Test History
          </TabsTrigger>
          <TabsTrigger
            value="drivers"
            disabled={fullVehicle?.id.startsWith("pending-")}
          >
            Driver History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="space-y-6">
          {isEditing && editData ? (
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (onEditVehicle && editData) {
                  await onEditVehicle(editData); // Save to backend
                  setIsEditing(false);
                }
              }}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Plate Number
                </label>
                <Input
                  value={editData.plateNumber}
                  onChange={(e) =>
                    setEditData({ ...editData, plateNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Driver Name
                </label>
                <Input
                  value={editData.driverName}
                  onChange={(e) =>
                    setEditData({ ...editData, driverName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Contact Number
                </label>
                <Input
                  value={editData.contactNumber}
                  onChange={(e) =>
                    setEditData({ ...editData, contactNumber: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Office
                </label>
                <Input
                  value={editData.officeName}
                  onChange={(e) =>
                    setEditData({ ...editData, officeName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Vehicle Type
                </label>
                <Input
                  value={editData.vehicleType}
                  onChange={(e) =>
                    setEditData({ ...editData, vehicleType: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Engine Type
                </label>
                <Input
                  value={editData.engineType}
                  onChange={(e) =>
                    setEditData({ ...editData, engineType: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Wheels
                </label>
                <Input
                  type="number"
                  min={2}
                  max={18}
                  value={editData.wheels}
                  onChange={(e) =>
                    setEditData({ ...editData, wheels: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="col-span-2 flex gap-2 pt-2">
                <Button type="submit" size="sm">
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : !fullVehicle ? (
            <div className="text-center py-6 text-gray-500">
              Vehicle data not available.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">
                  Plate Number
                </h3>                <p>{fullVehicle.plate_number}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">
                  Driver Name
                </h3>
                <p>{fullVehicle.driver_name}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">
                  Contact Number
                </h3>
                <p>{fullVehicle.contact_number || "Not provided"}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Office</h3>
                <p>{fullVehicle.office?.name || "Unknown Office"}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">
                  Vehicle Type
                </h3>
                <p>{fullVehicle.vehicle_type}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">
                  Engine Type
                </h3>
                <p>{fullVehicle.engine_type}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Wheels</h3>
                <p>{fullVehicle.wheels}</p>
              </div>              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">
                  Latest Test Date
                </h3>
                <p>
                  {formatTestDate(fullVehicle.latest_test_date)}
                </p>
              </div><div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">
                  Latest Test Result
                </h3>
                <div>
                  {fullVehicle.latest_test_result === null ||
                    fullVehicle.latest_test_result === undefined ? (
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-800"
                    >
                      Not tested
                    </Badge>) : fullVehicle.latest_test_result ? (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800"
                      >
                        Passed
                      </Badge>
                    ) : (
                    <Badge
                      variant="outline"
                      className="bg-red-100 text-red-800"
                    >
                      Failed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {isPendingVehicle ? (
            <div className="text-center py-6 text-gray-500">
              Test history will be available after syncing this vehicle.
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : testHistory.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No test history available for this vehicle.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Date</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>                  {testHistory.map((test) => (
                  <TableRow key={test.id}>                      <TableCell>
                    {formatTestDate(test.test_date)}
                  </TableCell>
                    <TableCell>
                      Q{test.quarter}, {test.year}
                    </TableCell>
                    <TableCell>
                      {test.result ? (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800"
                        >
                          Passed
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-red-100 text-red-800"
                        >
                          Failed
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="drivers">
          {isVehicleLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : driverHistory.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No driver history available for this vehicle.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver Name</TableHead>
                    <TableHead>Changed At</TableHead>
                    <TableHead>Changed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driverHistory.map((entry, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{entry.driverName}</TableCell>                      <TableCell>
                        {formatTestDateTime(entry.changedAt)}
                      </TableCell>
                      <TableCell>{entry.changedBy || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
