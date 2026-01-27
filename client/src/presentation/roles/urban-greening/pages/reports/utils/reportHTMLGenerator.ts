interface ReportConfig {
    reportType: string;
    reportTitle: string;
    year?: number;
    month?: number;
    status?: string;
    data: any[];
}

export const  generateUrbanGreeningReportHTML = (config: ReportConfig): string => {
    const { reportType, reportTitle, year, month, status, data } = config;
    
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const periodText = year 
        ? (month ? `${monthNames[month - 1]} ${year}` : `Year ${year}`)
        : "All Periods";

    const statusText = status && status !== "all" ? ` - Status: ${status}` : "";

    let html = `
    <div style="text-align: center; margin: 60px 0;">
      <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 20px;">
        CITY ENVIRONMENT AND NATURAL RESOURCES OFFICE
      </h1>
      <h2 style="font-size: 22px; font-weight: 600; margin: 10px 0;">
        ${reportTitle}
      </h2>
      <p style="font-size: 16px; margin: 10px 0;">Period: ${periodText}${statusText}</p>
      <p style="font-size: 14px; margin: 10px 0; color: #666;">
        Generated: ${new Date().toLocaleDateString()}
      </p>
    </div>
    <hr style="margin: 40px 0;" />
  `;

    switch (reportType) {
        case "tree-inventory":
            html += generateTreeInventoryTable(data);
            break;
        case "tree-requests":
            html += generateTreeRequestsTable(data);
            break;
        case "planting-projects":
            html += generatePlantingProjectsTable(data);
            break;
        case "sapling-collections":
            html += generateSaplingCollectionsTable(data);
            break;
        case "fee-records":
            html += generateFeeRecordsTable(data);
            break;
        default:
            html += "<p>No data available for this report type.</p>";
    }

    return html;
};

function generateTreeInventoryTable(data: any[]): string {
    if (data.length === 0) {
        return '<p>No tree inventory records found for the selected period.</p>';
    }

    let html = `
    <h2 style="font-size: 20px; font-weight: 600; margin: 20px 0 10px 0;">
      Tree Inventory - ${data.length} Trees
    </h2>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px;">
      <thead>
        <tr style="background-color: #16a34a; color: white;">
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">#</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Tree ID</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Common Name</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Scientific Name</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Location</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Health Status</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Height</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">DBH</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Planting Date</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach((tree, index) => {
    const bgColor = index % 2 === 0 ? "#f9fafb" : "white";
    html += `
      <tr style="background-color: ${bgColor};">
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${index + 1}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${tree.tree_code || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${tree.species?.common_name || tree.common_name || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${tree.species?.scientific_name || tree.scientific_name || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${tree.address || tree.location || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${tree.health || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${tree.height ? tree.height + " m" : "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${tree.dbh ? tree.dbh + " cm" : "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${tree.planting_date ? new Date(tree.planting_date).toLocaleDateString() : "N/A"}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  return html;
}

function generateTreeRequestsTable(data: any[]): string {
    if (data.length === 0) return '<p>No tree requests found for the selected period.</p>';

    let html = `
    <h2 style="font-size: 20px; font-weight: 600; margin: 20px 0 10px 0;">
      Tree Requests - ${data.length} Requests
    </h2>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px;">
      <thead>
        <tr style="background-color: #16a34a; color: white;">
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">#</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Date Received</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Applicant</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Request Type</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Location</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Status</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Species</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Quantity</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach((request, index) => {
    const bgColor = index % 2 === 0 ? "#f9fafb" : "white";
    html += `
      <tr style="background-color: ${bgColor};">
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${index + 1}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${request.date_received ? new Date(request.date_received).toLocaleDateString() : "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${request.applicant_name || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${request.request_type || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${request.location || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${request.status_receiving || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${request.species_requested || request.tree_species || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${request.quantity || "N/A"}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  return html;
}

function generatePlantingProjectsTable(data: any[]): string {
    if (data.length === 0) return '<p>No planting projects found for the selected period.</p>';

    let html = `
    <h2 style="font-size: 20px; font-weight: 600; margin: 20px 0 10px 0;">
      Planting Projects - ${data.length} Projects
    </h2>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px;">
      <thead>
        <tr style="background-color: #16a34a; color: white;">
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">#</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Project Name</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Type</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Planting Date</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Location</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">No. of Trees</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Organization</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach((project, index) => {
    const bgColor = index % 2 === 0 ? "#f9fafb" : "white";
    html += `
      <tr style="background-color: ${bgColor};">
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${index + 1}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${project.project_name || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${project.planting_type || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${project.planting_date ? new Date(project.planting_date).toLocaleDateString() : "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${project.location || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${project.number_of_trees || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${project.organization || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${project.status || "N/A"}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  return html;
}

function generateSaplingCollectionsTable(data: any[]): string {
    if (data.length === 0) return '<p>No sapling collections found for the selected period.</p>';

    let html = `
    <h2 style="font-size: 20px; font-weight: 600; margin: 20px 0 10px 0;">
      Sapling Collections - ${data.length} Records
    </h2>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px;">
      <thead>
        <tr style="background-color: #16a34a; color: white;">
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">#</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Collection Date</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Species</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Quantity</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Recipient</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Location</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Purpose</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Method</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach((collection, index) => {
    const bgColor = index % 2 === 0 ? "#f9fafb" : "white";
    html += `
      <tr style="background-color: ${bgColor};">
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${index + 1}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${collection.collection_date ? new Date(collection.collection_date).toLocaleDateString() : "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${collection.species_name || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${collection.quantity || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${collection.recipient_name || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${collection.location || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${collection.purpose || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${collection.collection_method || "N/A"}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  return html;
}

function generateFeeRecordsTable(data: any[]): string {
    if (data.length === 0) return '<p>No fee records found for the selected period.</p>';

    const total = data.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0);

    let html = `
    <h2 style="font-size: 20px; font-weight: 600; margin: 20px 0 10px 0;">
      Fee Records - ${data.length} Records
    </h2>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px;">
      <thead>
        <tr style="background-color: #16a34a; color: white;">
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">#</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Payment Date</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Fee Type</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Amount</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Payer</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Receipt No.</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Purpose</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach((fee, index) => {
    const bgColor = index % 2 === 0 ? "#f9fafb" : "white";
    html += `
      <tr style="background-color: ${bgColor};">
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${index + 1}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${fee.date ? new Date(fee.date).toLocaleDateString() : "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${fee.type || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">₱${parseFloat(fee.amount || 0).toFixed(2)}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${fee.payer_name || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${fee.or_number || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${fee.purpose || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${fee.status || "N/A"}</td>
      </tr>
    `;
  });

  html += `
        <tr style="background-color: #dcfce7; font-weight: 600;">
          <td colspan="3" style="text-align: right; padding: 10px 8px; border: 1px solid #ddd;">Total:</td>
          <td style="padding: 10px 8px; border: 1px solid #ddd;">₱${total.toFixed(2)}</td>
          <td colspan="4" style="padding: 10px 8px; border: 1px solid #ddd;"></td>
        </tr>
      </tbody>
    </table>
  `;

  return html;
}
