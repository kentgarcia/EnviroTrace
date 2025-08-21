import React, { useEffect, useState } from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { ArrowLeft } from "lucide-react";
import { useOrderOfPaymentData } from "./logic/useOrderOfPaymentData";
import OrderOfPaymentDetailsComponent from "./components/OrderOfPaymentDetailsComponent";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";

const OrderOfPaymentDetails: React.FC = () => {
    // Get orderId from URL pathname
    const orderId = window.location.pathname.split('/').pop();
    const isNewOrder = orderId === 'new';
    const [newOrderData, setNewOrderData] = useState<any>(null);

    const {
        selectedOrder,
        handleSelectOrder,
        handleCreateOrder,
        handleUpdateOrder,
        handleDeleteOrder,
        searchResults,
    } = useOrderOfPaymentData();

    useEffect(() => {
        if (isNewOrder) {
            // Check for new order data from sessionStorage
            const storedData = sessionStorage.getItem('newOrderData');
            if (storedData) {
                const data = JSON.parse(storedData);
                setNewOrderData(data);
                sessionStorage.removeItem('newOrderData'); // Clean up
            }
        } else if (orderId && !selectedOrder) {
            // If we have an orderId but no selectedOrder, find it from searchResults or fetch it
            const order = searchResults.find(order => order.id === orderId);
            if (order) {
                handleSelectOrder(order);
            }
            // Note: In a real app, you might want to fetch the order by ID if not found in search results
        }
    }, [orderId, isNewOrder, selectedOrder, searchResults, handleSelectOrder]);

    const handleBackToList = () => {
        window.location.href = '/air-quality/order-of-payment';
    };

    if (!selectedOrder && !isNewOrder) {
        return (
            <div className="flex min-h-screen w-full">
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopNavBarContainer dashboardType="air-quality" />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-lg text-muted-foreground mb-4">No order selected or order not found</p>
                            <Button onClick={handleBackToList}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Order List
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isNewOrder && !newOrderData) {
        return (
            <div className="flex min-h-screen w-full">
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopNavBarContainer dashboardType="air-quality" />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-lg text-muted-foreground mb-4">No vehicle data found for new order</p>
                            <Button onClick={handleBackToList}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Order List
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavBarContainer dashboardType="air-quality" />

                {/* Body Section - Maximized */}
                <div className="flex-1 overflow-y-auto p-4 bg-[#F9FBFC]">
                    <div className="w-full max-w-none">
                        {/* Header with back button */}
                        <div className="mb-6">
                            <Button
                                variant="outline"
                                onClick={handleBackToList}
                                className="mb-4"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Order List
                            </Button>
                            <h1 className="text-2xl font-bold">
                                {isNewOrder
                                    ? `New Order of Payment - ${newOrderData?.vehicle?.plate_number || 'Vehicle'}`
                                    : `Order of Payment Details - ${selectedOrder?.oop_control_number || 'Unknown'}`
                                }
                            </h1>
                        </div>

                        {/* Details Component */}
                        <OrderOfPaymentDetailsComponent
                            selectedOrder={isNewOrder ? null : selectedOrder}
                            newOrderData={isNewOrder ? newOrderData : null}
                            onCreateOrder={handleCreateOrder}
                            onUpdateOrder={handleUpdateOrder}
                            onDeleteOrder={handleDeleteOrder}
                            showAsFullPage={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderOfPaymentDetails;
