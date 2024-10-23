import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Shift } from '@/types/task';
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, BuildingIcon } from 'lucide-react';

interface TaskDetailModalProps {
  shiftData: Shift;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (updatedData: Shift) => Promise<void>; // API call function
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ shiftData, isOpen, onClose, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false); // Track edit mode
  const [updatedShift, setUpdatedShift] = useState(shiftData); // Track changes

  // Handle field changes
  const handleChange = (field: keyof Shift, value: any) => {
    setUpdatedShift((prev) => ({ ...prev, [field]: value }));
  };

  // Save changes and call the API
  const handleSave = async () => {
    try {
      await onEdit(updatedShift); // Call API to save changes
      setIsEditing(false); // Exit edit mode on success
    } catch (error) {
      console.error('Failed to update shift:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>Detailed information about the selected task.</DialogDescription>
          <span
            className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs z-10 font-semibold ${
              shiftData.status === 'COMPLETED'
                ? 'bg-green-100 text-green-600'
                : shiftData.status === 'IN PROGRESS'
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-blue-100 text-blue-600'
            }`}
          >
            {shiftData.status}
          </span>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Address */}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold col-span-1">Address:</span>
            <span className="col-span-3 flex items-center">
              <MapPinIcon className="w-4 h-4 mr-2" />
              {isEditing ? (
                <input
                  type="text"
                  value={updatedShift.property.address}
                  onChange={(e) => handleChange('property', { ...updatedShift.property, address: e.target.value })}
                  className="border rounded px-2"
                />
              ) : (
                shiftData.property.address
              )}
            </span>
          </div>

          {/* Postal Code */}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold col-span-1">Postal Code:</span>
            <span className="col-span-3 flex items-center">
              <BuildingIcon className="w-4 h-4 mr-2" />
              {isEditing ? (
                <input
                  type="text"
                  value={updatedShift.property.postalCode}
                  onChange={(e) => handleChange('property', { ...updatedShift.property, postalCode: e.target.value })}
                  className="border rounded px-2"
                />
              ) : (
                shiftData.property.postalCode
              )}
            </span>
          </div>

          {/* Date */}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold col-span-1">Date:</span>
            <span className="col-span-3 flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {isEditing ? (
                <input
                  type="date"
                  value={updatedShift.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="border rounded px-2"
                />
              ) : (
                shiftData.date
              )}
            </span>
          </div>

          {/* Time */}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold col-span-1">Time:</span>
            <span className="col-span-3 flex items-center">
              <ClockIcon className="w-4 h-4 mr-2" />
              {isEditing ? (
                <>
                  <input
                    type="time"
                    value={updatedShift.startTime}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                    className="border rounded px-2"
                  />
                  <span className="mx-2">-</span>
                  <input
                    type="time"
                    value={updatedShift.endTime}
                    onChange={(e) => handleChange('endTime', e.target.value)}
                    className="border rounded px-2"
                  />
                </>
              ) : (
                `${shiftData.startTime} - ${shiftData.endTime}`
              )}
            </span>
          </div>

          {/* Worker */}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold col-span-1">Worker:</span>
            <span className="col-span-3 flex items-center">
              <UserIcon className="w-4 h-4 mr-2" />
              {isEditing ? (
                <input
                  type="text"
                  value={updatedShift.worker}
                  onChange={(e) => handleChange('worker', e.target.value)}
                  className="border rounded px-2"
                />
              ) : (
                `Worker ID: ${shiftData.worker}`
              )}
            </span>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          {isEditing ? (
            <Button variant="default" onClick={handleSave}>
              Save Changes
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
