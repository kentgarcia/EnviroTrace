import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/shared/ui/card";
import { Button } from "../../../components/shared/ui/button";
import { Input } from "../../../components/shared/ui/input";
import { Label } from "../../../components/shared/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/shared/ui/table";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";

// Sample data for demonstration
const EXISTING_ORDERS = [
  {
    ctrlNo: "020599",
    plateNo: "DJL-123",
    operatorName: "DELA CRUZ, FERNANDO",
    status: "NEW",
    date: "2025-05-09",
  },
  {
    ctrlNo: "020598",
    plateNo: "XYZ-456",
    operatorName: "SANTOS, MARIA",
    status: "PAID",
    date: "2025-05-09",
  },
];

const VIOLATIONS = [
  {
    driverName: "FAUSTINO, KEYSON M.",
    date: "2020-02-26",
    driverOffense: "1st Offense",
    driverPenalty: 100,
    operatorOffense: "1st Offense",
    operatorPenalty: 1000,
    payDriver: true,
    payOperator: true,
  },
  {
    driverName: "MOJE, ANGELITO L.",
    date: "2025-05-09",
    driverOffense: "1st Offense",
    driverPenalty: 100,
    operatorOffense: "2nd Offense",
    operatorPenalty: 2000,
    payDriver: true,
    payOperator: true,
  },
];

