import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useOrderOfPaymentData } from "./logic/useOrderOfPaymentData";
import OrderOfPaymentSearchComponent from "./components/OrderOfPaymentSearchComponent";
import OrderOfPaymentDetailsComponent from "./components/OrderOfPaymentDetailsComponent";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";

const OrderOfPayment: React.FC = () => {
    const [isSearchPanelVisible, setIsSearchPanelVisible] = useState(true);

    const {
        searchResults,
        selectedOrder,
        isSearchLoading,
        handleSearch,
        handleSelectOrder,
        handleCreateOrder,
        handleUpdateOrder,
        handleDeleteOrder,
        refetchOrders,
    } = useOrderOfPaymentData();

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavBarContainer dashboardType="air-quality" />

                {/* Body Section */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
                    <div className="flex gap-4 h-[calc(100vh-200px)]">
                        {/* Toggle Button for when search is hidden */}
                        {!isSearchPanelVisible && (
                            <div className="flex flex-col">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsSearchPanelVisible(true)}
                                    className="mb-4"
                                >
                                    <ChevronRight className="h-4 w-4 mr-2" />
                                    Show Search
                                </Button>
                            </div>
                        )}

                        {/* Order of Payment Search Panel */}
                        {isSearchPanelVisible && (
                            <div className="w-96 flex-shrink-0">
                                <OrderOfPaymentSearchComponent
                                    searchResults={searchResults}
                                    selectedOrder={selectedOrder}
                                    isLoading={isSearchLoading}
                                    onSearch={handleSearch}
                                    onSelectOrder={handleSelectOrder}
                                    onRefreshData={refetchOrders}
                                    onToggleVisibility={() => setIsSearchPanelVisible(false)}
                                />
                            </div>
                        )}

                        {/* Order of Payment Details Panel */}
                        <div className="flex-1 min-w-0">
                            <OrderOfPaymentDetailsComponent
                                selectedOrder={selectedOrder}
                                onCreateOrder={handleCreateOrder}
                                onUpdateOrder={handleUpdateOrder}
                                onDeleteOrder={handleDeleteOrder}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderOfPayment;
