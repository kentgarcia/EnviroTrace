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

    // Helper to parse background color from style string
    const parseBackgroundColor = (styleStr: string): string | undefined => {
      const match = styleStr.match(/background-color:\s*#([0-9a-fA-F]{6})/);
      return match ? match[1] : undefined;
    };

    // Helper to check if text should be bold from style
    const isBold = (styleStr: string): boolean => {
      return styleStr.includes("font-weight: bold");
    };

    // Helper to get text color
    const getTextColor = (styleStr: string): string | undefined => {
      const match = styleStr.match(/color:\s*#([0-9a-fA-F]{6})/);
      return match ? match[1] : undefined;
    };

    // Process table element
    const processTable = (table: HTMLTableElement) => {
      try {
        const rows: TableRow[] = [];

        // Process thead
        const thead = table.querySelector("thead");
        if (thead) {
          thead.querySelectorAll("tr").forEach((tr, trIndex) => {
            const cells: TableCell[] = [];
            tr.querySelectorAll("th, td").forEach((cell) => {
              const cellElement = cell as HTMLElement;
              const styleAttr = cellElement.getAttribute("style") || "";
              // Parse background color, ensure it's a valid 6-digit hex
              let bgColor = parseBackgroundColor(styleAttr);

              // If no background color found, use a default dark color
              if (!bgColor) {
                bgColor = "1e3a8a"; // Default blue for headers
              }

              cells.push(
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cellElement.textContent?.trim() || "",
                          bold: true,
                          color: "FFFFFF", // White text
                          size: 22,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  shading: {
                    fill: bgColor,
                    color: "auto",
                  },
                })
              );
            });
            if (cells.length > 0) {
              rows.push(
                new TableRow({
                  children: cells,
                  tableHeader: true,
                  cantSplit: true, // Prevent row from splitting across pages
                })
              );
            }
          });
        }

        // Process tbody
        const tbody = table.querySelector("tbody");
        if (tbody) {
          tbody.querySelectorAll("tr").forEach((tr) => {
            const cells: TableCell[] = [];
            tr.querySelectorAll("td").forEach((cell) => {
              const cellElement = cell as HTMLElement;
              const styleAttr = cellElement.getAttribute("style") || "";
              const bgColor = parseBackgroundColor(styleAttr);
              const textColor = getTextColor(styleAttr) || "000000";
              const bold = isBold(styleAttr);
              const isCenter = styleAttr.includes("text-align: center");

              cells.push(
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cellElement.textContent?.trim() || "",
                          bold: bold,
                          color: textColor,
                          size: 20,
                        }),
                      ],
                      alignment: isCenter
                        ? AlignmentType.CENTER
                        : AlignmentType.LEFT,
                    }),
                  ],
                  shading: bgColor
                    ? {
                        fill: bgColor,
                        color: "auto",
                      }
                    : undefined,
                })
              );
            });
            if (cells.length > 0) {
              rows.push(
                new TableRow({
                  children: cells,
                  cantSplit: true, // Prevent row from splitting across pages
                })
              );
            }
          });
        }

        // Only create table if we have rows
        if (rows.length === 0) {
          console.warn("Table has no rows, skipping");
          return null;
        }

        console.log(`Creating table with ${rows.length} rows`);

        return new Table({
          rows,
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

    // Process all body children
    doc.body.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();

        switch (tagName) {
          case "div":
            // Process children of div
            element.childNodes.forEach((child) => {
              if (child.nodeType === Node.ELEMENT_NODE) {
                const childEl = child as HTMLElement;
                if (childEl.tagName.toLowerCase() === "h1") {
                  elements.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: childEl.textContent || "",
                          bold: true,
                          size: 56,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 400, after: 200 },
                    })
                  );
                } else if (childEl.tagName.toLowerCase() === "p") {
                  elements.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: childEl.textContent || "",
                          size: 24,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 100 },
                    })
                  );
                }
              }
            });
            break;

          case "h1":
            elements.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: element.textContent || "",
                    bold: true,
                    size: 48,
                  }),
                ],
                spacing: { before: 400, after: 200 },
              })
            );
            break;

          case "h2":
            elements.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: element.textContent || "",
                    bold: true,
                    size: 36,
                  }),
                ],
                spacing: { before: 300, after: 150 },
              })
            );
            break;

          case "p":
            const children: TextRun[] = [];
            element.childNodes.forEach((child) => {
              if (child.nodeType === Node.TEXT_NODE) {
                const text = child.textContent?.trim();
                if (text) {
                  children.push(new TextRun({ text, size: 24 }));
                }
              } else if (child.nodeType === Node.ELEMENT_NODE) {
                const childEl = child as HTMLElement;
                if (childEl.tagName === "STRONG" || childEl.tagName === "B") {
                  children.push(
                    new TextRun({
                      text: childEl.textContent || "",
                      bold: true,
                      size: 24,
                    })
                  );
                } else if (
                  childEl.tagName === "EM" ||
                  childEl.tagName === "I"
                ) {
                  children.push(
                    new TextRun({
                      text: childEl.textContent || "",
                      italics: true,
                      size: 24,
                    })
                  );
                } else {
                  children.push(
                    new TextRun({ text: childEl.textContent || "", size: 24 })
                  );
                }
              }
            });

            if (children.length > 0 || element.textContent?.trim()) {
              elements.push(
                new Paragraph({
                  children:
                    children.length > 0
                      ? children
                      : [
                          new TextRun({
                            text: element.textContent || "",
                            size: 24,
                          }),
                        ],
                  spacing: { after: 120 },
                })
              );
            }
            break;

          case "hr":
            elements.push(
              new Paragraph({
                children: [new TextRun({ text: "" })],
                border: {
                  bottom: {
                    color: "CCCCCC",
                    space: 1,
                    style: "single",
                    size: 6,
                  },
                },
                spacing: { before: 200, after: 200 },
              })
            );
            break;

          case "table":
            const tableElement = processTable(element as HTMLTableElement);
            if (tableElement) {
              elements.push(tableElement);
              elements.push(
                new Paragraph({
                  children: [new TextRun({ text: "" })],
                  spacing: { after: 200 },
                })
              );
            }
            break;
        }
      }
    });

    console.log(`Processed ${elements.length} elements for Word export`);

    // Create Word document
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
