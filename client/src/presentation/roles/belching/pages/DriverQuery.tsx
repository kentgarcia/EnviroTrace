import React, { useState } from "react";
import { Input } from "@/presentation/components/shared/ui/input";
import { Button } from "@/presentation/components/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/shared/ui/table";
import { searchDrivers, DriverRecord } from "@/lib/api/driver-api";
import jsPDF from "jspdf";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";

const DriverQuery: React.FC = () => {
  const [form, setForm] = useState({
    driverName: "",
    plateNo: "",
    orNo: "",
    transportGroup: "",
  });

  const [results, setResults] = useState<DriverRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<DriverRecord | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await searchDrivers(form);
      setResults(data);
      setSelectedRecord(null);
    } catch (err: any) {
      setError("Failed to fetch driver data.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!selectedRecord) return;
    const doc = new jsPDF();
    doc.text(`Driver Offense Report`, 10, 10);
    doc.text(`Name: ${selectedRecord.driverName}`, 10, 20);
    doc.text(`Plate No: ${selectedRecord.plateNo}`, 10, 30);
    doc.text(`OR No: ${selectedRecord.orNo}`, 10, 40);
    doc.text(`Transport Group: ${selectedRecord.transportGroup}`, 10, 50);
    doc.text(`Offenses:`, 10, 60);
    selectedRecord.offenses.forEach((off, idx) => {
      doc.text(
        `${off.date} | ${off.type} | ${off.status} | Paid: ${
          off.paid ? "Yes" : "No"
        }`,
        10,
        70 + idx * 10
      );
    });
    doc.save(`driver-offense-${selectedRecord.driverName}.pdf`);
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBarContainer dashboardType="air-quality" />

        {/* Header Section */}
        <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Driver Query</h1>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow max-w-xl mx-auto space-y-4"
        >
          <h2 className="text-lg font-bold mb-2 text-blue-900">Driver Query</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Driver Name
              </label>
              <Input
                name="driverName"
                value={form.driverName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Plate No.
              </label>
              <Input
                name="plateNo"
                value={form.plateNo}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">OR No.</label>
              <Input name="orNo" value={form.orNo} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Transport Group
              </label>
              <Input
                name="transportGroup"
                value={form.transportGroup}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="pt-2">
            <Button type="submit" className="w-full bg-blue-700 text-white">
              Search
            </Button>
          </div>
        </form>
        {/* Search Results Table */}
        <div className="mt-8 max-w-3xl mx-auto">
          {error && <div className="text-red-600 mb-2">{error}</div>}
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver Name</TableHead>
                  <TableHead>Plate No.</TableHead>
                  <TableHead>OR No.</TableHead>
                  <TableHead>Transport Group</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.driverName}</TableCell>
                    <TableCell>{row.plateNo}</TableCell>
                    <TableCell>{row.orNo}</TableCell>
                    <TableCell>{row.transportGroup}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedRecord(row)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        {selectedRecord && (
          <div className="mt-8 max-w-3xl mx-auto bg-white rounded shadow p-6">
            <h3 className="text-md font-bold mb-2 text-blue-900">
              Record Information
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500">Driver Name</div>
                <div className="font-semibold">{selectedRecord.driverName}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Plate No.</div>
                <div className="font-semibold">{selectedRecord.plateNo}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">OR No.</div>
                <div className="font-semibold">{selectedRecord.orNo}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Transport Group</div>
                <div className="font-semibold">
                  {selectedRecord.transportGroup}
                </div>
              </div>
            </div>
            <h4 className="text-sm font-bold mb-2 text-gray-800">
              Offense Table
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedRecord.offenses.map((off, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{off.date}</TableCell>
                    <TableCell>{off.type}</TableCell>
                    <TableCell>{off.status}</TableCell>
                    <TableCell>
                      {off.paid ? (
                        <span className="text-green-600 font-bold">✔</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="pt-4 text-right">
              <Button onClick={handlePrint} className="bg-green-700 text-white">
                Print Driver Offense
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverQuery;
