import React from "react";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";
import VehicleSearchComponent from "./components/VehicleSearchComponent";
import RecordDetailsComponent from "./components/RecordDetailsComponent";
import ViolationFormModal from "./components/ViolationFormModal";
import RecordFormModal from "./components/RecordFormModal";
import { useSmokeBelcherData } from "./logic/useSmokeBelcherData";

export const SmokeBelcherManagement: React.FC = () => {
    const {
        // Data
        searchResults,
        selectedRecord,
        recordViolations,
        violationSummary,

        // Loading states
        isSearchLoading,
        isViolationsLoading,
        isCreatingViolation,
        isCreatingRecord,

        // Actions
        handleSearch,
        handleSelectRecord,
        createViolation,
        createRecord,

        // UI state
        activeTab,
        setActiveTab,
        isViolationModalOpen,
        setIsViolationModalOpen,
        isRecordModalOpen,
        setIsRecordModalOpen,
        refetchSearch,
    } = useSmokeBelcherData();

    const handleAddViolation = () => {
        if (selectedRecord) {
            setIsViolationModalOpen(true);
        }
    };

    const handleAddNewRecord = () => {
        setIsRecordModalOpen(true);
    };

    const handleViewPayment = () => {
        // TODO: Navigate to order of payment page
        console.log("Navigate to order of payment");
    };

    const handlePrintClearance = () => {
        // TODO: Generate and print clearance
        console.log("Print clearance");
    };

    const handleAddToCECQueue = () => {
        // TODO: Add to CEC queue
        console.log("Add to CEC queue");
    };

    const handleUpdateRecord = () => {
        // TODO: Implement update record functionality
        console.log("Update record", selectedRecord?.id);
    };

    const handleDeleteRecord = () => {
        // TODO: Implement delete record functionality
        if (selectedRecord && window.confirm(`Are you sure you want to delete record for ${selectedRecord.plate_number}?`)) {
            console.log("Delete record", selectedRecord.id);
        }
    };

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavBarContainer dashboardType="air-quality" />

                {/* Body Section */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 h-[calc(100vh-200px)]">
                        {/* Search Panel */}
                        <div className="lg:col-span-1">
                            <VehicleSearchComponent
                                searchResults={searchResults || []}
                                selectedRecord={selectedRecord}
                                isLoading={isSearchLoading}
                                onSearch={handleSearch}
                                onSelectRecord={handleSelectRecord}
                                onRefreshData={refetchSearch}
                            />
                        </div>

                        {/* Details Panel */}
                        <div className="lg:col-span-2">
                            <RecordDetailsComponent
                                selectedRecord={selectedRecord}
                                recordViolations={recordViolations || []}
                                violationSummary={violationSummary}
                                isViolationsLoading={isViolationsLoading}
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                                onAddViolation={handleAddViolation}
                                onViewPayment={handleViewPayment}
                                onPrintClearance={handlePrintClearance}
                                onAddToCECQueue={handleAddToCECQueue}
                                onUpdateRecord={handleUpdateRecord}
                                onDeleteRecord={handleDeleteRecord}
                            />
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <ViolationFormModal
                    isOpen={isViolationModalOpen}
                    onClose={() => setIsViolationModalOpen(false)}
                    onSubmit={createViolation}
                    recordId={selectedRecord?.id || null}
                    isSubmitting={isCreatingViolation}
                />

                <RecordFormModal
                    isOpen={isRecordModalOpen}
                    onClose={() => setIsRecordModalOpen(false)}
                    onSubmit={createRecord}
                    isSubmitting={isCreatingRecord}
                />
            </div>
        </div>
    );
};
