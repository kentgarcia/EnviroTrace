import { useState } from "react";

export interface TreeItem {
  name: string;
  quantity: number;
}

export interface InspectionRecord {
  reportNo: string;
  inspectors: string[];
  date: string;
  location: { lat: number; lng: number };
  type: string;
  status: string;
  followUp: string;
  trees: TreeItem[];
  notes: string;
  pictures: File[];
}

const defaultLocation = { lat: 0, lng: 0 };

export function useInspectionRecords() {
  const mockRecords: InspectionRecord[] = [
    {
      reportNo: "IR-001",
      inspectors: ["Alice", "Bob"],
      date: "2025-07-01",
      location: { lat: 14.5995, lng: 120.9842 },
      type: "Routine",
      status: "Living",
      followUp: "None",
      trees: [
        { name: "Acacia", quantity: 3 },
        { name: "Narra", quantity: 2 },
      ],
      notes: "Healthy trees, no issues.",
      pictures: [],
    },
    {
      reportNo: "IR-002",
      inspectors: ["Charlie"],
      date: "2025-07-15",
      location: { lat: 14.5547, lng: 121.0244 },
      type: "Follow-up",
      status: "Dead",
      followUp: "Replace dead tree",
      trees: [{ name: "Mahogany", quantity: 1 }],
      notes: "One tree dead, needs replacement.",
      pictures: [],
    },
  ];
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
  const [records, setRecords] = useState<InspectionRecord[]>(mockRecords);

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

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setRecord((r) => ({ ...r, pictures: Array.from(files) }));
    } else {
      setRecord((r) => ({ ...r, pictures: [] }));
    }
  };

  const handleSave = () => {
    setRecords((prev) => [...prev, record]);
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

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

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
    handleAddTree,
    handleAddInspector,
    handlePictureChange,
    handleSave,
    selectedIdx,
    setSelectedIdx,
  };
}
