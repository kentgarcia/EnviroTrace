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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/shared/ui/tabs";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";

const SEARCH_FIELDS = [
  { label: "Transport Group", value: "transportGroup" },
  { label: "Plate No.", value: "plateNumber" },
  { label: "Operator", value: "operatorName" },
];

const SEARCH_RESULTS_SAMPLE = [
  {
    transportGroup: "TYR-123",
    plateNumber: "TYR-123",
    vehicleType: "Jeep",
    operatorName: "DELA CRUZ, FERNANDO",
  },
  {
    transportGroup: "NXT-123",
    plateNumber: "NXT-123",
    vehicleType: "Jeep",
    operatorName: "JUAN ISAGANI E. GERON",
  },
  {
    transportGroup: "WFM-123",
    plateNumber: "WFM-123",
    vehicleType: "Truck",
    operatorName: "ESTRIMA INTERNATIONAL CORP",
  },
];

const RECORD_SAMPLE = {
  plateNumber: "NXT-123",
  vehicleType: "Jeep",
  operatorName: "JUAN ISAGANI E. GERON",
  operatorAddress: "TAGUIG CITY",
  status: "NO OFFENSE",
  statusColor: "bg-green-500 text-white",
  licenseValidUntil: "2022-05-04",
};

const VIOLATIONS_SAMPLE: any[] = [];

const HISTORY_SAMPLE = [
  {
    type: "CLEARANCE",
    date: "2022-04-04",
    details: "CEC #: 09761, TR: 2.2, Officer: R. TIONG JR, OR No.: 9831405",
    status: "PAID",
  },
  {
    type: "CLEARANCE",
    date: "2021-03-02",
    details: "CEC #: 08442, TR: 2.1, Officer: R. TIONG JR, OR No.: 9831404",
    status: "PAID",
  },
];

const EDIT_MODE_FIELDS = {
  plateNumber: "NXT-123",
  vehicleType: "Jeep",
  transportGroup: "NXT-123",
  operatorName: "JUAN ISAGANI E. GERON",
  operatorAddress: "TAGUIG CITY",
  ownerName: "",
  firstName: "JUAN ISAGANI",
  middleName: "E.",
  lastName: "GERON",
  motorNo: "MTR-001",
  motorVehicleNo: "MVN-001",
};

