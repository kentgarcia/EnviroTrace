import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { Office, Vehicle, EmissionTest } from "@/core/api/emission-service";

interface ReportConfig {
  year: number;
  quarter: string;
  office: string;
  sections: string[];
  offices: Office[];
  vehicles: Vehicle[];
}

export const generateExcelReport = async (config: ReportConfig) => {
  const { year, quarter, office, sections, offices, vehicles } = config;

  // Filter vehicles by office if needed
  const filteredVehicles =
    office === "all"
      ? vehicles
      : vehicles.filter((v) => v.office_id === office);

  const selectedOffice = offices.find((o) => o.id === office);

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  if (sections.includes("summary")) {
    const testedVehicles = filteredVehicles.filter(
      (v) => v.latest_test_result !== null
    );
    const passedVehicles = filteredVehicles.filter(
      (v) => v.latest_test_result === true
    );
    const failedVehicles = filteredVehicles.filter(
      (v) => v.latest_test_result === false
    );
    const complianceRate =
      testedVehicles.length > 0
        ? ((passedVehicles.length / testedVehicles.length) * 100).toFixed(1)
        : "0.0";

    const summaryData = [
      ["GOVERNMENT EMISSION TESTING REPORT"],
      [""],
      ["Report Information"],
      ["Year:", year],
      ["Quarter:", quarter === "all" ? "All Quarters" : quarter],
      [
        "Office:",
        office === "all"
          ? "All Government Offices"
          : selectedOffice?.name || "N/A",
      ],
      ["Generated:", new Date().toLocaleDateString()],
      [""],
      ["Summary Statistics"],
      ["Total Vehicles:", filteredVehicles.length],
      ["Tested Vehicles:", testedVehicles.length],
      ["Passed Tests:", passedVehicles.length],
      ["Failed Tests:", failedVehicles.length],
      ["Not Tested:", filteredVehicles.length - testedVehicles.length],
      ["Compliance Rate:", `${complianceRate}%`],
      [""],
      ["Vehicle Type Distribution"],
      ...Array.from(new Set(filteredVehicles.map((v) => v.vehicle_type))).map(
        (type) => {
          const count = filteredVehicles.filter(
            (v) => v.vehicle_type === type
          ).length;
          return [type, count];
        }
      ),
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

    // Set column widths
    summarySheet["!cols"] = [{ wch: 30 }, { wch: 30 }];

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
  }

  // Vehicle Registry Sheet
  if (sections.includes("vehicles")) {
    const vehicleData = [
      [
        "Plate Number",
        "Driver Name",
        "Contact Number",
        "Office",
        "Vehicle Type",
        "Engine Type",
        "Wheels",
        "Test Status",
        "Latest Test Date",
        "Created Date",
      ],
    ];

    filteredVehicles.forEach((vehicle) => {
      const status =
        vehicle.latest_test_result === null
          ? "Not Tested"
          : vehicle.latest_test_result
          ? "Passed"
          : "Failed";

      vehicleData.push([
        vehicle.plate_number,
        vehicle.driver_name,
        vehicle.contact_number || "N/A",
        vehicle.office?.name || "N/A",
        vehicle.vehicle_type,
        vehicle.engine_type,
        vehicle.wheels.toString(),
        status,
        vehicle.latest_test_date
          ? new Date(vehicle.latest_test_date).toLocaleDateString()
          : "N/A",
        new Date(vehicle.created_at).toLocaleDateString(),
      ]);
    });

    const vehicleSheet = XLSX.utils.aoa_to_sheet(vehicleData);

    // Set column widths
    vehicleSheet["!cols"] = [
      { wch: 15 }, // Plate Number
      { wch: 20 }, // Driver Name
      { wch: 15 }, // Contact
      { wch: 30 }, // Office
      { wch: 15 }, // Vehicle Type
      { wch: 15 }, // Engine Type
      { wch: 8 }, // Wheels
      { wch: 12 }, // Status
      { wch: 15 }, // Test Date
      { wch: 15 }, // Created Date
    ];

    XLSX.utils.book_append_sheet(workbook, vehicleSheet, "Vehicles");
  }

  // Testing Results Sheet
  if (sections.includes("testing")) {
    const testedVehicles = filteredVehicles.filter(
      (v) => v.latest_test_result !== null
    );

    const testingData = [
      [
        "Plate Number",
        "Driver Name",
        "Office",
        "Vehicle Type",
        "Engine Type",
        "Test Date",
        "Result",
        "Quarter",
      ],
    ];

    testedVehicles.forEach((vehicle) => {
      const testDate = vehicle.latest_test_date
        ? new Date(vehicle.latest_test_date)
        : null;
      const testQuarter = testDate
        ? `Q${Math.ceil((testDate.getMonth() + 1) / 3)}`
        : "N/A";

      testingData.push([
        vehicle.plate_number,
        vehicle.driver_name,
        vehicle.office?.name || "N/A",
        vehicle.vehicle_type,
        vehicle.engine_type,
        testDate ? testDate.toLocaleDateString() : "N/A",
        vehicle.latest_test_result ? "PASSED" : "FAILED",
        testQuarter,
      ]);
    });

    const testingSheet = XLSX.utils.aoa_to_sheet(testingData);

    // Set column widths
    testingSheet["!cols"] = [
      { wch: 15 }, // Plate Number
      { wch: 20 }, // Driver Name
      { wch: 30 }, // Office
      { wch: 15 }, // Vehicle Type
      { wch: 15 }, // Engine Type
      { wch: 15 }, // Test Date
      { wch: 10 }, // Result
      { wch: 10 }, // Quarter
    ];

    XLSX.utils.book_append_sheet(workbook, testingSheet, "Testing Results");
  }

  // Office Compliance Sheet
  if (sections.includes("offices")) {
    const officeData = [
      [
        "Office Name",
        "Address",
        "Contact Number",
        "Email",
        "Total Vehicles",
        "Tested",
        "Passed",
        "Failed",
        "Not Tested",
        "Compliance Rate",
      ],
    ];

    offices.forEach((office) => {
      const officeVehicles = vehicles.filter((v) => v.office_id === office.id);
      const tested = officeVehicles.filter(
        (v) => v.latest_test_result !== null
      );
      const passed = officeVehicles.filter(
        (v) => v.latest_test_result === true
      );
      const failed = officeVehicles.filter(
        (v) => v.latest_test_result === false
      );
      const notTested = officeVehicles.length - tested.length;
      const rate =
        tested.length > 0
          ? ((passed.length / tested.length) * 100).toFixed(1)
          : "0.0";

      officeData.push([
        office.name,
        office.address || "N/A",
        office.contact_number || "N/A",
        office.email || "N/A",
        officeVehicles.length.toString(),
        tested.length.toString(),
        passed.length.toString(),
        failed.length.toString(),
        notTested.toString(),
        `${rate}%`,
      ]);
    });

    const officeSheet = XLSX.utils.aoa_to_sheet(officeData);

    // Set column widths
    officeSheet["!cols"] = [
      { wch: 30 }, // Office Name
      { wch: 40 }, // Address
      { wch: 15 }, // Contact
      { wch: 25 }, // Email
      { wch: 12 }, // Total
      { wch: 10 }, // Tested
      { wch: 10 }, // Passed
      { wch: 10 }, // Failed
      { wch: 12 }, // Not Tested
      { wch: 15 }, // Rate
    ];

    XLSX.utils.book_append_sheet(workbook, officeSheet, "Office Compliance");
  }

  // Statistics Sheet
  if (sections.includes("statistics")) {
    const statsData = [
      ["STATISTICS ANALYSIS"],
      [""],
      ["Vehicle Type Distribution"],
      ["Type", "Count", "Percentage"],
    ];

    const vehicleTypes = Array.from(
      new Set(filteredVehicles.map((v) => v.vehicle_type))
    );
    vehicleTypes.forEach((type) => {
      const count = filteredVehicles.filter(
        (v) => v.vehicle_type === type
      ).length;
      const percentage = ((count / filteredVehicles.length) * 100).toFixed(1);
      statsData.push([type, count.toString(), `${percentage}%`]);
    });

    statsData.push(
      [""],
      ["Engine Type Distribution"],
      ["Type", "Count", "Percentage"]
    );

    const engineTypes = Array.from(
      new Set(filteredVehicles.map((v) => v.engine_type))
    );
    engineTypes.forEach((type) => {
      const count = filteredVehicles.filter(
        (v) => v.engine_type === type
      ).length;
      const percentage = ((count / filteredVehicles.length) * 100).toFixed(1);
      statsData.push([type, count.toString(), `${percentage}%`]);
    });

    statsData.push(
      [""],
      ["Test Results Distribution"],
      ["Result", "Count", "Percentage"]
    );

    const testedCount = filteredVehicles.filter(
      (v) => v.latest_test_result !== null
    ).length;
    const passedCount = filteredVehicles.filter(
      (v) => v.latest_test_result === true
    ).length;
    const failedCount = filteredVehicles.filter(
      (v) => v.latest_test_result === false
    ).length;
    const notTestedCount = filteredVehicles.length - testedCount;

    statsData.push(
      [
        "Passed",
        passedCount.toString(),
        `${((passedCount / filteredVehicles.length) * 100).toFixed(1)}%`,
      ],
      [
        "Failed",
        failedCount.toString(),
        `${((failedCount / filteredVehicles.length) * 100).toFixed(1)}%`,
      ],
      [
        "Not Tested",
        notTestedCount.toString(),
        `${((notTestedCount / filteredVehicles.length) * 100).toFixed(1)}%`,
      ]
    );

    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);

    // Set column widths
    statsSheet["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(workbook, statsSheet, "Statistics");
  }

  // Recommendations Sheet
  if (sections.includes("recommendations")) {
    const recommendationsData = [
      ["RECOMMENDATIONS"],
      [""],
      ["Priority", "Recommendation", "Description", "Expected Impact"],
      [
        "High",
        "Increase Testing Frequency",
        "Implement more frequent emission testing schedules, particularly for older vehicles and those that have previously failed tests.",
        "Improved compliance rates and early detection of emission issues",
      ],
      [
        "High",
        "Maintenance Programs",
        "Establish regular maintenance programs for all government vehicles to ensure optimal performance and reduce emissions.",
        "Reduced emissions and extended vehicle lifespan",
      ],
      [
        "Medium",
        "Fleet Modernization",
        "Consider phasing out older vehicles with consistently high emissions and replacing them with newer, more environmentally friendly alternatives.",
        "Significant reduction in overall fleet emissions",
      ],
      [
        "Medium",
        "Driver Training",
        "Provide training to drivers on eco-friendly driving practices and the importance of regular vehicle maintenance.",
        "Improved driving habits and better vehicle care",
      ],
      [
        "Low",
        "Monitoring System",
        "Implement a real-time monitoring system to track vehicle emissions and maintenance schedules.",
        "Better data management and proactive maintenance",
      ],
    ];

    const recommendationsSheet = XLSX.utils.aoa_to_sheet(recommendationsData);

    // Set column widths
    recommendationsSheet["!cols"] = [
      { wch: 10 }, // Priority
      { wch: 30 }, // Recommendation
      { wch: 60 }, // Description
      { wch: 40 }, // Expected Impact
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      recommendationsSheet,
      "Recommendations"
    );
  }

  // Generate and download
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const fileName = `Emission_Report_${year}_${quarter}_${Date.now()}.xlsx`;
  saveAs(blob, fileName);
};

// Comprehensive Testing Report with CO/HC data
interface VehicleWithTestData extends Vehicle {
  tests?: EmissionTest[];
}

interface ComprehensiveReportConfig {
  year?: number;
  quarter?: number;
  office?: string;
  status?: string; // "all" | "passed" | "failed" | "not-tested"
  engineType?: string;
  vehicles: VehicleWithTestData[];
  tests: EmissionTest[];
}

export const generateComprehensiveTestingReport = async (
  config: ComprehensiveReportConfig
) => {
  const { year, quarter, office, status, engineType, vehicles, tests } = config;

  // Create a map of vehicle ID to latest test
  const vehicleTestMap = new Map<string, EmissionTest>();
  tests.forEach((test) => {
    const existing = vehicleTestMap.get(test.vehicle_id);
    if (!existing) {
      vehicleTestMap.set(test.vehicle_id, test);
      return;
    }

    const existingDate = existing?.test_date
      ? new Date(existing.test_date).getTime()
      : null;
    const incomingDate = test?.test_date
      ? new Date(test.test_date).getTime()
      : null;

    if (incomingDate === null && existingDate === null) {
      const existingHasOpacimeter =
        existing.opacimeter_result !== undefined &&
        existing.opacimeter_result !== null;
      const newHasOpacimeter =
        test.opacimeter_result !== undefined &&
        test.opacimeter_result !== null;

      if (!existingHasOpacimeter && newHasOpacimeter) {
        vehicleTestMap.set(test.vehicle_id, test);
      }
      return;
    }

    if (existingDate === null && incomingDate !== null) {
      vehicleTestMap.set(test.vehicle_id, test);
      return;
    }

    if (incomingDate === null) {
      return;
    }

    if (existingDate === null || incomingDate > existingDate) {
      vehicleTestMap.set(test.vehicle_id, test);
      return;
    }

    if (incomingDate === existingDate) {
      const existingHasOpacimeter =
        existing.opacimeter_result !== undefined &&
        existing.opacimeter_result !== null;
      const newHasOpacimeter =
        test.opacimeter_result !== undefined &&
        test.opacimeter_result !== null;

      if (!existingHasOpacimeter && newHasOpacimeter) {
        vehicleTestMap.set(test.vehicle_id, test);
      }
    }
  });

  // Filter vehicles based on criteria
  let filteredVehicles = vehicles;

  if (year) {
    filteredVehicles = filteredVehicles.filter((v) => {
      const test = vehicleTestMap.get(v.id);
      if (!test) return false;
      return new Date(test.test_date).getFullYear() === year;
    });
  }

  if (quarter) {
    filteredVehicles = filteredVehicles.filter((v) => {
      const test = vehicleTestMap.get(v.id);
      if (!test) return false;
      const testDate = new Date(test.test_date);
      const testQuarter = Math.ceil((testDate.getMonth() + 1) / 3);
      return testQuarter === quarter;
    });
  }

  if (office && office !== "all") {
    filteredVehicles = filteredVehicles.filter((v) => v.office_id === office);
  }

  if (status && status !== "all") {
    filteredVehicles = filteredVehicles.filter((v) => {
      const test = vehicleTestMap.get(v.id);
      if (status === "not-tested") return !test;
      if (status === "passed") return test?.result === true;
      if (status === "failed") return test?.result === false;
      return true;
    });
  }

  if (engineType) {
    const engineValue = engineType.trim().toLowerCase();
    filteredVehicles = filteredVehicles.filter((v) => {
      const vehicleEngine = v.engine_type?.trim().toLowerCase() || "";
      return vehicleEngine === engineValue;
    });
  }

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Header row with blue background (#0033A0)
  const headers = [
    "NO",
    "DRIVER'S NAME",
    "OFFICE",
    "PLATE NUMBER",
    "VEHICLE CATEGORY",
    "ENGINE TYPE",
    "VEHICLE DESCRIPTION",
    "YEAR ACQUIRED",
    "CO (%)",
    "HC (ppm)",
    "OPACIMETER (%)",
    "TEST RESULT",
    "DATE",
  ];

  // Build data rows
  const dataRows: any[][] = [];
  filteredVehicles.forEach((vehicle, index) => {
    const test = vehicleTestMap.get(vehicle.id);
    const identifier =
      vehicle.plate_number ||
      vehicle.chassis_number ||
      vehicle.registration_number ||
      "N/A";

    const engineType = vehicle.engine_type || "";
    const coLevel = typeof test?.co_level === "number" ? test.co_level : null;
    const hcLevel = typeof test?.hc_level === "number" ? test.hc_level : null;
    const opacimeterLevel =
      engineType.toLowerCase().includes("diesel") &&
      typeof test?.opacimeter_result === "number"
        ? test.opacimeter_result
        : null;

    dataRows.push([
      index + 1, // NO
      vehicle.driver_name || "N/A",
      vehicle.office?.name || "N/A",
      identifier,
      vehicle.vehicle_type || "N/A",
      engineType || "N/A",
      vehicle.description || "",
      vehicle.year_acquired ?? "",
      coLevel !== null ? coLevel.toFixed(2) : "",
      hcLevel !== null ? Math.round(hcLevel) : "",
      opacimeterLevel !== null ? opacimeterLevel.toFixed(2) : "",
      test?.result === true
        ? "PASSED"
        : test?.result === false
        ? "FAILED"
        : "NOT TESTED",
      test?.test_date
        ? new Date(test.test_date).toLocaleDateString()
        : "N/A",
    ]);
  });

  // Combine headers and data
  const sheetData = [headers, ...dataRows];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 6 },  // NO
    { wch: 25 }, // DRIVER'S NAME
    { wch: 28 }, // OFFICE
    { wch: 15 }, // PLATE NUMBER
    { wch: 18 }, // VEHICLE CATEGORY
    { wch: 16 }, // ENGINE TYPE
    { wch: 35 }, // VEHICLE DESCRIPTION
    { wch: 12 }, // YEAR ACQUIRED
    { wch: 10 }, // CO (%)
    { wch: 10 }, // HC (ppm)
    { wch: 12 }, // OPACIMETER (%)
    { wch: 12 }, // TEST RESULT
    { wch: 12 }, // DATE
  ];

  // Apply styling to header row (row 1, cells A1-K1)
  const headerRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;

    worksheet[cellAddress].s = {
      fill: {
        fgColor: { rgb: "0033A0" }, // Blue background
      },
      font: {
        color: { rgb: "FFFFFF" }, // White text
        bold: true,
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
    };
  }

  // Apply styling to NO column (column A, white background)
  for (let row = 1; row <= dataRows.length; row++) {
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
    if (!worksheet[cellAddress]) continue;

    worksheet[cellAddress].s = {
      fill: {
        fgColor: { rgb: "FFFFFF" }, // White background
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
    };
  }

  // Apply light blue background to data cells (B2:K[n])
  for (let row = 1; row <= dataRows.length; row++) {
    for (let col = 1; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellAddress]) continue;

      worksheet[cellAddress].s = {
        fill: {
          fgColor: { rgb: "E3F2FD" }, // Light blue background
        },
        alignment: {
          horizontal: col === 1 || col === 2 || col === 3 ? "left" : "center",
          vertical: "center",
        },
      };
    }
  }

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Comprehensive Testing Report"
  );

  // Generate and download
  const excelBuffer = XLSX.write(workbook, { 
    bookType: "xlsx", 
    type: "array",
    cellStyles: true 
  });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  
  const filterStr = [
    year && `${year}`,
    quarter && `Q${quarter}`,
    office && office !== "all" ? office.substring(0, 10) : "All",
    engineType && engineType.trim().replace(/\s+/g, "_"),
  ]
    .filter(Boolean)
    .join("_");
  
  const fileName = `Comprehensive_Testing_Report_${filterStr || "All"}_${Date.now()}.xlsx`;
  saveAs(blob, fileName);
};
