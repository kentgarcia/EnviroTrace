import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/presentation/components/shared/ui/dialog';
import { Button } from '@/presentation/components/shared/ui/button';
import { Input } from '@/presentation/components/shared/ui/input';
import { Textarea } from '@/presentation/components/shared/ui/textarea';
import { Badge } from '@/presentation/components/shared/ui/badge';
import { Calendar, MapPin, User, FileText, Clipboard, CheckCircle } from 'lucide-react';
import { MonitoringRequest } from '../logic/useMonitoringRequests';
import { toast } from 'sonner';

interface ActionWorkflowDialogProps {
    isOpen: boolean;
    onClose: () => void;
    actionType: string;
    requests: MonitoringRequest[];
    onExecuteAction: (actionType: string, data: any) => Promise<void>;
}

const ActionWorkflowDialog: React.FC<ActionWorkflowDialogProps> = ({
    isOpen,
    onClose,
    actionType,
    requests,
    onExecuteAction
}) => {
    const [formData, setFormData] = useState({
        scheduledDate: '',
        assignedTo: '',
        notes: '',
        priority: 'medium',
        estimatedDuration: '',
        resources: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getActionTitle = () => {
        switch (actionType) {
            case 'bulk_inspect': return 'Schedule Bulk Inspection';
            case 'schedule_maintenance': return 'Schedule Maintenance';
            case 'generate_report': return 'Generate Environmental Report';
            case 'plan_replacement': return 'Plan Replacement Planting';
            default: return 'Execute Action';
        }
    };

    const getActionDescription = () => {
        switch (actionType) {
            case 'bulk_inspect':
                return `Schedule field inspections for ${requests.length} monitoring locations to assess current environmental status.`;
            case 'schedule_maintenance':
                return `Plan maintenance activities for ${requests.length} locations with living plants.`;
            case 'generate_report':
                return `Generate comprehensive environmental impact report covering ${requests.length} monitoring points.`;
            case 'plan_replacement':
                return `Plan replacement planting for ${requests.length} locations with dead or removed vegetation.`;
            default:
                return `Execute action for ${requests.length} selected locations.`;
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const actionData = {
                ...formData,
                requestIds: requests.map(r => r.id),
                actionType,
                executedAt: new Date().toISOString(),
                locations: requests.map(r => ({
                    id: r.id,
                    title: r.title,
                    address: r.address,
                    location: r.location
                }))
            };

            await onExecuteAction(actionType, actionData);

            // Show success message based on action type
            const successMessage = {
                'bulk_inspect': 'Bulk inspection scheduled successfully',
                'schedule_maintenance': 'Maintenance activities scheduled',
                'generate_report': 'Report generation initiated',
                'plan_replacement': 'Replacement planning initiated'
            }[actionType] || 'Action executed successfully';

            toast.success(successMessage);
            onClose();
        } catch (error) {
            toast.error('Failed to execute action');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Clipboard className="h-5 w-5 mr-2 text-blue-500" />
                        {getActionTitle()}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Action Description */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">{getActionDescription()}</p>
                    </div>

                    {/* Affected Locations */}
                    <div>
                        <h4 className="font-medium mb-3">Affected Locations ({requests.length})</h4>
                        <div className="max-h-32 overflow-y-auto space-y-2">
                            {requests.slice(0, 5).map((request) => (
                                <div key={request.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                    <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>{request.title || `Request ${request.id.slice(-8)}`}</span>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {request.status}
                                    </Badge>
                                </div>
                            ))}
                            {requests.length > 5 && (
                                <div className="text-center text-sm text-gray-500 py-2">
                                    ... and {requests.length - 5} more locations
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Scheduled Date */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                <Calendar className="h-4 w-4 inline mr-1" />
                                Scheduled Date
                            </label>
                            <Input
                                type="date"
                                value={formData.scheduledDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        {/* Assigned To */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                <User className="h-4 w-4 inline mr-1" />
                                Assigned To
                            </label>
                            <Input
                                placeholder="Inspector/Team name"
                                value={formData.assignedTo}
                                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                            />
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Priority Level</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>

                        {/* Estimated Duration */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Estimated Duration</label>
                            <Input
                                placeholder="e.g., 2 hours, 1 day"
                                value={formData.estimatedDuration}
                                onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Resources Needed */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Resources Needed</label>
                        <Input
                            placeholder="Equipment, materials, team size, etc."
                            value={formData.resources}
                            onChange={(e) => setFormData(prev => ({ ...prev, resources: e.target.value }))}
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            <FileText className="h-4 w-4 inline mr-1" />
                            Additional Notes
                        </label>
                        <Textarea
                            placeholder="Special instructions, observations, or requirements..."
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !formData.scheduledDate || !formData.assignedTo}
                            className="flex items-center"
                        >
                            {isSubmitting ? (
                                'Processing...'
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Execute Action
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ActionWorkflowDialog;
