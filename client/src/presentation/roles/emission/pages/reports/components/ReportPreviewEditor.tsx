import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Button } from "@/presentation/components/shared/ui/button";
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Undo,
    Redo,
    Download,
    X,
    FileText,
    FileSpreadsheet,
    Printer,
} from "lucide-react";
import { toast } from "sonner";
import "./editor.css";

interface ReportPreviewEditorProps {
    content: string;
    onClose: () => void;
    onExport: (format: "word" | "excel", content: string) => void;
    reportFormat: "word" | "excel";
}

export const ReportPreviewEditor: React.FC<ReportPreviewEditorProps> = ({
    content,
    onClose,
    onExport,
    reportFormat,
}) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableCell,
            TableHeader,
        ],
        content,
        editorProps: {
            attributes: {
                class:
                    "prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[500px] px-8 py-6",
            },
        },
    });

    const handleExport = () => {
        if (!editor) return;
        const htmlContent = editor.getHTML();
        onExport(reportFormat, htmlContent);
    };

    const handlePrint = () => {
        if (!editor) return;

        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Please allow popups to print the report');
            return;
        }

        const htmlContent = editor.getHTML();

        // Create a complete HTML document with styles for printing
        const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Emission Report - Print</title>
          <style>
            @media print {
              @page {
                margin: 1in;
                size: letter;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              line-height: 1.6;
              color: #000;
              max-width: 100%;
              margin: 0 auto;
              padding: 20px;
            }
            h1 {
              font-size: 28px;
              font-weight: bold;
              margin: 30px 0 20px 0;
              text-align: center;
            }
            h2 {
              font-size: 20px;
              font-weight: 600;
              margin: 20px 0 10px 0;
            }
            p {
              margin: 10px 0;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 12px;
              page-break-inside: auto;
            }
            table thead {
              display: table-header-group;
            }
            table tbody {
              display: table-row-group;
            }
            table tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            table th {
              background-color: #333 !important;
              color: white !important;
              padding: 12px 8px;
              border: 1px solid #ddd;
              text-align: center;
              font-weight: bold;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            table td {
              padding: 10px 8px;
              border: 1px solid #ddd;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            hr {
              border: none;
              border-bottom: 1px solid #ccc;
              margin: 40px 0;
            }
            /* Preserve background colors for test results */
            [style*="background-color: #10b981"] {
              background-color: #10b981 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            [style*="background-color: #ef4444"] {
              background-color: #ef4444 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            [style*="background-color: #f3f4f6"] {
              background-color: #f3f4f6 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Report Preview & Editor</h2>
                        <p className="text-sm text-gray-600">Edit the content before exporting</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 px-6 py-3 border-b bg-gray-50">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={editor.isActive("bold") ? "bg-gray-200" : ""}
                    >
                        <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={editor.isActive("italic") ? "bg-gray-200" : ""}
                    >
                        <Italic className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-300 mx-2" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={editor.isActive("heading", { level: 1 }) ? "bg-gray-200" : ""}
                    >
                        <Heading1 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""}
                    >
                        <Heading2 className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-300 mx-2" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editor.isActive("bulletList") ? "bg-gray-200" : ""}
                    >
                        <List className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={editor.isActive("orderedList") ? "bg-gray-200" : ""}
                    >
                        <ListOrdered className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-300 mx-2" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                    >
                        <Undo className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                    >
                        <Redo className="w-4 h-4" />
                    </Button>
                </div>

                {/* Editor Content */}
                <div className="flex-1 overflow-y-auto bg-white">
                    <div className="max-w-5xl mx-auto py-8">
                        <EditorContent editor={editor} />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                    <div className="text-sm text-gray-600">
                        <p>💡 Tip: You can edit the content directly in the preview</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Future: Letterhead and footer will be added here
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button variant="outline" onClick={handlePrint} className="gap-2">
                            <Printer className="w-4 h-4" />
                            Print
                        </Button>
                        <Button onClick={handleExport} className="gap-2">
                            {reportFormat === "word" ? (
                                <>
                                    <FileText className="w-4 h-4" />
                                    Export as Word
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet className="w-4 h-4" />
                                    Export as Excel
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
