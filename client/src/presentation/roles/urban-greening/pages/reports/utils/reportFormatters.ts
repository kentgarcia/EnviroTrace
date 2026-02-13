export interface RequirementChecklistItem {
  requirement_name?: string;
  name?: string;
  label?: string;
  is_checked?: boolean;
  date_submitted?: string;
}

export const parseRequirementChecklistItems = (value: unknown): RequirementChecklistItem[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === "object" && item !== null)
      .map((item) => item as RequirementChecklistItem);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item) => typeof item === "object" && item !== null)
          .map((item) => item as RequirementChecklistItem);
      }
    } catch {
      return [];
    }
  }

  return [];
};

const getRequirementLabel = (item: RequirementChecklistItem): string =>
  item.requirement_name || item.name || item.label || "Requirement";

const buildRequirementColumnKey = (label: string): string =>
  `requirement_${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "item"}`;

export const expandTreeRequestRequirementsColumns = (rows: any[]): any[] => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  const requirementColumns: Array<{ key: string; label: string }> = [];
  const seenColumnKeys = new Set<string>();

  rows.forEach((row) => {
    const checklistItems = parseRequirementChecklistItems(row?.requirements_checklist);
    checklistItems.forEach((item) => {
      const label = getRequirementLabel(item);
      let key = buildRequirementColumnKey(label);
      if (seenColumnKeys.has(key)) {
        return;
      }
      seenColumnKeys.add(key);
      requirementColumns.push({ key, label });
    });
  });

  return rows.map((row) => {
    const nextRow = { ...row };
    const checklistItems = parseRequirementChecklistItems(row?.requirements_checklist);
    const statusByLabel = new Map(
      checklistItems.map((item) => [getRequirementLabel(item), !!item.is_checked])
    );

    requirementColumns.forEach(({ key, label }) => {
      nextRow[key] = statusByLabel.get(label) ? "☑" : "☐";
    });

    return nextRow;
  });
};

const formatSubmissionDate = (value?: string): string | null => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toLocaleDateString();
};

const describeRequirementChecklistItem = (item: RequirementChecklistItem): string => {
  const label = item.requirement_name || item.name || item.label || "Requirement";
  const status = item.is_checked ? "Completed" : "Pending";
  const submittedAt = formatSubmissionDate(item.date_submitted);
  return submittedAt ? `${label} — ${status} (${submittedAt})` : `${label} — ${status}`;
};

export const formatRequirementChecklistForHTML = (value: unknown): string => {
  const items = parseRequirementChecklistItems(value);
  if (items.length === 0) {
    return "N/A";
  }
  const listItems = items
    .map((item) => `<li class="leading-tight">${describeRequirementChecklistItem(item)}</li>`)
    .join("");
  return `<ul class="m-0 pl-4 text-xs">${listItems}</ul>`;
};

export const formatRequirementChecklistForText = (value: unknown): string => {
  const items = parseRequirementChecklistItems(value);
  if (items.length === 0) {
    return "N/A";
  }
  return items.map((item) => `• ${describeRequirementChecklistItem(item)}`).join("\n");
};

interface ProjectPlantItem {
  plant_type?: string;
  species?: string;
  common_name?: string;
  quantity?: number;
}

const parseProjectPlantItems = (value: unknown): ProjectPlantItem[] => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === "object" && item !== null)
      .map((item) => item as ProjectPlantItem);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item) => typeof item === "object" && item !== null)
          .map((item) => item as ProjectPlantItem);
      }
    } catch {
      return [];
    }
  }

  return [];
};

const toTitleCase = (value?: string): string | null => {
  if (!value) return null;
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatProjectPlantItem = (item: ProjectPlantItem): string => {
  const typeLabel = toTitleCase(item.plant_type) || "Unknown Type";
  const speciesLabel = item.species || item.common_name || "Unknown Plant";
  const commonName = item.common_name && item.common_name !== item.species ? ` (${item.common_name})` : "";
  const quantityLabel = typeof item.quantity === "number" ? item.quantity : "N/A";
  return `${typeLabel}: ${speciesLabel}${commonName} × ${quantityLabel}`;
};

export const formatProjectPlantsForText = (value: unknown): string => {
  const items = parseProjectPlantItems(value);
  if (items.length === 0) return "N/A";
  return items.map((item) => `• ${formatProjectPlantItem(item)}`).join("\n");
};

export const formatProjectPlantsForHTML = (value: unknown): string => {
  const items = parseProjectPlantItems(value);
  if (items.length === 0) return "N/A";
  const listItems = items.map((item) => `<li class="leading-tight">${formatProjectPlantItem(item)}</li>`).join("");
  return `<ul class="m-0 pl-4 text-xs">${listItems}</ul>`;
};

export const formatDateTimeForReport = (value: unknown): string => {
  if (!value) return "N/A";
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleString();
};
