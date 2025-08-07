import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/presentation/components/shared/ui/tabs";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";
import UrbanGreeningPlantingTab from "./components/UrbanGreeningPlantingTab";
import SaplingCollectionTab from "./components/SaplingCollectionTab";

const PlantingRecords: React.FC = () => {
    const [activeTab, setActiveTab] = useState("urban-greening");

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavBarContainer dashboardType="urban-greening" />

                {/* Header Section */}
                <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
                    <h1 className="text-2xl font-semibold text-gray-900">Planting Records</h1>
                </div>

                {/* Body Section */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
                    <div className="px-6">
                        <ColorDivider />
                    </div>

                    {/* Tabs Container */}
                    <div className="mt-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="urban-greening" className="text-sm font-medium">
                                    Urban Greening Planting
                                </TabsTrigger>
                                <TabsTrigger value="sapling-collection" className="text-sm font-medium">
                                    Plant Sapling Collection
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="urban-greening" className="space-y-4">
                                <UrbanGreeningPlantingTab />
                            </TabsContent>

                            <TabsContent value="sapling-collection" className="space-y-4">
                                <SaplingCollectionTab />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlantingRecords;
