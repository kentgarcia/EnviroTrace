import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/shared/ui/select";
import { Button } from "@/presentation/components/shared/ui/button";
import { RefreshCw } from "lucide-react";

const SelectionBar = ({
  selectedYear,
  setSelectedYear,
  selectedQuarter,
  setSelectedQuarter,
  availableYears,
  handleRefresh,
  isRefreshing,
  loading,
}: any) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2 pb-6">
    <div className="flex flex-wrap gap-3 items-center">
      <Select
        value={selectedYear.toString()}
        onValueChange={(value) => setSelectedYear(Number(value))}
      >
        <SelectTrigger className="w-[120px] bg-white border-green-300 shadow-sm text-green-900 font-semibold">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {availableYears.map((year: number) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={selectedQuarter ? selectedQuarter.toString() : "all"}
        onValueChange={(value) =>
          setSelectedQuarter(value === "all" ? undefined : Number(value))
        }
      >
        <SelectTrigger className="w-[140px] bg-white border-green-300 shadow-sm text-green-900 font-semibold">
          <SelectValue placeholder="Quarter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Quarters</SelectItem>
          <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
          <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
          <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
          <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        onClick={handleRefresh}
        disabled={isRefreshing || loading}
        className="border-green-300 text-green-900 font-semibold hover:bg-green-100 transition"
      >
        <RefreshCw
          className={`h-4 w-4 mr-2 ${
            isRefreshing || loading ? "animate-spin" : ""
          }`}
        />
        Refresh
      </Button>
    </div>
  </div>
);

export default SelectionBar;
