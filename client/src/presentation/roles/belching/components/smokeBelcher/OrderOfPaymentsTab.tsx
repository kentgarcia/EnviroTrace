import React, { useEffect, useState } from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Receipt, ExternalLink } from "lucide-react";
import { fetchOrderOfPayments } from "@/lib/api/order-of-payments-api";
import { useNavigate } from "@tanstack/react-router";

interface OrderOfPaymentsTabProps {
    recordId: number;
    plateNumber: string;
}

const OrderOfPaymentsTab: React.FC<OrderOfPaymentsTabProps> = ({ recordId, plateNumber }) => {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        fetchOrderOfPayments()
            .then(data => {
                // Filter payments for this record's plate number
                const filteredPayments = data.filter(
                    (payment: any) => payment.plateNo === plateNumber
                );
                setPayments(filteredPayments);
            })
            .catch(() => setError("Failed to load order of payments."))
            .finally(() => setLoading(false));
    }, [recordId, plateNumber]);

    const handleCreateOrderOfPayment = () => {
        navigate({ to: "/smoke-belching/order-of-payment-entry" });
    };

    return (
        <div className="bg-white border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-lg text-gray-800">Order of Payments</div>
                <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleCreateOrderOfPayment}
                >
                    <Receipt size={16} className="mr-2" /> Create New Order
                </Button>
            </div>

            {loading && <div className="text-gray-500">Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}

            {!loading && !error && (
                <div>
                    {payments.length === 0 ? (
                        <div className="py-4 text-gray-500 text-center border rounded-md">
                            No order of payments found for this vehicle.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <th className="px-4 py-2 border">Order No.</th>
                                        <th className="px-4 py-2 border">Date Issued</th>
                                        <th className="px-4 py-2 border">Amount</th>
                                        <th className="px-4 py-2 border">Status</th>
                                        <th className="px-4 py-2 border text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {payments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td className="px-4 py-2 border whitespace-nowrap">
                                                {payment.orderNo}
                                            </td>
                                            <td className="px-4 py-2 border whitespace-nowrap">
                                                {payment.dateIssued}
                                            </td>
                                            <td className="px-4 py-2 border whitespace-nowrap">
                                                ₱{payment.amount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-2 border whitespace-nowrap">
                                                <span
                                                    className={
                                                        payment.status === "Paid"
                                                            ? "text-green-600 font-semibold"
                                                            : "text-red-600 font-semibold"
                                                    }
                                                >
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 border text-center">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 p-0 text-blue-600"
                                                    onClick={() => navigate({
                                                        to: "/smoke-belching/order-of-payment-entry",
                                                        search: { id: payment.id }
                                                    })}
                                                >
                                                    <ExternalLink size={16} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderOfPaymentsTab;