const OrderOfPayment: React.FC = () => {
  // Step 1: Entry Point State
  const [step, setStep] = useState<1 | 2>(1);
  const [ctrlNo, setCtrlNo] = useState("020600");
  const [existingCtrlNo, setExistingCtrlNo] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Step 2: Payment Module State
  const [violations, setViolations] = useState(VIOLATIONS);
  const [apprehensionFee, setApprehensionFee] = useState(true);
  const [testingOfficer, setTestingOfficer] = useState("");
  const [testResults, setTestResults] = useState("");
  const [testDate, setTestDate] = useState("");
  const [computed, setComputed] = useState(false);
  const [totals, setTotals] = useState({ driver: 0, operator: 0, grand: 0 });

  // Sample vehicle/operator info
  const vehicleInfo = {
    plateNo: "DJL-123",
    operatorName: "DELA CRUZ, FERNANDO",
    status: "NEW",
  };

  // Handlers
  const handleContinue = () => {
    setStep(2);
  };

  const handleCompute = () => {
    const driver = violations.reduce(
      (sum, v) => (v.payDriver ? sum + v.driverPenalty : sum),
      0
    );
    const operator = violations.reduce(
      (sum, v) => (v.payOperator ? sum + v.operatorPenalty : sum),
      0
    );
    const grand = driver + operator + (apprehensionFee ? 150 : 0);
    setTotals({ driver, operator, grand });
    setComputed(true);
  };

  const handleTogglePay = (idx: number, type: "payDriver" | "payOperator") => {
    setViolations((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [type]: !v[type] } : v))
    );
    setComputed(false);
  };

  // UI
  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBarContainer dashboardType="air-quality" />
        <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">
            Order of Payment
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
          <div className="px-6">
            <ColorDivider />
          </div>
          {step === 1 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Left: Entry Point */}
              <Card className="col-span-1 flex flex-col h-full">
                <CardHeader>
                  <CardTitle>Order of Payment Table</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="mb-2 font-medium">
                    Vehicle Selected: <span className="font-bold">DJL-123</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="existingCtrlNo">
                      Enter Existing OOP Ctrl No.
                    </Label>
                    <Input
                      id="existingCtrlNo"
                      placeholder="e.g. 020599"
                      value={existingCtrlNo}
                      onChange={(e) => setExistingCtrlNo(e.target.value)}
                    />
                    <Button variant="secondary" className="w-full mt-2">
                      LOOK UP
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Label>Generate New OOP Ctrl No.</Label>
                    <Input value={ctrlNo} readOnly className="w-32 bg-muted" />
                  </div>
                  <Button className="w-full mt-4" onClick={handleContinue}>
                    CONTINUE
                  </Button>
                </CardContent>
              </Card>
              {/* Right: Existing Orders Table */}
              <Card className="col-span-1 flex flex-col h-full">
                <CardHeader>
                  <CardTitle>Existing Orders (2025-05-09)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ctrl No.</TableHead>
                        <TableHead>Plate No.</TableHead>
                        <TableHead>Operator</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {EXISTING_ORDERS.map((order) => (
                        <TableRow key={order.ctrlNo}>
                          <TableCell>{order.ctrlNo}</TableCell>
                          <TableCell>{order.plateNo}</TableCell>
                          <TableCell>{order.operatorName}</TableCell>
                          <TableCell>{order.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col gap-6 mt-6">
              {/* Top Section: Request & Testing Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Request & Testing Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label>Status</Label>
                    <Input
                      value={vehicleInfo.status}
                      readOnly
                      className="bg-muted"
                    />
                    <Label className="mt-2">Plate Number</Label>
                    <Input
                      value={vehicleInfo.plateNo}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label>Operator Name</Label>
                    <Input
                      value={vehicleInfo.operatorName}
                      readOnly
                      className="bg-muted"
                    />
                    <Label className="mt-2">OOP Ctrl No</Label>
                    <Input value={ctrlNo} readOnly className="bg-muted" />
                  </div>
                  <div>
                    <Label>Testing Officer</Label>
                    <Input
                      value={testingOfficer}
                      onChange={(e) => setTestingOfficer(e.target.value)}
                    />
                    <Label className="mt-2">Test Results</Label>
                    <Input
                      value={testResults}
                      onChange={(e) => setTestResults(e.target.value)}
                    />
                    <Label className="mt-2">Date of Testing</Label>
                    <Input
                      type="date"
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
              {/* Middle Section: Violations Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Violations</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Driver Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Driver Offense</TableHead>
                        <TableHead>Driver Penalty</TableHead>
                        <TableHead>Pay Driver</TableHead>
                        <TableHead>Operator Offense</TableHead>
                        <TableHead>Operator Penalty</TableHead>
                        <TableHead>Pay Operator</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {violations.map((v, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{v.driverName}</TableCell>
                          <TableCell>{v.date}</TableCell>
                          <TableCell>{v.driverOffense}</TableCell>
                          <TableCell>₱{v.driverPenalty.toFixed(2)}</TableCell>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={v.payDriver}
                              onChange={() => handleTogglePay(idx, "payDriver")}
                            />
                          </TableCell>
                          <TableCell>{v.operatorOffense}</TableCell>
                          <TableCell>₱{v.operatorPenalty.toFixed(2)}</TableCell>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={v.payOperator}
                              onChange={() =>
                                handleTogglePay(idx, "payOperator")
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              {/* Bottom Section: Payment Calculation */}
              <div className="flex flex-col md:flex-row gap-6">
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle>Payment Checklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={apprehensionFee}
                        onChange={() => {
                          setApprehensionFee((v) => !v);
                          setComputed(false);
                        }}
                        id="apprehensionFee"
                      />
                      <Label htmlFor="apprehensionFee">
                        Apprehension Fee (₱150.00)
                      </Label>
                    </div>
                  </CardContent>
                </Card>
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle>Amount Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div>
                        Driver Amount:{" "}
                        <span className="font-bold">
                          ₱{totals.driver.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        Operator Amount:{" "}
                        <span className="font-bold">
                          ₱{totals.operator.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        Apprehension Fee:{" "}
                        <span className="font-bold">
                          ₱{apprehensionFee ? "150.00" : "0.00"}
                        </span>
                      </div>
                      <div className="mt-2 text-lg">
                        Grand Total:{" "}
                        <span className="font-bold">
                          ₱{totals.grand.toFixed(2)}
                        </span>
                      </div>
                      <Button className="mt-2" onClick={handleCompute}>
                        COMPUTE PAYMENT
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="w-full md:w-auto">
                  SAVE ORDER OF PAYMENT
                </Button>
                <Button variant="secondary" className="w-full md:w-auto">
                  CANCEL ORDER OF PAYMENT
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderOfPayment;
