import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { useDriverQueryData } from "./logic/useDriverQueryData";
import DriverSearchComponent from "./components/DriverSearchComponent";
import DriverDetailsComponent from "./components/DriverDetailsComponent";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";

const DriverQuery: React.FC = () => {
    const {
        searchResults,
        selectedDriver,
        isSearchLoading,
        handleSearch,
        handleSelectDriver,
        handleCreateDriver,
        handleUpdateDriver,
        handleDeleteDriver,
        refetchDrivers,
    } = useDriverQueryData();

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavBarContainer dashboardType="air-quality" />

                {/* Body Section */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
                        {/* Driver Search Panel */}
                        <DriverSearchComponent
                            searchResults={searchResults}
                            selectedDriver={selectedDriver}
                            isLoading={isSearchLoading}
                            onSearch={handleSearch}
                            onSelectDriver={handleSelectDriver}
                            onRefreshData={refetchDrivers}
                        />

                        {/* Driver Details Panel */}
                        <DriverDetailsComponent
                            selectedDriver={selectedDriver}
                            onCreateDriver={handleCreateDriver}
                            onUpdateDriver={handleUpdateDriver}
                            onDeleteDriver={handleDeleteDriver}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverQuery;
