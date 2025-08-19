import React, { useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Upload, Download, Trash2, FileText, Image, File, RefreshCw } from "lucide-react";

interface FileRecord {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: string;
    category: "registration" | "inspection" | "violation" | "other";
}

interface VehicleRecord {
    id: string;
    plateNumber: string;
}

interface FilesManagementComponentProps {
    files: FileRecord[];
    selectedRecord: VehicleRecord | null;
    isLoading: boolean;
    onFileUpload: (file: File, category: string) => void;
    onFileDelete: (fileId: string) => void;
    onFileDownload: (fileId: string) => void;
}

const FilesManagementComponent: React.FC<FilesManagementComponentProps> = ({
    files,
    selectedRecord,
    isLoading,
    onFileUpload,
    onFileDelete,
    onFileDownload,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith("image/")) return <Image className="h-4 w-4" />;
        return <File className="h-4 w-4" />;
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "registration": return "default";
            case "inspection": return "secondary";
            case "violation": return "destructive";
            case "other": return "outline";
            default: return "outline";
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && selectedRecord) {
            onFileUpload(file, "other"); // Default category, can be enhanced with a category selector
        }
        // Clear the input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    if (!selectedRecord) {
        return (
            <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">File Management</p>
                    <p>Select a vehicle record to manage files</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Files
                    </CardTitle>
                    <Badge variant="outline">{files.length} files</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                {/* Upload Section */}
                <div className="space-y-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                        variant="outline"
                        disabled={!selectedRecord}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                    </Button>
                </div>

                {/* Files List */}
                <div className="flex-1 min-h-0">
                    <div className="h-full overflow-auto space-y-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                Loading files...
                            </div>
                        ) : files.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No files uploaded</p>
                                <p className="text-sm">Upload documents related to this vehicle</p>
                            </div>
                        ) : (
                            files.map((file) => (
                                <div
                                    key={file.id}
                                    className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getFileIcon(file.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate" title={file.name}>
                                                {file.name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant={getCategoryColor(file.category)} className="text-xs">
                                                    {file.category}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatFileSize(file.size)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(file.uploadDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onFileDownload(file.id)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Download className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onFileDelete(file.id)}
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default FilesManagementComponent;
