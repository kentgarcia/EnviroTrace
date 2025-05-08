import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { SeedlingRequest, SeedlingRequestInput } from "@/hooks/urban/useSeedlingRequests";
import { Pencil } from "lucide-react";

interface SeedlingRequestDetailsProps {
    request: SeedlingRequest | null;
    onEdit?: (data: SeedlingRequestInput) => void;
    isEditing?: boolean;
}

export const SeedlingRequestDetails: React.FC<SeedlingRequestDetailsProps> = ({
    request,
    onEdit,
    isEditing = false
}) => {
    const [activeTab, setActiveTab] = useState("details");

    if (!request) return null;

    // Format date
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return format(date, "MMMM dd, yyyy");
        } catch (error) {
            return "Invalid date";
        }
    };

    // Calculate total quantity of all items
    const totalQuantity = request.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">{request.requesterName}</h2>
                    <p className="text-muted-foreground">{formatDate(request.dateReceived)}</p>
                </div>
                {onEdit && (
                    <Button variant="outline" size="sm" onClick={() => onEdit(request)}>
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                    </Button>
                )}
            </div>

            <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="details">Request Details</TabsTrigger>
                    <TabsTrigger value="items">Seedling Items</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Request ID</h3>
                            <p>{request.id}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Date Received</h3>
                            <p>{formatDate(request.dateReceived)}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Requester Name</h3>
                            <p>{request.requesterName}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Total Items Requested</h3>
                            <p>{totalQuantity} seedlings ({request.items.length} varieties)</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                        <p>{request.address}</p>
                    </div>

                    {request.notes && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                            <p className="whitespace-pre-line">{request.notes}</p>
                        </div>
                    )}

                    <div className="space-y-2 pt-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                        <p>{formatDate(request.createdAt)}</p>
                    </div>

                    {request.updatedAt !== request.createdAt && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                            <p>{formatDate(request.updatedAt)}</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="items" className="pt-4">
                    <Card>
                        <CardContent className="pt-6">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="pb-2 text-left">Name/Variety</th>
                                        <th className="pb-2 text-right">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {request.items.map((item, index) => (
                                        <tr key={index} className="border-b last:border-0">
                                            <td className="py-3">{item.name}</td>
                                            <td className="py-3 text-right">{item.quantity}</td>
                                        </tr>
                                    ))}
                                    <tr className="font-medium">
                                        <td className="py-3">Total</td>
                                        <td className="py-3 text-right">{totalQuantity}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};