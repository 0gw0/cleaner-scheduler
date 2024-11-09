import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Shift } from '@/types/task';
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, BuildingIcon } from 'lucide-react';
import Image from 'next/image'
import { PersonIcon } from '@radix-ui/react-icons';


interface TaskDetailModalProps {
  shiftData: Shift;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (updatedData: Shift) => Promise<void>;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ shiftData, isOpen, onClose, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false); 
  const [updatedShift, setUpdatedShift] = useState(shiftData); 
  const [currentStep, setCurrentStep] = useState(0); 
  const [assignmentType, setAssignmentType] = useState<'manual' | 'automatic'>('manual'); 

  const handleChange = (field: keyof Shift, value: any) => {
    setUpdatedShift((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSave = async () => {
    try {
      // TODO: Add API call to actually edit the shift
      await onEdit(updatedShift); 
      setIsEditing(false); 
      setCurrentStep(0); 
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
  
          {isEditing ? (
            // Multi-page form when editing
            <>
              {currentStep === 0 && (
                <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-bold col-span-1">Address:</span>
                  <span className="col-span-3 flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    {shiftData.property.address}
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-bold col-span-1">Postal code:</span>
                  <span className="col-span-3 flex items-center">
                    <BuildingIcon className="w-4 h-4 mr-2" />
                    {shiftData.property.postalCode}
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-bold col-span-1">Date:</span>
                  <span className="col-span-3 flex items-center">
                    <input
                      type="date"
                      value={updatedShift.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      className="border rounded px-2"
                    />
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-bold col-span-1">Start time:</span>
                  <span className="col-span-1 flex items-center">
                    <input
                      type="time"
                      value={updatedShift.startTime}
                      onChange={(e) => handleChange('startTime', e.target.value)}
                      className="border rounded px-2"
                    />   
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-bold col-span-1">End time:</span>
                  <span className="col-span-3 flex items-center">
                    <input
                      type="time"
                      value={updatedShift.endTime}
                      onChange={(e) => handleChange('endTime', e.target.value)}
                      className="border rounded px-2"
                    />                  
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-bold col-span-1">Workers needed:</span>
                  <span className="col-span-3 flex items-center">
                    <PersonIcon className="w-4 h-4 mr-2" />
                    {shiftData.workers.length}
                  </span>
                </div>
                  <div className="grid gap-2">
                    <span className="font-bold">Assignment Type:</span>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="assignmentType"
                          value="manual"
                          checked={assignmentType === 'manual'}
                          onChange={() => setAssignmentType('manual')}
                        />
                        <span>Manual</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="assignmentType"
                          value="automatic"
                          checked={assignmentType === 'automatic'}
                          onChange={() => setAssignmentType('automatic')}
                        />
                        <span>Automatic</span>
                      </label>
                    </div>
                  </div>
  
                  <div className="flex justify-end mt-4">
                    <Button onClick={handleNextStep}>Next</Button>
                  </div>
                </div>
              )}
  
              {currentStep === 1 && (
                <div className="grid gap-4 py-4">
                  {/* Step 2: Worker Assignment */}
                  {assignmentType === 'manual' ? (
                    <div>
                      <p>Available workers:</p>
                      {/* TODO: Link to backend to get available workers */}
                    </div>
                  ) : (
                    <div>
                      <p>Automatic Worker Assignment</p>
                      {/* Add logic for automatic worker assignment */}
                    </div>
                  )}
  
                  <div className="flex justify-between mt-4">
                    <Button onClick={handlePreviousStep}>Back</Button>
                    <Button onClick={handleNextStep}>Next</Button>
                  </div>
                </div>
              )}
  
              {currentStep === 2 && (
                <div className="grid gap-4 py-4">
                  {/* Step 3: Summary and Confirmation */}
                  <h3 className="font-semibold">Task Summary</h3>
                  <p>Address: {updatedShift.property.address}</p>
                  <p>Assignment Type: {assignmentType}</p>
                  {/* Other summary details... */}
                  <div className="flex justify-between mt-4">
                    <Button onClick={handlePreviousStep}>Back</Button>
                    <Button onClick={handleSave}>Confirm</Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold col-span-1">Address:</span>
                <span className="col-span-3 flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  {shiftData.property.address}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold col-span-1">Postal code:</span>
                <span className="col-span-3 flex items-center">
                  <BuildingIcon className="w-4 h-4 mr-2" />
                  {shiftData.property.postalCode}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold col-span-1">Date:</span>
                <span className="col-span-3 flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {shiftData.date}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold col-span-1">Start time:</span>
                <span className="col-span-1 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  {shiftData.startTime}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold col-span-1">End time:</span>
                <span className="col-span-3 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  {shiftData.endTime}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold col-span-1">Workers needed:</span>
                <span className="col-span-3 flex items-center">
                  <PersonIcon className="w-4 h-4 mr-2" />
                  {shiftData.workers.length}
                </span>
              </div>

              {/* Photo of proof */}
              {/* TO DO: Fetch URL of photo from db */}
              {/* Reminder: You need to add the URLs of the image to next.config.mjs file */}
              {(shiftData.status === "COMPLETED" || shiftData.status === "IN PROGRESS") &&
              <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold col-span-1">Arrival photo:</span>
                  <Image
                    src = "https://i.pinimg.com/736x/a5/38/d4/a538d48a27ac95d5e581f4df22d13fc3.jpg"
                    alt="Picture of the author"
                    width={300}
                    height={300}
                  />
              </div>}

              <div className="flex justify-between mt-4">
                {shiftData.status === "UPCOMING" && (
                  <Button variant="secondary" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                )}
                <Button onClick={onClose}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };