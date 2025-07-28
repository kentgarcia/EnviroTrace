import { useState, useEffect } from "react";
import {
  inspectionApiService,
  InspectionResponse,
  InspectionRecordFrontendResponse,
  CreateInspectionRequest,
  UpdateInspectionRequest,
  UpdateInspectionRequestBackend,
} from "../../../../../../integrations/inspectionApi";

export interface TreeItem {
  name: string;
  quantity: number;
}

export interface InspectionRecord {
  id?: string;
  reportNo: string;
  inspectors: string[];
  date: string;
  location: string;
  type: string;
  status: string;
  followUp: string;
  trees: TreeItem[];
  notes: string;
  pictures: File[];
}

const defaultLocation = "";

// Helper function to convert frontend API response to local format
const convertFrontendApiToLocal = (
  apiRecord: InspectionRecordFrontendResponse
): InspectionRecord => {
  return {
    id: apiRecord.id,
    reportNo: apiRecord.reportNo,
    inspectors: Array.isArray(apiRecord.inspectors) ? apiRecord.inspectors : [],
    date: apiRecord.date,
    location: apiRecord.location,
    type: apiRecord.type,
    status: apiRecord.status,
    followUp: apiRecord.followUp || "",
    trees: Array.isArray(apiRecord.trees) ? apiRecord.trees : [],
    notes: apiRecord.notes || "",
    pictures: [], // File objects can't be restored from API
  };
};

// Helper function to convert API response to frontend format (for regular endpoints)
const convertApiToFrontend = (
  apiRecord: InspectionResponse
): InspectionRecord => {
  let trees: TreeItem[] = [];
  let inspectors: string[] = [];

  // Parse inspectors data safely
  if (apiRecord.inspectors) {
    try {
      if (typeof apiRecord.inspectors === "string") {
        const parsedInspectors = JSON.parse(apiRecord.inspectors);
        if (Array.isArray(parsedInspectors)) {
          inspectors = parsedInspectors.filter(
            (inspector: any) => typeof inspector === "string"
          );
        }
      } else if (Array.isArray(apiRecord.inspectors)) {
        inspectors = (apiRecord.inspectors as unknown[]).filter(
          (inspector: any) => typeof inspector === "string"
        );
      }
    } catch (error) {
      console.error("Error parsing inspectors data:", error);
      // Try to handle as comma-separated string
      if (typeof apiRecord.inspectors === "string") {
        inspectors = apiRecord.inspectors
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }
    }
  }

  // Parse trees data safely
  if (apiRecord.trees) {
    try {
      let parsedTrees: any;
      if (typeof apiRecord.trees === "string") {
        parsedTrees = JSON.parse(apiRecord.trees);
      } else {
        parsedTrees = apiRecord.trees;
      }

      if (Array.isArray(parsedTrees)) {
        trees = parsedTrees
          .map((tree: any) => {
            if (typeof tree === "string") {
              // Parse string format "TreeName (quantity)"
              const match = tree.match(/(.+?)\s*\((\d+)\)/);
              if (match) {
                return { name: match[1].trim(), quantity: parseInt(match[2]) };
              }
              return { name: tree, quantity: 1 };
            } else if (tree && typeof tree === "object" && tree.name) {
              return { name: tree.name, quantity: tree.quantity || 1 };
            }
            return { name: "", quantity: 1 }; // Default fallback instead of null
          })
          .filter((tree: TreeItem) => tree.name !== ""); // Filter out empty names
      }
    } catch (error) {
      console.error("Error parsing trees data:", error);
      // Try to handle as comma-separated string
      if (typeof apiRecord.trees === "string") {
        const treeNames = apiRecord.trees
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        trees = treeNames.map((name) => ({ name, quantity: 1 }));
      }
    }
  }

  return {
    id: apiRecord.id,
    reportNo: apiRecord.report_number,
    inspectors,
    date: apiRecord.date,
    location: apiRecord.location,
    type: apiRecord.type,
    status: apiRecord.status,
    followUp: "", // Not used in backend model
    trees,
    notes: apiRecord.notes || "",
    pictures: [], // File objects can't be restored from API
  };
};

// Helper function to convert frontend format to API request (backend format with JSON strings)
const convertFrontendToApiBackend = (
  record: InspectionRecord
): UpdateInspectionRequestBackend => {
  return {
    reportNo: record.reportNo,
    date: record.date,
    location: record.location,
    type: record.type,
    status: record.status,
    inspectors: JSON.stringify(record.inspectors),
    trees: JSON.stringify(record.trees),
    notes: record.notes,
    pictures: JSON.stringify(record.pictures.map((file) => file.name)),
    followUp: record.followUp,
  };
};

// Helper function to convert frontend format to API request (frontend format with arrays)
const convertFrontendToApi = (
  record: InspectionRecord
): CreateInspectionRequest | UpdateInspectionRequest => {
  return {
    reportNo: record.reportNo,
    date: record.date,
    location: record.location,
    type: record.type,
    status: record.status,
    inspectors: record.inspectors,
    trees: record.trees, // Keep as TreeItem array
    notes: record.notes,
    pictures: record.pictures.map((file) => file.name), // Convert to filename array
    followUp: record.followUp,
  };
};

