import type {
  Office,
  Vehicle,
  EmissionTest,
} from "@/core/api/emission-service";

interface ReportConfig {
  reportType: "vehicle-registry" | "testing-result" | "office-compliance";
  year: number;
  quarter?: string;
  offices: Office[];
  selectedOfficeIds: string[];
  vehicles: Vehicle[];
  emissionTests: EmissionTest[];
}

export const generateReportHTML = (config: ReportConfig): string => {
  const {
    reportType,
    year,
    quarter,
    offices,
    selectedOfficeIds,
    vehicles,
    emissionTests,
  } = config;

  // Generate report based on type
  switch (reportType) {
    case "vehicle-registry":
      return generateVehicleRegistryReport(year, vehicles);
    case "testing-result":
      return generateTestingResultReport(
        year,
        offices,
        selectedOfficeIds,
        vehicles,
        emissionTests
      );
    case "office-compliance":
      return generateOfficeComplianceReport(
        year,
        quarter || "Q1",
        offices,
        selectedOfficeIds,
        vehicles,
        emissionTests
      );
    default:
      return "<p>Unknown report type</p>";
  }
};

// Vehicle Registry Report - No status column
const generateVehicleRegistryReport = (
  year: number,
  vehicles: Vehicle[]
): string => {
  let html = `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px;">
      <thead>
        <tr style="background-color: #1e3a8a; color: white;">
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Plate Number</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Driver</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Contact</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Office</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Vehicle Type</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Engine Number</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Wheels</th>
        </tr>
      </thead>
      <tbody>
  `;

  vehicles.forEach((vehicle, index) => {
    const bgColor = index % 2 === 0 ? "#f9fafb" : "white";
    html += `
      <tr style="background-color: ${bgColor};">
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${
          vehicle.plate_number
        }</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${
          vehicle.driver_name || "N/A"
        }</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${
          vehicle.contact_number || "N/A"
        }</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${
          vehicle.office?.name || "N/A"
        }</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${
          vehicle.vehicle_type || "N/A"
        }</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${
          vehicle.engine_type || "N/A"
        }</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${
          vehicle.wheels || "N/A"
        }</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  return html;
};

// Testing Result Report - Quarterly tracking per office
const generateTestingResultReport = (
  year: number,
  offices: Office[],
  selectedOfficeIds: string[],
  vehicles: Vehicle[],
  emissionTests: EmissionTest[]
): string => {
  const quarters = ["Q1", "Q2", "Q3", "Q4"];

  // Helper function to get test result for a vehicle in a specific quarter
  const getQuarterTestResult = (
    vehicleId: string,
    quarter: string
  ): boolean | null => {
    const quarterNum = parseInt(quarter.replace("Q", ""));
    const test = emissionTests.find(
      (t) =>
        t.vehicle_id === vehicleId &&
        t.year === year &&
        t.quarter === quarterNum
    );
    return test ? test.result : null;
  };

  let html = ``;

  // Generate a table for each selected office
  selectedOfficeIds.forEach((officeId) => {
    const office = offices.find((o) => o.id === officeId);
    if (!office) return;

    const officeVehicles = vehicles.filter((v) => v.office_id === officeId);

    html += `
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px;">
        <thead>
          <tr style="background-color: #059669; color: white;">
            <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Plate Number</th>
            <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Driver</th>
            <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: center;">Q1</th>
            <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: center;">Q2</th>
            <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: center;">Q3</th>
            <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: center;">Q4</th>
          </tr>
        </thead>
        <tbody>
    `;

    officeVehicles.forEach((vehicle, index) => {
      const bgColor = index % 2 === 0 ? "#f9fafb" : "white";

      html += `
        <tr style="background-color: ${bgColor};">
          <td style="padding: 10px 8px; border: 1px solid #ddd;">${
            vehicle.plate_number
          }</td>
          <td style="padding: 10px 8px; border: 1px solid #ddd;">${
            vehicle.driver_name || "N/A"
          }</td>
      `;

      // For each quarter, get the actual test result from emission tests for the selected year
      quarters.forEach((quarter) => {
        const testResult = getQuarterTestResult(vehicle.id, quarter);

        let cellStyle: string;
        let cellText: string;

        if (testResult === true) {
          // Passed - green background
          cellStyle =
            "background-color: #10b981; color: white; text-align: center; font-weight: bold;";
          cellText = "PASSED";
        } else if (testResult === false) {
          // Failed - red background
          cellStyle =
            "background-color: #ef4444; color: white; text-align: center; font-weight: bold;";
          cellText = "FAILED";
        } else {
          // Not tested - light gray background
          cellStyle =
            "text-align: center; background-color: #f3f4f6; color: #9ca3af;";
          cellText = "-";
        }

        html += `
          <td style="padding: 10px 8px; border: 1px solid #ddd; ${cellStyle}">
            ${cellText}
          </td>
        `;
      });

      html += `
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;
  });

  return html;
};

