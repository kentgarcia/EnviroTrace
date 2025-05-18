import React, { useState, useEffect } from "react";
import { Input } from "@/presentation/components/shared/ui/input";
import { Button } from "@/presentation/components/shared/ui/button";
import { fetchBelchingRecords } from "@/lib/api/belching-api";

// type for belching record/driver
interface DriverRecord {
  id: number | string;
  name?: string; // fallback if not present
  plateNumber: string;
  operator: string;
  offenseLevel: number;
  lastDateApprehended: string;
}

const EncodeValidation: React.FC = () => {
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [violationInfo, setViolationInfo] = useState({
    oirNo: "",
    sdtrNo: "",
    place: "",
    date: "",
  });

  useEffect(() => {
    fetchBelchingRecords().then((data) => {
      setDrivers(data);
      if (data.length > 0) setSelectedDriverId(data[0].id.toString());
    });
  }, []);

  const selectedDriver = drivers.find(
    (d) => d.id.toString() === selectedDriverId
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setViolationInfo({ ...violationInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement submit logic (call backend mutation)
    alert("Validation encoded (mock)");
  };

  return (
    <div className="bg-white border rounded-lg p-6 max-w-xl mx-auto">
      <h2 className="text-lg font-bold mb-4 text-blue-900">
        Encode Validation
      </h2>
      {/* Driver Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select Driver</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={selectedDriverId}
          onChange={(e) => setSelectedDriverId(e.target.value)}
        >
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.name || driver.plateNumber} ({driver.plateNumber})
            </option>
          ))}
        </select>
      </div>
      {/* Vehicle Info */}
      {selectedDriver && (
        <div className="mb-4 grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded">
          <div>
            <div className="text-xs text-gray-500">Plate</div>
            <div className="font-semibold">{selectedDriver.plateNumber}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Operator</div>
            <div className="font-semibold">{selectedDriver.operator}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Current Offense</div>
            <div className="font-semibold">{selectedDriver.offenseLevel}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Date Last Apprehended</div>
            <div className="font-semibold">
              {selectedDriver.lastDateApprehended}
            </div>
          </div>
        </div>
      )}
      {/* Violation Info Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">OIR No.</label>
            <Input
              name="oirNo"
              value={violationInfo.oirNo}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">SDTR No.</label>
            <Input
              name="sdtrNo"
              value={violationInfo.sdtrNo}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Place</label>
            <Input
              name="place"
              value={violationInfo.place}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <Input
              name="date"
              type="date"
              value={violationInfo.date}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="pt-2">
          <Button type="submit" className="w-full bg-blue-700 text-white">
            Encode Validation
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EncodeValidation;
