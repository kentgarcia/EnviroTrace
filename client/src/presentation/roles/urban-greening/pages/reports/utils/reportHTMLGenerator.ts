interface ReportConfig {
    reportType: string;
    reportTitle: string;
    year?: number;
    month?: number;
    status?: string;
    data: any[];
}

export const  generateUrbanGreeningReportHTML = (config: ReportConfig): string => {
  const { reportType, data } = config;

  let html = ``;

    switch (reportType) {
      case "tree-inventory":
        html += generateTreeInventoryTable(data);
        break;
      case "tree-requests":
        html += generateAllFieldsTable(data, "#16a34a");
        break;
      case "urban-greening-projects":
        html += generateAllFieldsTable(data, "#16a34a");
        break;
      case "fee-records":
        html += generateAllFieldsTable(data, "#16a34a", {
          omitKeys: ["id", "fee_id"],
          dateOnlyKeys: ["created_at", "updated_at"],
        });
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
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px;">
      <thead>
        <tr style="background-color: #16a34a; color: white;">
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Tree Code</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Status</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Health</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Species</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Address</th>
          <th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">Planted</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach((tree, index) => {
    const bgColor = index % 2 === 0 ? "#f9fafb" : "white";
    html += `
      <tr style="background-color: ${bgColor};">
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${tree.tree_code || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${tree.status || tree.tree_status || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${tree.health || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${tree.species?.common_name || tree.common_name || tree.species?.scientific_name || tree.scientific_name || "N/A"}</td>
        <td style="padding: 10px 8px; border: 1px solid #ddd;">${tree.address || tree.location || "N/A"}</td>
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


function formatDateOnly(value: any): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function generateAllFieldsTable(
  data: any[],
  headerColor: string,
  options?: { omitKeys?: string[]; dateOnlyKeys?: string[] }
): string {
    if (data.length === 0) return '<p>No records found for the selected period.</p>';

    const omitKeys = new Set((options?.omitKeys || []).map((key) => key.toLowerCase()));
    const dateOnlyKeys = new Set((options?.dateOnlyKeys || []).map((key) => key.toLowerCase()));
    const keys = Object.keys(data[0]).filter((key) => !omitKeys.has(key.toLowerCase()));
    const headers = keys.map((key) =>
        key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase())
    );

    let html = `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px;">
      <thead>
        <tr style="background-color: ${headerColor}; color: white;">
          ${headers
            .map(
              (header) =>
                `<th style="padding: 12px 8px; border: 1px solid #ddd; text-align: left;">${header}</th>`
            )
            .join("")}
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach((item, index) => {
    const bgColor = index % 2 === 0 ? "#f9fafb" : "white";
    html += `
      <tr style="background-color: ${bgColor};">
        ${keys
          .map((key) => {
            const value = item[key];
            const dateOnly = dateOnlyKeys.has(key.toLowerCase()) ? formatDateOnly(value) : null;
            const text = dateOnly !== null
              ? dateOnly
              : value === null || value === undefined
                ? "N/A"
                : typeof value === "object"
                  ? JSON.stringify(value)
                  : value;
            return `<td style="padding: 10px 8px; border: 1px solid #ddd;">${text}</td>`;
          })
          .join("")}
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  return html;
}