export function useInspectionRecords() {
  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<InspectionRecord>({
    reportNo: "",
    inspectors: [],
    date: "",
    location: defaultLocation,
    type: "",
    status: "",
    followUp: "",
    trees: [],
    notes: "",
    pictures: [],
  });
  const [treeName, setTreeName] = useState("");
  const [treeQty, setTreeQty] = useState(1);
  const [inspectorInput, setInspectorInput] = useState("");

  // Load records from API on component mount
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inspectionApiService.getInspectionReports();
      if (response.success) {
        const frontendRecords = response.data.map(convertFrontendApiToLocal);
        setRecords(frontendRecords);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load records");
      console.error("Error loading records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTree = () => {
    if (treeName) {
      setRecord((r) => ({
        ...r,
        trees: [...r.trees, { name: treeName, quantity: treeQty }],
      }));
      setTreeName("");
      setTreeQty(1);
    }
  };

  const handleAddInspector = () => {
    if (inspectorInput) {
      setRecord((r) => ({
        ...r,
        inspectors: [...r.inspectors, inspectorInput],
      }));
      setInspectorInput("");
    }
  };

  const handleRemoveInspector = (index: number) => {
    setRecord((r) => ({
      ...r,
      inspectors: r.inspectors.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveTree = (index: number) => {
    setRecord((r) => ({
      ...r,
      trees: r.trees.filter((_, i) => i !== index),
    }));
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setRecord((r) => ({ ...r, pictures: Array.from(files) }));
    } else {
      setRecord((r) => ({ ...r, pictures: [] }));
    }
  };

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Auto-generate report number using API
  const generateReportNumber = async () => {
    try {
      const response = await inspectionApiService.generateReportNumber();
      return response.report_number;
    } catch (error) {
      console.error("Error generating report number:", error);
      // Fallback to local generation
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const existingReports = records.length;
      const sequence = String(existingReports + 1).padStart(3, "0");
      return `IR-${year}${month}${day}-${sequence}`;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isEditing && record.id) {
        // Update existing record - convert to backend format for regular endpoint
        const apiData = convertFrontendToApiBackend(record);
        const response = await inspectionApiService.updateInspectionReport(
          record.id,
          apiData
        );
        if (response.success) {
          const updatedRecord = convertApiToFrontend(response.data);
          setRecords((prev) =>
            prev.map((r) => (r.id === record.id ? updatedRecord : r))
          );
          setIsEditing(false);
          setEditingIndex(null);
        }
      } else {
        // Add new record - send frontend format directly to /frontend endpoint
        const response =
          await inspectionApiService.createInspectionReportFrontend(record);
        if (response.success) {
          const newRecord = convertApiToFrontend(response.data);
          setRecords((prev) => [...prev, newRecord]);
          setIsAdding(false);
        }
      }

      // Reset form
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save record");
      console.error("Error saving record:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRecord({
      reportNo: "",
      inspectors: [],
      date: "",
      location: defaultLocation,
      type: "",
      status: "",
      followUp: "",
      trees: [],
      notes: "",
      pictures: [],
    });
    setTreeName("");
    setTreeQty(1);
    setInspectorInput("");
  };

  const handleEdit = (index: number) => {
    const recordToEdit = records[index];
    setRecord(recordToEdit);
    setIsEditing(true);
    setIsAdding(false);
    setEditingIndex(index);
    setSelectedIdx(null);
  };

  const handleDelete = async (index: number) => {
    const recordToDelete = records[index];
    if (!recordToDelete.id) {
      console.error("Cannot delete record without ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await inspectionApiService.deleteInspectionReport(
        recordToDelete.id
      );
      if (response.success) {
        setRecords((prev) => prev.filter((_, i) => i !== index));
        setSelectedIdx(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete record");
      console.error("Error deleting record:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setIsAdding(false);
    setEditingIndex(null);
    setRecord({
      reportNo: "",
      inspectors: [],
      date: "",
      location: defaultLocation,
      type: "",
      status: "",
      followUp: "",
      trees: [],
      notes: "",
      pictures: [],
    });
    setTreeName("");
    setTreeQty(1);
    setInspectorInput("");
  };

  const handleStartAdd = async () => {
    setIsAdding(true);
    setIsEditing(false);
    setSelectedIdx(null);
    setEditingIndex(null);

    // Generate report number asynchronously
    const newReportNo = await generateReportNumber();

    // Reset form to empty state with auto-generated report number
    setRecord({
      reportNo: newReportNo,
      inspectors: [],
      date: "",
      location: defaultLocation,
      type: "",
      status: "",
      followUp: "",
      trees: [],
      notes: "",
      pictures: [],
    });
    setTreeName("");
    setTreeQty(1);
    setInspectorInput("");
  };

  // Clear add/edit mode when selecting a record
  const handleSelectRecord = (idx: number) => {
    if (isAdding || isEditing) {
      // If in add/edit mode, don't allow selection
      return;
    }
    setSelectedIdx(idx);
  };

  return {
    record,
    setRecord,
    treeName,
    setTreeName,
    treeQty,
    setTreeQty,
    inspectorInput,
    setInspectorInput,
    records,
    loading,
    error,
    handleAddTree,
    handleAddInspector,
    handleRemoveInspector,
    handleRemoveTree,
    handlePictureChange,
    handleSave,
    handleEdit,
    handleDelete,
    handleCancelEdit,
    handleStartAdd,
    handleSelectRecord,
    selectedIdx,
    setSelectedIdx,
    isEditing,
    isAdding,
    editingIndex,
    loadRecords,
  };
}