// Office Compliance Report - Management KPIs per quarter
const generateOfficeComplianceReport = (
  year: number,
  quarter: string,
  offices: Office[],
  selectedOfficeIds: string[],
  vehicles: Vehicle[],
  emissionTests: EmissionTest[]
): string => {
  const quarterNum = parseInt(quarter.replace("Q", ""));

  let html = `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px;">
      <thead>
        <tr style="background-color: #7c3aed; color: white;">
          <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Office/Department</th>
          <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Total Vehicles</th>
          <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Tested</th>
          <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Passed</th>
          <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Compliance Rate</th>
        </tr>
      </thead>
      <tbody>
  `;

  let totalVehicles = 0;
  let totalTested = 0;
  let totalPassed = 0;

  selectedOfficeIds.forEach((officeId, index) => {
    const office = offices.find((o) => o.id === officeId);
    if (!office) return;

    const officeVehicles = vehicles.filter((v) => v.office_id === officeId);

    // Get test results for this office in the specific year and quarter
    const officeTests = emissionTests.filter(
      (t) =>
        t.year === year &&
        t.quarter === quarterNum &&
        officeVehicles.some((v) => v.id === t.vehicle_id)
    );

    const tested = officeTests.length;
    const passed = officeTests.filter((t) => t.result === true).length;
    const complianceRate =
      tested > 0 ? ((passed / tested) * 100).toFixed(1) : "0.0";

    totalVehicles += officeVehicles.length;
    totalTested += tested;
    totalPassed += passed;

    const bgColor = index % 2 === 0 ? "#f9fafb" : "white";
    const rateColor =
      parseFloat(complianceRate) >= 80
        ? "#10b981"
        : parseFloat(complianceRate) >= 50
        ? "#f59e0b"
        : "#ef4444";

    html += `
      <tr style="background-color: ${bgColor};">
        <td style="padding: 10px 12px; border: 1px solid #ddd;">${office.name}</td>
        <td style="padding: 10px 12px; border: 1px solid #ddd; text-align: center;">${officeVehicles.length}</td>
        <td style="padding: 10px 12px; border: 1px solid #ddd; text-align: center;">${tested}</td>
        <td style="padding: 10px 12px; border: 1px solid #ddd; text-align: center;">${passed}</td>
        <td style="padding: 10px 12px; border: 1px solid #ddd; text-align: center; color: ${rateColor}; font-weight: bold;">
          ${complianceRate}%
        </td>
      </tr>
    `;
  });

  // Total row
  const overallCompliance =
    totalTested > 0 ? ((totalPassed / totalTested) * 100).toFixed(1) : "0.0";
  html += `
      <tr style="background-color: #e5e7eb; font-weight: bold;">
        <td style="padding: 12px; border: 1px solid #ddd;">TOTAL</td>
        <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${totalVehicles}</td>
        <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${totalTested}</td>
        <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${totalPassed}</td>
        <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${overallCompliance}%</td>
      </tr>
    </tbody>
    </table>
  `;

  return html;
};

