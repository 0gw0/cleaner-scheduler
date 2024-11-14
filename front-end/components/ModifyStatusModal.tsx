import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from './ui/button';
import axios from 'axios';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ModifyStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  workers: number[];
  currentStatus: string;
  onStatusChange: (status: string) => void;
  onWorkerSelectionChange: (selectedWorkers: number[]) => void;
  presentWorkers: number[]
  shiftId: number;
  refetchAfterChange: () => void;
}

const ModifyStatusModal: React.FC<ModifyStatusModalProps> = ({ 
  isOpen, 
  onClose, 
  workers, 
  currentStatus, 
  onStatusChange, 
  onWorkerSelectionChange,
  presentWorkers,
  shiftId,
  refetchAfterChange
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const statusOptions = [
    { value: 'ABSENT', label: 'Absent' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value);
    onStatusChange(event.target.value);
    console.log("selectedStatus",selectedStatus)
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

  const handleSave = async () => {
    try {
        await axios.put(`http://localhost:8080/shifts/${shiftId}/update-status`, null, {
        params: {
          status: selectedStatus,
          workerIds: [...selectedWorkerIds,...presentWorkers].join(','),
        },
      });
      
      setShowSuccess(true)
      onWorkerSelectionChange(selectedWorkerIds);

      await refetchAfterChange();

      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Failed to update shift status:', error);
    }
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
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8"
            >
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Status and attendance updated successfully!</p>
            </motion.div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Change Status:</label>
                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {(currentStatus === "ABSENT" ? [statusOptions[0], statusOptions[1]] : currentStatus === "IN_PROGRESS" ? [statusOptions[1], statusOptions[2]] : [])
                    .map(option => (
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default ModifyStatusModal;
