import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  PageOrientation,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";

/**
 * Converts HTML content to a Word document with proper table support
 */
export const exportHTMLToWord = async (html: string, fileName: string) => {
  try {
    console.log("Starting Word export...");

    // Parse HTML and convert to docx elements
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const elements: any[] = [];

    // Helper to parse background color from class or style
    const getBackgroundColor = (element: HTMLElement): string | undefined => {
      const styleAttr = element.getAttribute("style") || "";
      const classAttr = element.getAttribute("class") || "";
      
      // Parse from style attribute
      const match = styleAttr.match(/background-color:\s*#([0-9a-fA-F]{6})/);
      if (match) return match[1];
      
      // Parse from class
      if (classAttr.includes("table-header")) return "0033A0";
      if (classAttr.includes("row-number")) return "FFFFFF";
      if (classAttr.includes("data-cell")) return "E3F2FD";
      
      return undefined;
    };

    // Helper to get text color
    const getTextColor = (element: HTMLElement): string => {
      const styleAttr = element.getAttribute("style") || "";
      const classAttr = element.getAttribute("class") || "";
      
      // Parse from style
      const match = styleAttr.match(/color:\s*#([0-9a-fA-F]{6})/);
      if (match) return match[1];
      
      // Parse from class
      if (classAttr.includes("table-header")) return "FFFFFF";
      if (classAttr.includes("test-passed")) return "15803d";
      if (classAttr.includes("test-failed")) return "b91c1c";
      if (classAttr.includes("test-not-tested")) return "64748b";
      
      return "000000";
    };

    // Helper to check if bold
    const isBold = (element: HTMLElement): boolean => {
      const styleAttr = element.getAttribute("style") || "";
      const classAttr = element.getAttribute("class") || "";
      return styleAttr.includes("font-weight: bold") || 
             styleAttr.includes("font-weight:bold") ||
             classAttr.includes("table-header") ||
             classAttr.includes("row-number") ||
             element.tagName === "TH";
    };

    // Helper to get alignment
    const getAlignment = (element: HTMLElement): typeof AlignmentType[keyof typeof AlignmentType] => {
      const styleAttr = element.getAttribute("style") || "";
      const classAttr = element.getAttribute("class") || "";
      
      if (styleAttr.includes("text-align: center") || 
          styleAttr.includes("text-align:center") ||
          classAttr.includes("data-cell-center") ||
          classAttr.includes("row-number") ||
          element.tagName === "TH") {
        return AlignmentType.CENTER;
      }
      
      return AlignmentType.LEFT;
    };

    // Process table element
    const processTable = (table: HTMLTableElement) => {
      try {
        const allRows: TableRow[] = [];
        const thead = table.querySelector("thead");
        const tbody = table.querySelector("tbody");

        // Process header rows
        if (thead) {
          thead.querySelectorAll("tr").forEach((tr) => {
            const cells: TableCell[] = [];
            tr.querySelectorAll("th, td").forEach((cell) => {
              const cellElement = cell as HTMLElement;
              const textColor = getTextColor(cellElement);
              const bold = true; // Headers are always bold
              const bgColor = getBackgroundColor(cellElement) || "0033A0";

              cells.push(
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cellElement.textContent?.trim() || "",
                          bold: bold,
                          color: textColor,
                          size: 18,
                          font: "Arial",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  shading: {
                    fill: bgColor,
                  },
                  margins: {
                    top: 100,
                    bottom: 100,
                    left: 80,
                    right: 80,
                  },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                    left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                    right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  },
                })
              );
            });
            if (cells.length > 0) {
              allRows.push(
                new TableRow({
                  children: cells,
                  cantSplit: true,
                })
              );
            }
          });
        }

        // Process tbody
        if (tbody) {
          tbody.querySelectorAll("tr").forEach((tr) => {
            const cells: TableCell[] = [];
            tr.querySelectorAll("td").forEach((cell, cellIndex) => {
              const cellElement = cell as HTMLElement;
              const textColor = getTextColor(cellElement);
              const bold = isBold(cellElement);
              const alignment = getAlignment(cellElement);
              
              // First column (NO) gets white background, others get light blue
              const bgColor = cellIndex === 0 ? "FFFFFF" : "E3F2FD";

              cells.push(
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cellElement.textContent?.trim() || "",
                          bold: bold,
                          color: textColor,
                          size: 18,
                          font: "Arial",
                        }),
                      ],
                      alignment: alignment,
                    }),
                  ],
                  shading: {
                    fill: bgColor,
                  },
                  margins: {
                    top: 80,
                    bottom: 80,
                    left: 60,
                    right: 60,
                  },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                    left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                    right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  },
                })
              );
            });
            if (cells.length > 0) {
              allRows.push(
                new TableRow({
                  children: cells,
                  cantSplit: true,
                })
              );
            }
          });
        }

        if (allRows.length === 0) {
          console.warn("Table has no rows, skipping");
          return null;
        }

        console.log(`Creating table with ${allRows.length} total rows`);

        return new Table({
          rows: allRows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
        });
      } catch (error) {
        console.error("Error processing table:", error);
        return null;
      }
    };

    // Process tables only
    doc.querySelectorAll("table").forEach((table) => {
      const tableElement = processTable(table as HTMLTableElement);
      if (tableElement) {
        elements.push(tableElement);
      }
    });

    console.log(`Processed ${elements.length} elements for Word export`);

    // Create Word document with landscape orientation
    const wordDoc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
              size: {
                orientation: PageOrientation.LANDSCAPE,
              },
            },
          },
          children: elements,
        },
      ],
    });

    console.log("Generating Word blob...");

    // Generate and download
    const blob = await Packer.toBlob(wordDoc);

    console.log("Saving Word file...");
    saveAs(blob, fileName);

    console.log("Word export completed successfully");
  } catch (error) {
    console.error("Error exporting to Word:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    throw new Error(
      `Failed to export document to Word format: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
