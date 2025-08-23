import React from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Button } from "@/presentation/components/shared/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/presentation/components/shared/ui/table";
import StatCard from "@/presentation/components/shared/StatCard";
import { Edit, Plus, AlertTriangle, CheckCircle, Lock, TestTube } from "lucide-react";

interface Fee {
    id: number;
    amount: number;
    category: string;
    level: number;
    effective_date: string;
    created_at: string;
    updated_at: string;
}

interface FeeStructureDisplayProps {
    fees: Fee[];
    onEditFee: (fee: Fee) => void;
    onEditPenaltyFees: (category: string, fees: Fee[]) => void;
    onAddFee: (category: string, level: number) => void;
    isLoading: boolean;
}

const FeeStructureDisplay: React.FC<FeeStructureDisplayProps> = ({
    fees,
    onEditFee,
    onEditPenaltyFees,
    onAddFee,
    isLoading,
}) => {
    // Organize fees by category and level
    const baseFees = fees.filter(fee => fee.level === 0);
    const penaltyFees = fees.filter(fee => fee.level > 0);

    const getFeeByCategory = (category: string, level: number = 0) => {
        return fees.find(fee => fee.category === category && fee.level === level);
    };

    const formatAmount = (amount: number) => `₱${amount.toLocaleString()}`;

    const BaseFeeStatCard = ({
        title,
        category,
        description,
        icon: Icon
    }: {
        title: string;
        category: string;
        description: string;
        icon: React.ComponentType<{ className?: string; color?: string }>;
    }) => {
        const fee = getFeeByCategory(category, 0);

        return (
            <div className="relative">
                <StatCard
                    label={title}
                    value={fee ? formatAmount(fee.amount) : "Not Set"}
                    Icon={Icon}
                    loading={isLoading}
                />
                {fee && (
                    <div className="absolute top-2 right-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditFee(fee)}
                            className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
                        >
                            <Edit className="h-3 w-3" />
                        </Button>
                    </div>
                )}
                {!fee && (
                    <div className="absolute bottom-2 right-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAddFee(category, 0)}
                            className="h-7 text-xs bg-white/80 hover:bg-white"
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    const PenaltyFeesTable = () => {
        const categories = [
            { key: 'driver', label: 'Driver Penalties' },
            { key: 'operator', label: 'Operator Penalties' }
        ];

        const getCategoryFees = (category: string) => {
            return [1, 2, 3].map(level => getFeeByCategory(category, level)).filter(Boolean) as Fee[];
        };

        const hasCategoryFees = (category: string) => {
            return getCategoryFees(category).length > 0;
        };

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Penalty Fees</h3>
                            <p className="text-sm text-muted-foreground font-normal">
                                Graduated penalties based on offense level
                            </p>
                        </div>
                        <Badge variant="outline">Levels 1-3</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-center">1st Offense</TableHead>
                                <TableHead className="text-center">2nd Offense</TableHead>
                                <TableHead className="text-center">3rd Offense</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map(({ key, label }) => (
                                <TableRow key={key}>
                                    <TableCell className="font-medium">{label}</TableCell>
                                    {[1, 2, 3].map(level => {
                                        const fee = getFeeByCategory(key, level);
                                        return (
                                            <TableCell key={level} className="text-center">
                                                {fee ? (
                                                    <div className="space-y-1">
                                                        <div className="font-semibold text-blue-600">
                                                            {formatAmount(fee.amount)}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {new Date(fee.effective_date).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onAddFee(key, level)}
                                                        className="h-8 text-xs"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Add
                                                    </Button>
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell className="text-center">
                                        {hasCategoryFees(key) ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onEditPenaltyFees(key, getCategoryFees(key))}
                                                className="h-8 px-3"
                                                title={`Edit all ${label.toLowerCase()}`}
                                            >
                                                <Edit className="h-3 w-3 mr-1" />
                                                Edit All
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">No fees set</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Base Fees Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold">Base Fees</h3>
                        <p className="text-sm text-muted-foreground">
                            Fixed fees that apply regardless of offense level
                        </p>
                    </div>
                    <Badge variant="outline">Level 0</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <BaseFeeStatCard
                        title="Apprehension Fee"
                        category="apprehension"
                        description="Fee for vehicle apprehension during smoke belching test"
                        icon={AlertTriangle}
                    />
                    <BaseFeeStatCard
                        title="Voluntary Fee"
                        category="voluntary"
                        description="Fee for voluntary smoke belching test"
                        icon={CheckCircle}
                    />
                    <BaseFeeStatCard
                        title="Impound Fee"
                        category="impound"
                        description="Fee for vehicle impounding"
                        icon={Lock}
                    />
                    <BaseFeeStatCard
                        title="Testing Fee"
                        category="testing"
                        description="Fee for smoke density testing service"
                        icon={TestTube}
                    />
                </div>
            </div>

            {/* Penalty Fees Section */}
            <PenaltyFeesTable />

            {/* Summary Section */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-blue-600">{baseFees.length}/4</div>
                            <div className="text-xs text-blue-600">Base Fees Set</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-600">{penaltyFees.filter(f => f.category === 'driver').length}/3</div>
                            <div className="text-xs text-green-600">Driver Penalties</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-purple-600">{penaltyFees.filter(f => f.category === 'operator').length}/3</div>
                            <div className="text-xs text-purple-600">Operator Penalties</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-600">{fees.length}/10</div>
                            <div className="text-xs text-gray-600">Total Fees</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default FeeStructureDisplay;
