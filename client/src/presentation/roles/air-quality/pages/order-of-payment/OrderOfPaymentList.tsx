import React, { useState } from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useOrderOfPaymentData } from "./logic/useOrderOfPaymentData";
import OrderOfPaymentSearchComponent from "./components/OrderOfPaymentSearchComponent";
import OrderOfPaymentDetailsComponent from "./components/OrderOfPaymentDetailsComponent";
import VehicleSelectionDialog from "./components/VehicleSelectionDialog";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";

const OrderOfPaymentList: React.FC = () => {
    const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
    const [currentView, setCurrentView] = useState<'search' | 'details'>('search');
    const [newOrderData, setNewOrderData] = useState<any>(null);

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

    const handleOrderSelect = (order: any) => {
        handleSelectOrder(order);
        setNewOrderData(null);
        setCurrentView('details');
    };

    const handleAddOrder = () => {
        setIsVehicleDialogOpen(true);
    };

    const handleVehicleSelected = (vehicle: any, violations: any[]) => {
        setIsVehicleDialogOpen(false);
        setNewOrderData({ vehicle, violations });
        setCurrentView('details');
    };

    const handleBackToSearch = () => {
        setCurrentView('search');
        setNewOrderData(null);
        refetchOrders(); // Refresh the search results
    };

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavBarContainer dashboardType="air-quality" />

                {/* Body Section */}
                <div className="flex-1 overflow-hidden bg-[#F9FBFC]">
                    <div className="h-full space-y-2 p-2">
                        {currentView === 'search' ? (
                            <div className="h-full flex flex-col space-y-2">
                                {/* Header */}
                                <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-3">
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-900">Order of Payment</h1>
                                        <p className="text-gray-600 text-sm">Search and manage orders of payment</p>
                                    </div>
                                    <Button onClick={handleAddOrder} className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Order
                                    </Button>
                                </div>

                                {/* Search Component - Full Height */}
                                <div className="flex-1 min-h-0">
                                    <OrderOfPaymentSearchComponent
                                        searchResults={searchResults}
                                        selectedOrder={selectedOrder}
                                        isLoading={isSearchLoading}
                                        onSearch={handleSearch}
                                        onSelectOrder={handleOrderSelect}
                                        onRefreshData={refetchOrders}
                                        showAsFullPage={true}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col space-y-2">
                                {/* Details Header */}
                                <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-3">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={handleBackToSearch}
                                            className="flex items-center gap-2"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            Back to Search
                                        </Button>
                                        <div>
                                            <h1 className="text-xl font-bold text-gray-900">
                                                {selectedOrder
                                                    ? `Order Details - ${selectedOrder.oop_control_number}`
                                                    : 'New Order of Payment'
                                                }
                                            </h1>
                                            <p className="text-gray-600 text-sm">
                                                {selectedOrder ? 'View and edit order details' : 'Create a new order of payment'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Details Component - Full Height */}
                                <div className="flex-1 min-h-0">
                                    <OrderOfPaymentDetailsComponent
                                        selectedOrder={selectedOrder}
                                        newOrderData={newOrderData}
                                        onCreateOrder={handleCreateOrder}
                                        onUpdateOrder={handleUpdateOrder}
                                        onDeleteOrder={handleDeleteOrder}
                                        showAsFullPage={true}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Vehicle Selection Dialog */}
                        <VehicleSelectionDialog
                            isOpen={isVehicleDialogOpen}
                            onClose={() => setIsVehicleDialogOpen(false)}
                            onVehicleSelected={handleVehicleSelected}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderOfPaymentList;
