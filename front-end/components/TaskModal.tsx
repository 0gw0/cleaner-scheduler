import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { WorkerTravelData, ShiftData } from '@/types/task';

const TaskModal: React.FC<{ shiftData: ShiftData; workerData: WorkerTravelData[]; onClose: () => void; onConfirm: (worker: WorkerTravelData) => void; }> = ({
  shiftData,
  workerData,
  onClose,
  onConfirm,
}) => {
  const [selectedWorker, setSelectedWorker] = useState<WorkerTravelData | null>(null);

  return (
    <Dialog onClose={onClose} isOpen={!!shiftData}>
      <DialogHeader>
        <h2 className="text-lg font-bold">Shift Details (ID: {shiftData.id})</h2>
      </DialogHeader>
      <DialogContent>
        <div className="space-y-4">
          <p className="text-sm">
            <strong>Client:</strong> {shiftData.property.address}
          </p>
          <p className="text-sm">
            <strong>Date:</strong> {shiftData.date.toString()}
          </p>
          <p className="text-sm">
            <strong>Time:</strong> {`${shiftData.startTime.hour}:${shiftData.startTime.minute}`} - {`${shiftData.endTime.hour}:${shiftData.endTime.minute}`}
          </p>
          
          <h3 className="text-base font-semibold">Available Workers</h3>
          <div className="space-y-2">
            {workerData.map(worker => (
              <div
                key={worker.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedWorker?.id === worker.id ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => setSelectedWorker(worker)}
              >
                <h4 className="text-sm font-semibold">{worker.name}</h4>
                <p className="text-sm">Previous Location: {worker.originLocation}</p>
                <p className="text-sm">Estimated Arrival: {worker.travelTimeToTarget.totalTravelTime} mins</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={!selectedWorker} onClick={() => selectedWorker && onConfirm(selectedWorker)}>
          Confirm Selection {selectedWorker ? `: ${selectedWorker.name}` : ''}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default TaskModal;
