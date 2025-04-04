
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";

interface ExportToSheetProps {
  onExport: () => void;
}

export function ExportToSheet({ onExport }: ExportToSheetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>
          Download emission test data as spreadsheet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm">
              Export emission test records for the selected time period for offline analysis and reporting.
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onExport} className="w-full">
          Export to Spreadsheet
        </Button>
      </CardFooter>
    </Card>
  );
}
