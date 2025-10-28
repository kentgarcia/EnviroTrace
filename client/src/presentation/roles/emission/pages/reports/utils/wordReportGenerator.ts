import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableCell,
  TableRow,
  WidthType,
  BorderStyle,
  PageBreak,
} from "docx";
import { saveAs } from "file-saver";
import type { Office, Vehicle } from "@/core/api/emission-service";

interface ReportConfig {
  year: number;
  quarter: string;
  office: string;
  sections: string[];
  offices: Office[];
  vehicles: Vehicle[];
}

export const generateWordReport = async (config: ReportConfig) => {
  const { year, quarter, office, sections, offices, vehicles } = config;

  // Filter vehicles by office if needed
  const filteredVehicles =
    office === "all"
      ? vehicles
      : vehicles.filter((v) => v.office_id === office);

  const selectedOffice = offices.find((o) => o.id === office);

  const documentSections: any[] = [];

  // Title Page
  documentSections.push(
    new Paragraph({
      text: "GOVERNMENT EMISSION TESTING REPORT",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: {
        before: 400,
        after: 200,
      },
    }),
    new Paragraph({
      text: `Year: ${year}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `Quarter: ${quarter === "all" ? "All Quarters" : quarter}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `Office: ${
        office === "all"
          ? "All Government Offices"
          : selectedOffice?.name || "N/A"
      }`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `Generated: ${new Date().toLocaleDateString()}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: "",
      pageBreakBefore: true,
    })
  );

  // Executive Summary
  if (sections.includes("summary")) {
    documentSections.push(
      new Paragraph({
        text: "Executive Summary",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      }),
      new Paragraph({
        text: "Overview",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 80 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `This report provides a comprehensive overview of government vehicle emission testing activities for the year ${year}. `,
          }),
          new TextRun({
            text: `Total vehicles registered: ${filteredVehicles.length}`,
            bold: true,
          }),
        ],
        spacing: { after: 80 },
      }),
      new Paragraph({
        text: `The data includes ${offices.length} government offices and departments, covering various vehicle types including sedans, SUVs, vans, and motorcycles.`,
        spacing: { after: 120 },
      })
    );

    // Compliance Summary
    const testedVehicles = filteredVehicles.filter(
      (v) => v.latest_test_result !== null
    );
    const passedVehicles = filteredVehicles.filter(
      (v) => v.latest_test_result === true
    );
    const complianceRate =
      testedVehicles.length > 0
        ? ((passedVehicles.length / testedVehicles.length) * 100).toFixed(1)
        : "0.0";

    documentSections.push(
      new Paragraph({
        text: "Compliance Summary",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 80 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Total Vehicles: ", bold: true }),
          new TextRun({ text: `${filteredVehicles.length}\n` }),
          new TextRun({ text: "Tested Vehicles: ", bold: true }),
          new TextRun({ text: `${testedVehicles.length}\n` }),
          new TextRun({ text: "Passed Tests: ", bold: true }),
          new TextRun({ text: `${passedVehicles.length}\n` }),
          new TextRun({ text: "Compliance Rate: ", bold: true }),
          new TextRun({ text: `${complianceRate}%\n` }),
        ],
        spacing: { after: 240 },
      })
    );
  }

  // Vehicle Registry
  if (sections.includes("vehicles")) {
    documentSections.push(
      new Paragraph({
        text: "Vehicle Registry",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        spacing: { after: 120 },
      }),
      new Paragraph({
        text: `Complete listing of all ${filteredVehicles.length} registered government vehicles.`,
        spacing: { after: 120 },
      })
    );

    // Create vehicle table
    const vehicleTableRows = [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Plate Number", bold: true })],
              }),
            ],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Driver", bold: true })],
              }),
            ],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Office", bold: true })],
              }),
            ],
            width: { size: 25, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Type", bold: true })],
              }),
            ],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Engine", bold: true })],
              }),
            ],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Status", bold: true })],
              }),
            ],
            width: { size: 10, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    ];

    filteredVehicles.forEach((vehicle) => {
      const status =
        vehicle.latest_test_result === null
          ? "Not Tested"
          : vehicle.latest_test_result
          ? "Passed"
          : "Failed";

      vehicleTableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: vehicle.plate_number })],
            }),
            new TableCell({
              children: [new Paragraph({ text: vehicle.driver_name })],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: vehicle.office?.name || "N/A",
                }),
              ],
            }),
            new TableCell({
              children: [new Paragraph({ text: vehicle.vehicle_type })],
            }),
            new TableCell({
              children: [new Paragraph({ text: vehicle.engine_type })],
            }),
            new TableCell({
              children: [new Paragraph({ text: status })],
            }),
          ],
        })
      );
    });

    documentSections.push(
      new Table({
        rows: vehicleTableRows,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
      })
    );
  }

  // Testing Results
  if (sections.includes("testing")) {
    const testedVehicles = filteredVehicles.filter(
      (v) => v.latest_test_result !== null
    );

    documentSections.push(
      new Paragraph({
        text: "Testing Results",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        spacing: { after: 120 },
      }),
      new Paragraph({
        text: `Detailed emission testing results for ${
          quarter === "all" ? "all quarters" : quarter
        } of ${year}.`,
        spacing: { after: 120 },
      })
    );

    if (testedVehicles.length > 0) {
      const testTableRows = [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Plate Number", bold: true })],
                }),
              ],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Vehicle Type", bold: true })],
                }),
              ],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Test Date", bold: true })],
                }),
              ],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Result", bold: true })],
                }),
              ],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Office", bold: true })],
                }),
              ],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      ];

      testedVehicles.forEach((vehicle) => {
        testTableRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: vehicle.plate_number })],
              }),
              new TableCell({
                children: [new Paragraph({ text: vehicle.vehicle_type })],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    text: vehicle.latest_test_date
                      ? new Date(vehicle.latest_test_date).toLocaleDateString()
                      : "N/A",
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: vehicle.latest_test_result ? "PASSED" : "FAILED",
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ text: vehicle.office?.name || "N/A" }),
                ],
              }),
            ],
          })
        );
      });

      documentSections.push(
        new Table({
          rows: testTableRows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
        })
      );
    } else {
      documentSections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "No testing data available for the selected period.",
              italics: true,
            }),
          ],
          spacing: { after: 120 },
        })
      );
    }
  }

  // Office Compliance
  if (sections.includes("offices")) {
    documentSections.push(
      new Paragraph({
        text: "Office Compliance Summary",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        spacing: { after: 120 },
      }),
      new Paragraph({
        text: "Compliance rates by government office/department.",
        spacing: { after: 120 },
      })
    );

    // Group vehicles by office
    const officeStats = offices.map((office) => {
      const officeVehicles = vehicles.filter((v) => v.office_id === office.id);
      const tested = officeVehicles.filter(
        (v) => v.latest_test_result !== null
      );
      const passed = officeVehicles.filter(
        (v) => v.latest_test_result === true
      );
      const rate =
        tested.length > 0
          ? ((passed.length / tested.length) * 100).toFixed(1)
          : "0.0";

      return {
        office,
        total: officeVehicles.length,
        tested: tested.length,
        passed: passed.length,
        rate,
      };
    });

    const officeTableRows = [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Office", bold: true })],
              }),
            ],
            width: { size: 40, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Total Vehicles", bold: true })],
              }),
            ],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Tested", bold: true })],
              }),
            ],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Passed", bold: true })],
              }),
            ],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Compliance", bold: true })],
              }),
            ],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    ];

    officeStats.forEach((stat) => {
      officeTableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: stat.office.name })],
            }),
            new TableCell({
              children: [new Paragraph({ text: stat.total.toString() })],
            }),
            new TableCell({
              children: [new Paragraph({ text: stat.tested.toString() })],
            }),
            new TableCell({
              children: [new Paragraph({ text: stat.passed.toString() })],
            }),
            new TableCell({
              children: [new Paragraph({ text: `${stat.rate}%` })],
            }),
          ],
        })
      );
    });

    documentSections.push(
      new Table({
        rows: officeTableRows,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
      })
    );
  }

  // Recommendations
  if (sections.includes("recommendations")) {
    documentSections.push(
      new Paragraph({
        text: "Recommendations",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        spacing: { after: 120 },
      }),
      new Paragraph({
        text: "Based on the analysis of emission testing data, the following recommendations are proposed:",
        spacing: { after: 120 },
      }),
      new Paragraph({
        text: "1. Increase Testing Frequency",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 80 },
      }),
      new Paragraph({
        text: "Implement more frequent emission testing schedules, particularly for older vehicles and those that have previously failed tests.",
        spacing: { after: 120 },
      }),
      new Paragraph({
        text: "2. Maintenance Programs",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 80 },
      }),
      new Paragraph({
        text: "Establish regular maintenance programs for all government vehicles to ensure optimal performance and reduce emissions.",
        spacing: { after: 120 },
      }),
      new Paragraph({
        text: "3. Fleet Modernization",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 80 },
      }),
      new Paragraph({
        text: "Consider phasing out older vehicles with consistently high emissions and replacing them with newer, more environmentally friendly alternatives.",
        spacing: { after: 120 },
      }),
      new Paragraph({
        text: "4. Training and Awareness",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 120, after: 80 },
      }),
      new Paragraph({
        text: "Provide training to drivers on eco-friendly driving practices and the importance of regular vehicle maintenance.",
        spacing: { after: 240 },
      })
    );
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: documentSections,
      },
    ],
  });

  // Generate and download
  const blob = await Packer.toBlob(doc);
  const fileName = `Emission_Report_${year}_${quarter}_${Date.now()}.docx`;
  saveAs(blob, fileName);
};
