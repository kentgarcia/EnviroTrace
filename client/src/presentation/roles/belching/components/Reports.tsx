import React from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/shared/ui/select";
import { DatePicker } from "@/presentation/components/shared/ui/date-picker";

const Reports = () => {
  const [reportType, setReportType] = React.useState<string>("");
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();

  const handleGenerateReport = () => {
    // TODO: Implement report generation
  };

  const handleExportReport = (format: "pdf" | "excel" | "csv") => {
    // TODO: Implement report export
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inspection">Inspection Reports</SelectItem>
                  <SelectItem value="violations">Violation Reports</SelectItem>
                  <SelectItem value="fees">Fee Collection Reports</SelectItem>
                  <SelectItem value="compliance">Compliance Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex space-x-2">
                <DatePicker
                  selected={startDate}
                  onSelect={setStartDate}
                  placeholderText="Start Date"
                />
                <DatePicker
                  selected={endDate}
                  onSelect={setEndDate}
                  placeholderText="End Date"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <Button onClick={handleGenerateReport}>Generate Report</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => handleExportReport("pdf")}>
              Export as PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportReport("excel")}
            >
              Export as Excel
            </Button>
            <Button variant="outline" onClick={() => handleExportReport("csv")}>
              Export as CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* TODO: Add recent reports list */}
            <p className="text-sm text-gray-500">No recent reports generated</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
