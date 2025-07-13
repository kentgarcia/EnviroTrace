import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/shared/ui/table";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/shared/ui/card";
import { format } from "date-fns";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";
import {
  fetchFees,
  createFee,
  updateFee,
  deleteFee,
} from "@/core/api/api-client";

interface Fee {
  fee_id: number;
  category: string;
  rate: number;
  date_effective: string;
  offense_level: number;
}

const FeeControl: React.FC = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [newRate, setNewRate] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<Omit<Fee, 'fee_id'>>({
    category: "",
    rate: 0,
    date_effective: "",
    offense_level: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFees();
      // Ensure data is an array to prevent .map() errors
      setFees(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError("Failed to load fees");
      setFees([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);

  const handleFeeSelect = (fee: Fee) => {
    setSelectedFee(fee);
    setNewRate(fee.rate.toString());
  };

  const handleUpdateRate = async () => {
    if (!selectedFee) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await updateFee(selectedFee.fee_id, {
        rate: Number(newRate),
      });
      setFees((prev) =>
        Array.isArray(prev) ? prev.map((fee) =>
          fee.fee_id === selectedFee.fee_id
            ? { ...fee, rate: Number(newRate) }
            : fee
        ) : []
      );
      setSelectedFee((prev) =>
        prev ? { ...prev, rate: Number(newRate) } : prev
      );
    } catch (err: any) {
      setError("Failed to update rate");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRate = async () => {
    if (!selectedFee) return;
    setLoading(true);
    setError(null);
    try {
      await deleteFee(selectedFee.fee_id);
      setFees((prev) =>
        Array.isArray(prev) ? prev.filter((fee) => fee.fee_id !== selectedFee.fee_id) : []
      );
      setSelectedFee(null);
    } catch (err: any) {
      setError("Failed to delete fee");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !addForm.category ||
      !addForm.rate ||
      !addForm.date_effective ||
      !addForm.offense_level
    ) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const newFee = await createFee({
        ...addForm,
        rate: Number(addForm.rate),
        offense_level: Number(addForm.offense_level),
      });
      setFees((prev) => Array.isArray(prev) ? [...prev, newFee] : [newFee]);
      setShowAddForm(false);
      setAddForm({
        category: "",
        rate: 0,
        date_effective: "",
        offense_level: 0,
      });
    } catch (err: any) {
      setError("Failed to add fee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen w-full">
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavBarContainer dashboardType="air-quality" />

          {/* Header Section */}
          <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              Fee Control
            </h1>
          </div>

          {/* Body Section */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
            <div className="px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fees Table */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Fees</CardTitle>
                    <Button size="sm" onClick={() => setShowAddForm((v) => !v)}>
                      {showAddForm ? "Cancel" : "Add Rate"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loading && (
                      <div className="text-center text-gray-500">
                        Loading...
                      </div>
                    )}
                    {error && (
                      <div className="text-center text-red-500">{error}</div>
                    )}
                    {showAddForm && (
                      <form onSubmit={handleAddRate} className="mb-4 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Input
                              id="category"
                              value={addForm.category}
                              onChange={(e) =>
                                setAddForm((f) => ({
                                  ...f,
                                  category: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="rate">Rate</Label>
                            <Input
                              id="rate"
                              type="number"
                              value={addForm.rate}
                              onChange={(e) =>
                                setAddForm((f) => ({
                                  ...f,
                                  rate: Number(e.target.value),
                                }))
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="date_effective">
                              Date Effective
                            </Label>
                            <Input
                              id="date_effective"
                              type="date"
                              value={addForm.date_effective}
                              onChange={(e) =>
                                setAddForm((f) => ({
                                  ...f,
                                  date_effective: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="offense_level">Offense Level</Label>
                            <Input
                              id="offense_level"
                              type="number"
                              value={addForm.offense_level}
                              onChange={(e) =>
                                setAddForm((f) => ({
                                  ...f,
                                  offense_level: Number(e.target.value),
                                }))
                              }
                              required
                            />
                          </div>
                        </div>
                        <Button type="submit" className="mt-2 w-full">
                          Add Fee
                        </Button>
                      </form>
                    )}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fee ID</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Offense Level</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(fees) && fees.map((fee) => (
                          <TableRow
                            key={fee.fee_id}
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => handleFeeSelect(fee)}
                          >
                            <TableCell>{fee.fee_id}</TableCell>
                            <TableCell>{fee.category}</TableCell>
                            <TableCell>{fee.offense_level}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Details Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle>Fee Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading && (
                      <div className="text-center text-gray-500">
                        Loading...
                      </div>
                    )}
                    {error && (
                      <div className="text-center text-red-500">{error}</div>
                    )}
                    {selectedFee ? (
                      <div className="space-y-4">
                        <div>
                          <Label>Fee ID</Label>
                          <div className="text-sm">{selectedFee.fee_id}</div>
                        </div>
                        <div>
                          <Label>Category</Label>
                          <div className="text-sm">{selectedFee.category}</div>
                        </div>
                        <div>
                          <Label>Current Rate</Label>
                          <div className="text-sm">
                            ₱{selectedFee.rate.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <Label>Date Effective</Label>
                          <div className="text-sm">
                            {format(
                              new Date(selectedFee.date_effective),
                              "MMMM d, yyyy"
                            )}
                          </div>
                        </div>
                        <div>
                          <Label>Offense Level</Label>
                          <div className="text-sm">
                            {selectedFee.offense_level}
                          </div>
                        </div>

                        <div className="space-y-4 pt-4">
                          <div>
                            <Label htmlFor="newRate">New Rate</Label>
                            <Input
                              id="newRate"
                              type="number"
                              value={newRate}
                              onChange={(e) => setNewRate(e.target.value)}
                              placeholder="Enter new rate"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button onClick={handleUpdateRate}>
                              Update Rate
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleDeleteRate}
                            >
                              Delete Rate
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        Select a fee to view details
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeeControl;
