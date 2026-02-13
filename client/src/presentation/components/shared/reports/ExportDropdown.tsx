import React, { useCallback, useMemo, useState } from "react";
import { ChevronDown, FileSpreadsheet, FileText } from "lucide-react";
import {
  ExportAsCsv,
  ExportAsExcel,
  ExportAsPdf,
} from "@siamf/react-export";
import { Button } from "@/presentation/components/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/presentation/components/shared/ui/dropdown-menu";
import { toast } from "sonner";

export interface ExportDropdownProps {
  data: Array<Array<string | number | boolean | null>>;
  headers: string[];
  fileName: string;
  title?: string;
  disabled?: boolean;
  disablePdf?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  data,
  headers,
  fileName,
  title,
  disabled,
  disablePdf,
  onError,
  onSuccess,
}) => {
  const isDisabled = disabled || data.length === 0;
  const isTauri = useMemo(
    () => typeof window !== "undefined" && "__TAURI__" in window,
    []
  );
  const [downloadFolder, setDownloadFolder] = useState<string | null>(null);
  const [showOpenFolder, setShowOpenFolder] = useState(false);

  const handleExportSuccess = useCallback(async () => {
    onSuccess?.();
    if (!isTauri) return;

    try {
      const { downloadDir } = await import("@tauri-apps/api/path");
      const dir = await downloadDir();
      setDownloadFolder(dir);
      setShowOpenFolder(true);
      toast.success("Report exported", {
        duration: 8000,
        description: dir,
        action: {
          label: "Open folder",
          onClick: () => handleOpenFolder(),
        },
      });
    } catch (error) {
      onError?.(error as Error);
    }
  }, [isTauri, onError, onSuccess]);

  const handleOpenFolder = useCallback(async () => {
    if (!downloadFolder) return;
    try {
      const { openPath } = await import("@tauri-apps/plugin-opener");
      await openPath(downloadFolder);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [downloadFolder, onError]);

  return (
    <div className="flex flex-col items-start gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2" disabled={isDisabled}>
            Export
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!disablePdf && (
            <ExportAsPdf
              data={data}
              headers={headers}
              title={title}
              fileName={fileName}
              orientation="landscape"
              headerStyles={{ fillColor: "#0033a0", textColor: "#ffffff" }}
              margin={{ top: 12, right: 10, bottom: 10, left: 10 }}
              onError={onError}
              onSuccess={handleExportSuccess}
            >
              {(props) => (
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    props.onClick?.();
                  }}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Export PDF
                </DropdownMenuItem>
              )}
            </ExportAsPdf>
          )}
          <ExportAsCsv
            data={data}
            fileName={fileName}
            onError={onError}
            onSuccess={handleExportSuccess}
          >
            {(props) => (
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  props.onClick?.();
                }}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Export CSV
              </DropdownMenuItem>
            )}
          </ExportAsCsv>
          <ExportAsExcel
            data={data}
            headers={headers}
            fileName={fileName}
            onError={onError}
            onSuccess={handleExportSuccess}
          >
            {(props) => (
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  props.onClick?.();
                }}
                className="gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export Excel
              </DropdownMenuItem>
            )}
          </ExportAsExcel>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
