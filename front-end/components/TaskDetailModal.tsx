import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Shift } from '@/types/task';
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, BuildingIcon } from 'lucide-react';
import Image from 'next/image'


interface TaskDetailModalProps {
  shiftData: Shift;
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
          <span
          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs z-10 font-semibold ${
          shiftData.status === "COMPLETED"
            ? "bg-green-100 text-green-600"
            : shiftData.status === "IN PROGRESS"
            ? "bg-yellow-100 text-yellow-600"
            : "bg-blue-100 text-blue-600"
            }`}
          >
        {shiftData.status}
      </span>
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
              {shiftData.date}
            </span>
          </div>

          {/* Time */}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold col-span-1">Time:</span>
            <span className="col-span-3 flex items-center">
              <ClockIcon className="w-4 h-4 mr-2" />
              {shiftData.startTime} - {shiftData.endTime}
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

        {/* Photo of proof */}
        {/* TO DO: Fetch URL of photo from db */}
        {/* Reminder: You need to add the URLs of the image to next.config.mjs file */}
        {(shiftData.status === "COMPLETED" || shiftData.status === "IN PROGRESS") &&
        <div className="grid grid-cols-4 items-center gap-4">
        <span className="font-bold col-span-1">Photo:</span>
            <Image
              src = "https://i.pinimg.com/736x/a5/38/d4/a538d48a27ac95d5e581f4df22d13fc3.jpg"
              alt="Picture of the author"
              width={300}
              height={300}
            />
        </div>}
        
        
        <Button onClick={onClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
};