const RecordsAndFile: React.FC = () => {
  const [searchField, setSearchField] = useState(SEARCH_FIELDS[0].value);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>(
    SEARCH_RESULTS_SAMPLE
  );
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [tab, setTab] = useState<"violations" | "history">("violations");
  const [editMode, setEditMode] = useState<"none" | "add" | "update">("none");
  const [editFields, setEditFields] = useState<any>(EDIT_MODE_FIELDS);

  const handleSearch = () => {
    // TODO: Replace with actual search logic
    setSearchResults(
      SEARCH_RESULTS_SAMPLE.filter((row) =>
        row[searchField]?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setSelectedRecord(null);
  };

  const handleSelectRecord = (row: any) => {
    setSelectedRecord({ ...RECORD_SAMPLE, ...row });
    setEditMode("none");
  };

  const handleEdit = (mode: "add" | "update") => {
    setEditMode(mode);
    setEditFields(mode === "add" ? {} : { ...EDIT_MODE_FIELDS });
  };

  // --- UI ---
  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBarContainer dashboardType="air-quality" />
        {/* Header Section */}
        <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">
            RECORDS AND FILE
          </h1>
        </div>
        {/* Body Section */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
          <div className="px-6">
            <ColorDivider />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Search & Results */}
            <Card className="col-span-1 flex flex-col h-full">
              <CardHeader>
                <CardTitle>Search Records</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label htmlFor="searchField">Search By</Label>
                    <select
                      id="searchField"
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                      className="w-full mt-1 border rounded px-2 py-2"
                    >
                      {SEARCH_FIELDS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="searchQuery">Enter Search Query</Label>
                    <Input
                      id="searchQuery"
                      placeholder="e.g. 123"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={handleSearch} className="h-10">
                    SEARCH
                  </Button>
                </div>
                <div className="flex-1 min-h-[300px] overflow-y-auto mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transport Group</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Operator</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center text-muted-foreground py-8"
                          >
                            No results.
                          </TableCell>
                        </TableRow>
                      ) : (
                        searchResults.map((row) => (
                          <TableRow
                            key={row.plateNumber}
                            className={`cursor-pointer ${
                              selectedRecord?.plateNumber === row.plateNumber
                                ? "bg-orange-200"
                                : ""
                            }`}
                            onClick={() => handleSelectRecord(row)}
                          >
                            <TableCell>{row.transportGroup}</TableCell>
                            <TableCell>{row.vehicleType}</TableCell>
                            <TableCell>{row.operatorName}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            {/* Record Details or Edit Form */}
            <Card className="col-span-2 flex flex-col h-full">
              <CardHeader>
                <CardTitle>Record Information</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {/* Top-Level Actions */}
                <div className="flex gap-2 mb-2">
                  <Button
                    variant={editMode === "add" ? "default" : "secondary"}
                    onClick={() => handleEdit("add")}
                  >
                    ADD NEW RECORD
                  </Button>
                  <Button
                    variant={editMode === "update" ? "default" : "secondary"}
                    onClick={() => handleEdit("update")}
                    disabled={!selectedRecord}
                  >
                    UPDATE RECORD
                  </Button>
                  <Button variant="destructive" disabled={!selectedRecord}>
                    DELETE RECORD
                  </Button>
                </div>
                {/* Edit Form */}
                {editMode !== "none" ? (
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Vehicle Information */}
                      <div className="flex flex-col gap-2">
                        <Label>Plate No. *</Label>
                        <Input value={editFields.plateNumber || ""} required />
                        <Label>Vehicle Type</Label>
                        <Input value={editFields.vehicleType || ""} />
                        <Label>Transport Group</Label>
                        <Input value={editFields.transportGroup || ""} />
                      </div>
                      {/* Operator Information */}
                      <div className="flex flex-col gap-2">
                        <Label>Operator / Company Name *</Label>
                        <Input value={editFields.operatorName || ""} required />
                        <Label>Operator Address *</Label>
                        <Input
                          value={editFields.operatorAddress || ""}
                          required
                        />
                        <Label>Owner Name</Label>
                        <Input value={editFields.ownerName || ""} />
                        <Label>First Name</Label>
                        <Input value={editFields.firstName || ""} />
                        <Label>M.I/Middle Name</Label>
                        <Input value={editFields.middleName || ""} />
                        <Label>Last Name</Label>
                        <Input value={editFields.lastName || ""} />
                      </div>
                      {/* Motor Information */}
                      <div className="flex flex-col gap-2">
                        <Label>Motor No.</Label>
                        <Input value={editFields.motorNo || ""} />
                        <Label>Motor Vehicle No.</Label>
                        <Input value={editFields.motorVehicleNo || ""} />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button type="submit">SAVE</Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setEditMode("none")}
                      >
                        CANCEL
                      </Button>
                    </div>
                    {/* Embedded Violation Management */}
                    <div className="flex gap-2 mt-4">
                      <Button variant="secondary">ADD VIOLATION</Button>
                      <Button variant="secondary">UPDATE VIOLATION</Button>
                      <Button variant="destructive">DELETE VIOLATION</Button>
                    </div>
                  </form>
                ) : selectedRecord ? (
                  <>
                    {/* Record Info Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col gap-2">
                        <Label>Plate Number</Label>
                        <Input
                          value={selectedRecord.plateNumber || ""}
                          readOnly
                          className="bg-muted"
                        />
                        <Label>Vehicle Type</Label>
                        <Input
                          value={selectedRecord.vehicleType || ""}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Operator Name</Label>
                        <Input
                          value={selectedRecord.operatorName || ""}
                          readOnly
                          className="bg-muted"
                        />
                        <Label>Operator Address</Label>
                        <Input
                          value={selectedRecord.operatorAddress || ""}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      <div className="flex flex-col gap-2 justify-end">
                        <Label>Record Status</Label>
                        <div
                          className={`rounded-md font-semibold text-center py-2 ${
                            selectedRecord.statusColor || "bg-muted"
                          }`}
                        >
                          {selectedRecord.status || "NEW"}
                        </div>
                        <Label>License Valid Until</Label>
                        <div className="rounded-md bg-muted text-foreground text-center py-2">
                          {selectedRecord.licenseValidUntil || "-"}
                        </div>
                      </div>
                    </div>
                    {/* Tabs for Violations and History */}
                    <Tabs
                      value={tab}
                      onValueChange={(value) =>
                        setTab(value as "violations" | "history")
                      }
                    >
                      <TabsList>
                        <TabsTrigger value="violations">VIOLATIONS</TabsTrigger>
                        <TabsTrigger value="history">
                          RECORD HISTORY
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="violations">
                        <div className="my-4">
                          <h3 className="font-semibold mb-2">
                            VIOLATIONS RECORD
                          </h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Operator Offense</TableHead>
                                <TableHead>Date of Apprehension</TableHead>
                                <TableHead>Place of Apprehension</TableHead>
                                <TableHead>Driver Name</TableHead>
                                <TableHead>Driver Offense</TableHead>
                                <TableHead>Paid Driver</TableHead>
                                <TableHead>Paid Operator</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {VIOLATIONS_SAMPLE.length === 0 ? (
                                <TableRow>
                                  <TableCell
                                    colSpan={7}
                                    className="text-center text-muted-foreground py-8"
                                  >
                                    No violations found.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                VIOLATIONS_SAMPLE.map((v, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>{v.offense}</TableCell>
                                    <TableCell>{v.date}</TableCell>
                                    <TableCell>{v.place}</TableCell>
                                    <TableCell>{v.driverName}</TableCell>
                                    <TableCell>{v.driverOffense}</TableCell>
                                    <TableCell>{v.paidDriver}</TableCell>
                                    <TableCell>{v.paidOperator}</TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>
                      <TabsContent value="history">
                        <div className="my-4">
                          <h3 className="font-semibold mb-2">RECORD HISTORY</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {HISTORY_SAMPLE.length === 0 ? (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    className="text-center text-muted-foreground py-8"
                                  >
                                    No record history found.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                HISTORY_SAMPLE.map((h, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>{h.type}</TableCell>
                                    <TableCell>{h.date}</TableCell>
                                    <TableCell>{h.details}</TableCell>
                                    <TableCell>{h.status}</TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-16">
                    Select a record to view details.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordsAndFile;
