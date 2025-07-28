
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";
import InspectionRecordForm from "./components/InspectionRecordForm";
import InspectionRecordsTable from "./components/InspectionRecordsTable";
import InspectionRecordDetails from "./components/InspectionRecordDetails";
import { useInspectionRecords } from "./logic/useInspectionRecords";

export default function InspectionReports() {
    const {
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
    } = useInspectionRecords();

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavBarContainer dashboardType="urban-greening" />
                <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
                    <h1 className="text-2xl font-semibold text-gray-900">Inspection Reports</h1>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
                    <div className="px-6">
                        <ColorDivider />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        <div className="col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Inspection Records</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <InspectionRecordsTable records={records} selectedIdx={selectedIdx} setSelectedIdx={setSelectedIdx} />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="col-span-1">
                            <InspectionRecordDetails record={selectedIdx !== null ? records[selectedIdx] : null} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
