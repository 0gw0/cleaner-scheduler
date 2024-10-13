import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ShiftData } from '@/types/task';
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, BuildingIcon } from 'lucide-react';

interface TaskDetailModalProps {
  shiftData: ShiftData;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ shiftData, isOpen, onClose }) => {
  // Helper function to format time in HH:mm format
  const formatTime = (time: { hour: number; minute: number }) => {
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>Detailed information about the selected task.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Property Address */}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold col-span-1">Address:</span>
            <span className="col-span-3 flex items-center">
              <MapPinIcon className="w-4 h-4 mr-2" />
              {shiftData.property.address}
            </span>
          </div>

          {/* Postal Code */}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold col-span-1">Postal Code:</span>
            <span className="col-span-3 flex items-center">
              <BuildingIcon className="w-4 h-4 mr-2" />
              {shiftData.property.postalCode}
            </span>
          </div>

          {/* Date */}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold col-span-1">Date:</span>
            <span className="col-span-3 flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {shiftData.date.toDateString()}
            </span>
          </div>

          {/* Time */}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold col-span-1">Time:</span>
            <span className="col-span-3 flex items-center">
              <ClockIcon className="w-4 h-4 mr-2" />
              {formatTime(shiftData.startTime)} - {formatTime(shiftData.endTime)}
            </span>
          </div>

          {/* Worker ID */}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold col-span-1">Worker:</span>
            <span className="col-span-3 flex items-center">
              <UserIcon className="w-4 h-4 mr-2" />
              Worker ID: {shiftData.worker}
            </span>
          </div>

          {/* Client ID */}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold col-span-1">Client ID:</span>
            <span className="col-span-3 flex items-center">
              <UserIcon className="w-4 h-4 mr-2" />
              Client ID: {shiftData.property.clientId}
            </span>
          </div>
        </div>
        <Button onClick={onClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
};