// Comprehensive Testing Report with CO/HC emission data
interface ComprehensiveReportData {
  vehicleId: string;
  driverName: string;
  office: string;
  identifier: string;
  category: string;
  description: string;
  yearAcquired: number | null;
  co: number | null;
  hc: number | null;
  opacimeter: number | null;
  testResult: "PASSED" | "FAILED" | "NOT TESTED";
  testDate: string | null;
  engineType: string;
}

interface ComprehensiveReportConfig {
  year?: number;
  quarter?: number;
  office?: string;
  status?: string;
  data: ComprehensiveReportData[];
}

export const generateComprehensiveTestingReportHTML = (
  config: ComprehensiveReportConfig
): string => {
  const { data } = config;

  let html = `
    <style>
      @page {
        size: landscape;
        margin: 0.5in;
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
      }
      .report-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 9px;
        font-family: Arial, sans-serif;
      }
      .table-header {
        background-color: #0033A0;
        color: #FFFFFF;
        font-weight: bold;
        text-transform: uppercase;
        font-size: 9px;
      }
      .table-header th {
        padding: 8px 6px;
        border: 1px solid #0033A0;
        text-align: center;
        background-color: #0033A0;
        color: #FFFFFF;
      }
      thead.table-header {
        display: table-header-group;
      }
      .row-number {
        background-color: #FFFFFF;
        text-align: center;
        font-weight: 600;
        color: #000000;
        padding: 6px 4px;
        border: 1px solid #CCCCCC;
      }
      .data-cell {
        background-color: #E3F2FD;
        padding: 6px 4px;
        border: 1px solid #BBDEFB;
      }
      .data-cell-left {
        text-align: left;
      }
      .data-cell-center {
        text-align: center;
      }
      .test-passed {
        color: #15803d;
        font-weight: bold;
      }
      .test-failed {
        color: #b91c1c;
        font-weight: bold;
      }
      .test-not-tested {
        color: #64748b;
      }
    </style>

    <table class="report-table">
      <thead class="table-header">
        <tr>
          <th style="width: 5%;">NO</th>
          <th style="width: 15%;">DRIVER'S NAME</th>
          <th style="width: 15%;">OFFICE</th>
          <th style="width: 10%;">PLATE NUMBER</th>
          <th style="width: 12%;">VEHICLE CATEGORY</th>
          <th style="width: 12%;">ENGINE TYPE</th>
          <th style="width: 15%;">VEHICLE DESCRIPTION</th>
          <th style="width: 8%;">YEAR ACQUIRED</th>
          <th style="width: 6%;">CO (%)</th>
          <th style="width: 6%;">HC (ppm)</th>
          <th style="width: 8%;">OPACIMETER (%)</th>
          <th style="width: 10%;">TEST RESULT</th>
          <th style="width: 8%;">TEST DATE</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach((row, index) => {
    const resultClass =
      row.testResult === "PASSED"
        ? "test-passed"
        : row.testResult === "FAILED"
        ? "test-failed"
        : "test-not-tested";

    html += `
      <tr>
        <td class="row-number">
          ${index + 1}
        </td>
        <td class="data-cell data-cell-left">${row.driverName}</td>
        <td class="data-cell data-cell-left">${row.office}</td>
        <td class="data-cell data-cell-center">${row.identifier}</td>
        <td class="data-cell data-cell-center">${row.category}</td>
        <td class="data-cell data-cell-center">${row.engineType || "-"}</td>
        <td class="data-cell data-cell-left">${row.description || "-"}</td>
        <td class="data-cell data-cell-center">${row.yearAcquired || "-"}</td>
        <td class="data-cell data-cell-center">${
          row.co !== null ? row.co.toFixed(2) : "-"
        }</td>
        <td class="data-cell data-cell-center">${
          row.hc !== null ? Math.round(row.hc) : "-"
        }</td>
        <td class="data-cell data-cell-center">${
          row.opacimeter !== null ? row.opacimeter.toFixed(2) : "-"
        }</td>
        <td class="data-cell data-cell-center ${resultClass}">${
      row.testResult
    }</td>
        <td class="data-cell data-cell-center">${row.testDate || "N/A"}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  return html;
};
