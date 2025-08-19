import React from "react";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";
import RecordsSearchComponent from "./components/RecordsSearchComponent";
import FilesManagementComponent from "./components/FilesManagementComponent";
import RecordDetailsPanel from "./components/RecordDetailsPanel";
import { useRecordsAndFilesData } from "./logic/useRecordsAndFilesData";

export const RecordsAndFiles: React.FC = () => {
    const {
        // Data
        searchResults,
        selectedRecord,
        files,

        // Loading states
        isSearchLoading,
        isFilesLoading,

        // Actions
        handleSearch,
        handleSelectRecord,
        handleFileUpload,
        handleFileDelete,
        handleFileDownload,

        // UI state
        activeTab,
        setActiveTab,
    } = useRecordsAndFilesData();

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavBarContainer dashboardType="air-quality" />

                {/* Body Section */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6 h-[calc(100vh-200px)]">

                        {/* Records Search Panel */}
                        <div className="lg:col-span-1">
                            <RecordsSearchComponent
                                searchResults={searchResults || []}
                                selectedRecord={selectedRecord}
                                isLoading={isSearchLoading}
                                onSearch={handleSearch}
                                onSelectRecord={handleSelectRecord}
                            />
                        </div>

                        {/* Record Details Panel */}
                        <div className="lg:col-span-2">
                            <RecordDetailsPanel
                                selectedRecord={selectedRecord}
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                            />
                        </div>

                        {/* Files Management Panel */}
                        <div className="lg:col-span-1">
                            <FilesManagementComponent
                                files={files || []}
                                selectedRecord={selectedRecord}
                                isLoading={isFilesLoading}
                                onFileUpload={handleFileUpload}
                                onFileDelete={handleFileDelete}
                                onFileDownload={handleFileDownload}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
