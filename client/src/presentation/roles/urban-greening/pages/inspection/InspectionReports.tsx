import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Alert, AlertDescription } from "@/presentation/components/shared/ui/alert";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";
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
        loading,
        error,
        handleAddTree,
        handleAddInspector,
        handleRemoveTree,
        handleRemoveInspector,
        handlePictureChange,
        handleSave,
        handleEdit,
        handleDelete,
        handleCancelEdit,
        handleStartAdd,
        handleSelectRecord,
        selectedIdx,
        isEditing,
        isAdding,
        loadRecords,
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

                    {error && (
                        <div className="mt-6">
                            <Alert className="border-red-200 bg-red-50">
                                <AlertDescription className="text-red-700">
                                    {error}
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={loadRecords}
                                        className="ml-2 h-auto p-0 text-red-700 underline"
                                    >
                                        Try Again
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle>Inspection Records</CardTitle>
                                    <Button
                                        onClick={handleStartAdd}
                                        size="sm"
                                        disabled={loading}
                                    >
                                        Add New Record
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {loading && records.length === 0 ? (
                                        <div className="flex items-center justify-center h-32">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                                <p className="mt-2 text-sm text-gray-600">Loading records...</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <InspectionRecordsTable
                                            records={records}
                                            selectedIdx={selectedIdx}
                                            setSelectedIdx={handleSelectRecord}
                                            loading={loading}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-1">
                            <InspectionRecordDetails
                                record={selectedIdx !== null ? records[selectedIdx] : null}
                                recordIndex={selectedIdx}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                loading={loading}
                                isEditing={isEditing}
                                isAdding={isAdding}
                                formRecord={record}
                                setFormRecord={setRecord}
                                treeName={treeName}
                                setTreeName={setTreeName}
                                treeQty={treeQty}
                                setTreeQty={setTreeQty}
                                inspectorInput={inspectorInput}
                                setInspectorInput={setInspectorInput}
                                handleAddTree={handleAddTree}
                                handleAddInspector={handleAddInspector}
                                handleRemoveTree={handleRemoveTree}
                                handleRemoveInspector={handleRemoveInspector}
                                handlePictureChange={handlePictureChange}
                                handleSave={handleSave}
                                handleCancelEdit={handleCancelEdit}
                                onStartAdd={handleStartAdd}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
