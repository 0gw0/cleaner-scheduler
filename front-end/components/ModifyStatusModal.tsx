import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from './ui/button';

interface ModifyStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  workers: number[];
  currentStatus: string;
  onStatusChange: (status: string) => void;
  onWorkerSelectionChange: (selectedWorkers: number[]) => void;
  presentWorkers: number[]
}

const ModifyStatusModal: React.FC<ModifyStatusModalProps> = ({ 
  isOpen, 
  onClose, 
  workers, 
  currentStatus, 
  onStatusChange, 
  onWorkerSelectionChange,
  presentWorkers
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<number[]>([]);

  const statusOptions = [
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value);
    onStatusChange(event.target.value);
  };

  const toggleWorkerSelection = (workerId: number) => {
    setSelectedWorkerIds(prevSelected => {
      if (prevSelected.includes(workerId)) {
        return prevSelected.filter(id => id !== workerId);
      } else {
        return [...prevSelected, workerId];
      }
    });
  };

  const handleSave = () => {
    onWorkerSelectionChange(selectedWorkerIds);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modify Status and Attendance</DialogTitle>
          <DialogDescription>
            Update the status of the shift and modify assigned workers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Change Status:</label>
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Select Present Workers:</label>
            <div className="space-y-2">
                {workers.map(worker => (
                <div key={worker} className="flex items-center">
                    <Checkbox
                    checked={selectedWorkerIds.includes(worker) || (presentWorkers?.includes(worker) ?? false)}
                    disabled={presentWorkers?.includes(worker) ?? false}
                    onCheckedChange={() => {
                        if (!presentWorkers?.includes(worker)) {
                        toggleWorkerSelection(worker);
                        }
                    }}
                    id={`worker-${worker}`}
                    />
                    <label htmlFor={`worker-${worker}`} className="ml-2">
                    {worker}
                    </label>
                </div>
                ))}
            </div>
            </div>

          <DialogFooter className="flex justify-end mt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button variant="default" onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModifyStatusModal;
