import React, { useState, useEffect } from "react";
import { Input } from "@/presentation/components/shared/ui/input";
import { Button } from "@/presentation/components/shared/ui/button";
import {
  searchDrivers,
  DriverRecord,
  createDriver,
  updateDriver,
  deleteDriver,
  addOffenseToDriver
} from "@/lib/api/driver-api";
import { fetchBelchingFees } from "@/lib/api/belching-api";
import jsPDF from "jspdf";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/shared/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/presentation/components/shared/ui/alert-dialog";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";

// Import the new components
import SearchForm from "../components/driverQuery/SearchForm";
import SearchResults from "../components/driverQuery/SearchResults";
import DriverInformation from "../components/driverQuery/DriverInformation";
import OffenseRecords from "../components/driverQuery/OffenseRecords";

const DriverQuery: React.FC = () => {
  // Search form state
  const [form, setForm] = useState({
    name: "",
    license_no: "",
    plate_no: "",
  });

  // Results and selection state
  const [results, setResults] = useState<DriverRecord[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<DriverRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Belching fees data
  const [belchingFees, setBelchingFees] = useState<any[]>([]);

  // Dialog states
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [isEditDriverOpen, setIsEditDriverOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddOffenseOpen, setIsAddOffenseOpen] = useState(false);

  // Form states
  const [driverForm, setDriverForm] = useState({
    name: "",
    address: "",
    license_no: "",
  });

  const [offenseForm, setOffenseForm] = useState({
    plate_no: "",
    offense_level: "",
    date: new Date().toISOString().split('T')[0],
    place_apprehended: "",
    payment_status: "unpaid",
  });

  // Event handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDriverFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDriverForm({ ...driverForm, [e.target.name]: e.target.value });
  };

  const handleOffenseFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'plate_no') {
      // Auto-determine offense level based on plate number
      let offenseLevel = "";

      if (value && value.length > 0) {
        const lastChar = value.charAt(value.length - 1);
        const lastDigit = parseInt(lastChar);

        if (value.toUpperCase().includes('V')) {
          offenseLevel = "Level 3 - Severe Emission";
        } else if (!isNaN(lastDigit)) {
          offenseLevel = lastDigit % 2 === 0
            ? "Level 2 - Moderate Emission"
            : "Level 1 - Minor Emission";
        } else {
          offenseLevel = "Level 1 - Minor Emission"; // Default
        }
      }

      setOffenseForm({ ...offenseForm, plate_no: value, offense_level: offenseLevel });
    } else {
      setOffenseForm({ ...offenseForm, [name]: value });
    }
  };

  // Search submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await searchDrivers(form);
      setResults(data);
      setSelectedDriver(null);
    } catch (err: any) {
      setError("Failed to fetch driver data.");
    } finally {
      setLoading(false);
    }
  };

  // Print driver offenses
  const handlePrint = () => {
    if (!selectedDriver) return;
    const doc = new jsPDF();
    doc.text(`Driver Offense Report`, 10, 10);
    doc.text(`Name: ${selectedDriver.name}`, 10, 20);
    doc.text(`License No: ${selectedDriver.license_no}`, 10, 30);
    doc.text(`Address: ${selectedDriver.address}`, 10, 40);
    doc.text(`Status: ${selectedDriver.status}`, 10, 50);
    doc.text(`Offenses:`, 10, 60);
    selectedDriver.offenses.forEach((off, idx) => {
      doc.text(
        `${off.date} | ${off.offense_level} | ${off.plate_no} | ${off.place_apprehended} | ${off.payment_status}`,
        10,
        70 + idx * 10
      );
    });
    doc.save(`driver-offense-${selectedDriver.name}.pdf`);
  };

  // Handler for opening edit dialog and setting form data
  const handleEditOpen = () => {
    if (!selectedDriver) return;

    setDriverForm({
      name: selectedDriver.name,
      address: selectedDriver.address,
      license_no: selectedDriver.license_no,
    });

    setIsEditDriverOpen(true);
  };

  // Handle adding a new driver
  const handleAddDriver = async () => {
    if (!driverForm.name || !driverForm.address || !driverForm.license_no) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await createDriver(
        driverForm.name,
        driverForm.address,
        driverForm.license_no
      );
      toast.success("Driver added successfully");
      setIsAddDriverOpen(false);

      // Reset form
      setDriverForm({
        name: "",
        address: "",
        license_no: "",
      });

      // Refresh results if search parameters exist
      if (form.name || form.license_no || form.plate_no) {
        const data = await searchDrivers(form);
        setResults(data);
      }
    } catch (err: any) {
      toast.error("Failed to add driver");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handler for editing a driver
  const handleEditDriver = async () => {
    if (!selectedDriver) return;

    const updatedFields: {
      name?: string;
      address?: string;
      license_no?: string;
    } = {};

    // Only include fields that changed
    if (driverForm.name !== selectedDriver.name) {
      updatedFields.name = driverForm.name;
    }
    if (driverForm.address !== selectedDriver.address) {
      updatedFields.address = driverForm.address;
    }
    if (driverForm.license_no !== selectedDriver.license_no) {
      updatedFields.license_no = driverForm.license_no;
    }

    // If nothing changed, just close dialog
    if (Object.keys(updatedFields).length === 0) {
      setIsEditDriverOpen(false);
      return;
    }

    setLoading(true);
    try {
      const updated = await updateDriver(selectedDriver.id, updatedFields);
      setSelectedDriver(updated);
      toast.success("Driver updated successfully");
      setIsEditDriverOpen(false);

      // Update the driver in results list
      const updatedResults = results.map(d =>
        d.id === selectedDriver.id ? updated : d
      );
      setResults(updatedResults);
    } catch (err: any) {
      toast.error("Failed to update driver");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handler for deleting a driver
  const handleDeleteDriver = async () => {
    if (!selectedDriver) return;

    setLoading(true);
    try {
      await deleteDriver(selectedDriver.id);
      toast.success("Driver deleted successfully");

      // Remove from results
      const updatedResults = results.filter(d => d.id !== selectedDriver.id);
      setResults(updatedResults);
      setSelectedDriver(null);
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      toast.error("Failed to delete driver");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handler for adding an offense to a driver
  const handleAddOffense = async () => {
    if (!selectedDriver) return;

    if (!offenseForm.plate_no || !offenseForm.offense_level ||
      !offenseForm.date || !offenseForm.place_apprehended) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await addOffenseToDriver(selectedDriver.id, {
        plate_no: offenseForm.plate_no,
        offense_level: offenseForm.offense_level,
        date: offenseForm.date,
        place_apprehended: offenseForm.place_apprehended,
        payment_status: offenseForm.payment_status,
      });

      toast.success("Offense added successfully");
      setIsAddOffenseOpen(false);

      // Reset offense form
      setOffenseForm({
        plate_no: "",
        offense_level: "",
        date: new Date().toISOString().split('T')[0],
        place_apprehended: "",
        payment_status: "unpaid",
      });

      // Refresh selected driver data
      const updatedDriver = await searchDrivers({
        name: selectedDriver.name
      });

      if (updatedDriver.length > 0) {
        const refreshedDriver = updatedDriver.find(d => d.id === selectedDriver.id);
        if (refreshedDriver) {
          setSelectedDriver(refreshedDriver);

          // Update results
          const updatedResults = results.map(d =>
            d.id === selectedDriver.id ? refreshedDriver : d
          );
          setResults(updatedResults);
        }
      }
    } catch (err: any) {
      toast.error("Failed to add offense");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handler functions for child components
  const handleViewDriver = (driver: DriverRecord) => {
    setSelectedDriver(driver);
  };

  const handleEditDriverAction = (driver: DriverRecord) => {
    setSelectedDriver(driver);
    handleEditOpen();
  };

  const handleDeleteDriverAction = (driver: DriverRecord) => {
    setSelectedDriver(driver);
    setIsDeleteDialogOpen(true);
  };

  // Fetch belching fees on component mount
  useEffect(() => {
    const loadBelchingFees = async () => {
      try {
        const fees = await fetchBelchingFees();
        setBelchingFees(fees);
      } catch (error) {
        console.error("Failed to fetch belching fees:", error);
      }
    };

    loadBelchingFees();
  }, []);

  // Function to determine offense level based on plate number
  const determineOffenseLevel = (plateNo: string) => {
    if (!plateNo || plateNo.length < 3) return "";

    // For this implementation, we'll use a simple algorithm:
    // License plates ending with odd numbers are Level 1, even numbers are Level 2,
    // and if the plate contains 'V' it's Level 3
    const lastChar = plateNo.charAt(plateNo.length - 1);
    const lastDigit = parseInt(lastChar);

    if (plateNo.toUpperCase().includes('V')) {
      return "Level 3 - Severe Emission";
    } else if (!isNaN(lastDigit)) {
      return lastDigit % 2 === 0
        ? "Level 2 - Moderate Emission"
        : "Level 1 - Minor Emission";
    } else {
      return "Level 1 - Minor Emission"; // Default
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <TopNavBarContainer dashboardType="air-quality" />
      <ColorDivider variant="secondary" />

      {/* Modals and Dialogs */}
      <Dialog open={isAddDriverOpen} onOpenChange={setIsAddDriverOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
            <DialogDescription>Fill in the information to create a new driver record.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                name="name"
                value={driverForm.name}
                onChange={handleDriverFormChange}
                placeholder="Enter driver name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <Input
                name="address"
                value={driverForm.address}
                onChange={handleDriverFormChange}
                placeholder="Enter driver address"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number
              </label>
              <Input
                name="license_no"
                value={driverForm.license_no}
                onChange={handleDriverFormChange}
                placeholder="Enter license number"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleAddDriver}
              disabled={loading || !driverForm.name || !driverForm.address || !driverForm.license_no}
            >
              {loading ? "Adding..." : "Add Driver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Driver Dialog */}
      <Dialog open={isEditDriverOpen} onOpenChange={setIsEditDriverOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
            <DialogDescription>Update driver information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                name="name"
                value={driverForm.name}
                onChange={handleDriverFormChange}
                placeholder="Enter driver name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <Input
                name="address"
                value={driverForm.address}
                onChange={handleDriverFormChange}
                placeholder="Enter driver address"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number
              </label>
              <Input
                name="license_no"
                value={driverForm.license_no}
                onChange={handleDriverFormChange}
                placeholder="Enter license number"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleEditDriver}
              disabled={loading || !driverForm.name || !driverForm.address || !driverForm.license_no}
            >
              {loading ? "Updating..." : "Update Driver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Offense Dialog */}
      <Dialog open={isAddOffenseOpen} onOpenChange={setIsAddOffenseOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-none rounded-none">
          <DialogHeader className="border-b pb-2">
            <DialogTitle>Add New Offense</DialogTitle>
            <DialogDescription>
              Add a new offense record for {selectedDriver?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <div>
              <label className="block text-sm mb-1">
                Plate Number
              </label>
              <Input
                name="plate_no"
                value={offenseForm.plate_no}
                onChange={handleOffenseFormChange}
                placeholder="Enter plate number"
                className="border-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">
                Offense Level <span className="text-xs text-gray-500">(Auto-detected)</span>
              </label>
              <Input
                name="offense_level"
                value={offenseForm.offense_level}
                className="bg-gray-100 border-gray-300"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm mb-1">
                Date
              </label>
              <Input
                type="date"
                name="date"
                value={offenseForm.date}
                onChange={handleOffenseFormChange}
                className="border-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">
                Place Apprehended
              </label>
              <Input
                name="place_apprehended"
                value={offenseForm.place_apprehended}
                onChange={handleOffenseFormChange}
                placeholder="Enter location"
                className="border-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">
                Payment Status
              </label>
              <select
                name="payment_status"
                value={offenseForm.payment_status}
                onChange={handleOffenseFormChange}
                className="w-full border border-gray-300 p-2 rounded-none bg-white"
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
          <DialogFooter className="border-t pt-2">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-none">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleAddOffense}
              className="rounded-none"
              disabled={loading || !offenseForm.plate_no || !offenseForm.offense_level || !offenseForm.date || !offenseForm.place_apprehended}
            >
              {loading ? "Adding..." : "Add Offense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Driver Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the driver record for {selectedDriver?.name} and all associated offenses.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDriver} className="bg-red-600 hover:bg-red-700">
              {loading ? "Deleting..." : "Delete Driver"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="flex flex-col space-y-6">
          {/* First Row: Search Form and Results side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search Form Component - Left side */}
            <div className="lg:col-span-1">
              <SearchForm
                form={form}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                loading={loading}
                onAddDriverClick={() => setIsAddDriverOpen(true)}
              />
            </div>

            {/* Search Results Component - Right side (takes 2/3 of the space) */}
            <div className="lg:col-span-2">
              <SearchResults
                results={results}
                selectedDriver={selectedDriver}
                loading={loading}
                error={error}
                onViewDriver={handleViewDriver}
                onEditDriver={handleEditDriverAction}
                onDeleteDriver={handleDeleteDriverAction}
              />
            </div>
          </div>

          {/* Second Row: Driver Info and Offenses on same row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Driver Information Component - Left side */}
            <div>
              <DriverInformation
                selectedDriver={selectedDriver}
                onEditDriver={handleEditOpen}
                onDeleteDriver={() => setIsDeleteDialogOpen(true)}
                onAddDriverClick={() => setIsAddDriverOpen(true)}
              />
            </div>

            {/* Offense Records Component - Right side */}
            <div>
              <OffenseRecords
                selectedDriver={selectedDriver}
                onAddOffense={() => setIsAddOffenseOpen(true)}
                onPrintOffenses={handlePrint}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverQuery;