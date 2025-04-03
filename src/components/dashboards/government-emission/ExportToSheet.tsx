
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileSpreadsheet, Loader2 } from "lucide-react";

interface ExportToSheetProps {
  year: number;
  quarter?: number;
  type: "vehicles" | "tests" | "compliance";
}

export function ExportToSheet({ year, quarter, type }: ExportToSheetProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  const exportData = async () => {
    setIsExporting(true);
    try {
      let data = [];
      
      if (type === "vehicles") {
        // Export vehicles data
        const { data: vehiclesData, error } = await supabase
          .from("vehicles")
          .select("*")
          .order("plate_number");
          
        if (error) throw error;
        data = vehiclesData;
      } else if (type === "tests") {
        // Export tests data with vehicle info
        let query = supabase
          .from("emission_tests")
          .select(`
            *,
            vehicle:vehicles(*)
          `)
          .eq("year", year)
          .order("test_date", { ascending: false });
          
        if (quarter) {
          query = query.eq("quarter", quarter);
        }
        
        const { data: testsData, error } = await query;
        if (error) throw error;
        
        // Flatten the data for CSV export
        data = testsData.map((test: any) => ({
          id: test.id,
          test_date: test.test_date,
          year: test.year,
          quarter: test.quarter,
          result: test.result ? "Pass" : "Fail",
          plate_number: test.vehicle?.plate_number,
          office_name: test.vehicle?.office_name,
          driver_name: test.vehicle?.driver_name,
          vehicle_type: test.vehicle?.vehicle_type,
          engine_type: test.vehicle?.engine_type,
          wheels: test.vehicle?.wheels
        }));
      } else if (type === "compliance") {
        // Export compliance by office
        const { data: complianceData, error } = await supabase
          .from("vehicles")
          .select(`
            office_name,
            emission_tests!inner(result, year${quarter ? ", quarter" : ""})
          `)
          .eq("emission_tests.year", year)
          .order("office_name");
          
        if (quarter && quarter > 0) {
          // Further filter by quarter if specified
          complianceData?.forEach((item: any) => {
            item.emission_tests = item.emission_tests.filter(
              (test: any) => test.quarter === quarter
            );
          });
        }
          
        if (error) throw error;
        
        // Process data to get compliance rates by office
        const officeMap = new Map<string, { pass: number, fail: number, total: number }>();
        
        complianceData.forEach((item: any) => {
          const officeName = item.office_name;
          
          if (!officeMap.has(officeName)) {
            officeMap.set(officeName, { pass: 0, fail: 0, total: 0 });
          }
          
          item.emission_tests.forEach((test: any) => {
            const stats = officeMap.get(officeName)!;
            if (test.result) {
              stats.pass += 1;
            } else {
              stats.fail += 1;
            }
            stats.total += 1;
          });
        });
        
        data = Array.from(officeMap.entries()).map(([name, stats]) => ({
          office_name: name,
          passed_tests: stats.pass,
          failed_tests: stats.fail,
          total_tests: stats.total,
          compliance_rate: stats.total > 0 ? Math.round((stats.pass / stats.total) * 100) : 0
        }));
      }
      
      // Convert data to CSV
      if (data.length === 0) {
        toast.error("No data to export");
        return;
      }
      
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(","),
        ...data.map((row: any) => 
          headers.map(header => {
            const value = row[header];
            // Handle values that need to be quoted (contain commas, quotes, or newlines)
            if (value === null || value === undefined) return '';
            const cellValue = String(value);
            if (cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n')) {
              return `"${cellValue.replace(/"/g, '""')}"`;
            }
            return cellValue;
          }).join(",")
        )
      ].join("\n");
      
      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      
      // Set file name based on type and filters
      const quarterText = quarter ? `_Q${quarter}` : "";
      link.setAttribute(
        "download", 
        `emission_${type}_${year}${quarterText}_${new Date().toISOString().slice(0,10)}.csv`
      );
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} data exported successfully`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={exportData}
      disabled={isExporting}
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileSpreadsheet className="mr-2 h-4 w-4" />
      )}
      Export to CSV
    </Button>
  );
}
