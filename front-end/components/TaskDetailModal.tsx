import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Shift, WorkerTravelData } from '@/types/task';
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, BuildingIcon, Check } from 'lucide-react';
import Image from 'next/image'
import { PersonIcon } from '@radix-ui/react-icons';
import axios from 'axios';
import { motion } from 'framer-motion';


interface TaskDetailModalProps {
  shiftData: Shift;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (updatedData: Shift) => Promise<void>;
  onTaskUpdate: () => void;
}

const fakeWorkerTravelData: WorkerTravelData[] = [
  {
    id: 1,
    name: "John Doe",
    travelTimeToTarget: {
      totalTravelTime: 45,
      travelTimeWithoutTraffic: 30,
      travelTimeInTraffic: 15,
    },
    relevantShift: {
      date: "2024-10-13",
      startTime: "09:00:00",
      endTime: "17:00:00",
    },
    originLocation: "123 Main St, Singapore",
  },
  {
    id: 2,
    name: "Jane Smith",
    travelTimeToTarget: {
      totalTravelTime: 30,
      travelTimeWithoutTraffic: 25,
      travelTimeInTraffic: 5,
    },
    relevantShift: {
      date: "2024-10-14",
      startTime: "10:00:00",
      endTime: "18:00:00",
    },
    originLocation: "456 Another St, Singapore",
  }]

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ shiftData, isOpen, onClose, onEdit, onTaskUpdate }) => {
  const [isEditing, setIsEditing] = useState(false); 
  const [updatedShift, setUpdatedShift] = useState(shiftData); 
  const [currentStep, setCurrentStep] = useState(0); 
  const [assignmentType, setAssignmentType] = useState<'manual' | 'automatic'>('manual'); 
  const [availableWorkers, setAvailableWorkers] = useState<WorkerTravelData[]>([])
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (field: keyof Shift, value: any) => {
    setUpdatedShift((prev) => ({ ...prev, [field]: value }));

    setUpdatedShift((prev) => ({ ...prev, [field]: value }));
  };


  const handleNextStep = async () => {
    if (currentStep === 0 && assignmentType === 'automatic') {
      // Make API call for automatic worker assignment
      const requestBody = {
        postalCode: shiftData.property.postalCode,
        startTime: {
          hour: parseInt(updatedShift.startTime.split(':')[0], 10),
          minute: parseInt(updatedShift.startTime.split(':')[1], 10),
          second: 0,
          nano: 0
        },
        endTime: {
          hour: parseInt(updatedShift.endTime.split(':')[0], 10),
          minute: parseInt(updatedShift.endTime.split(':')[1], 10),
          second: 0,
          nano: 0
        },
        date: updatedShift.date
      };

      try {
        //TODO: Add s behind to call api and replace all the fake data with real
        // const response = await axios.post('/shifts/available-worker', requestBody);
        // const workersData = response.data;
        const selectedWorkers = fakeWorkerTravelData.slice(0, shiftData.workers.length);
        setAvailableWorkers(selectedWorkers);
        console.log('Selected workers:', selectedWorkers);
      } catch (error) {
        console.error('Failed to fetch available workers:', error);
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSave = async () => {
    try {
      const workerIds = availableWorkers.map(worker => worker.id);
  
      const requestBody = {
        workerIds,
        newDate: updatedShift.date,
        newStartTime: updatedShift.startTime,
        newEndTime: updatedShift.endTime,
      };
  
      const response = await fetch(`http://localhost:8080/shifts/${shiftData.id}/update`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update shift: ${response.statusText}`);
      }
      await onEdit(updatedShift); 
      setIsEditing(false); 
      setShowSuccess(true)
      setCurrentStep(0); 
      onTaskUpdate();
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

          {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-8"
          >
            <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Task updated successfully!</p>
            <p className="text-sm text-gray-500">You will be redirected shortly.</p>
          </motion.div>
        ) :
  
          isEditing ? (
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
                  {assignmentType === 'manual' ? (
                    <div className="space-y-4">
                  </div>
                  ) : (
                    <div className="space-y-4">
                    <p>The following workers have been assigned:</p>
                    {availableWorkers.map((worker, index) => (
                      <motion.div
                        key={worker.id}
                        className="p-4 rounded-lg bg-black text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }} // Sequential delay for staggered appearance
                      >
                        <h3 className="font-semibold">{worker.name}</h3>
                        <p className="text-sm">Location: {worker.originLocation}</p>
                        <p className="text-sm">
                          Travel Time: {worker.travelTimeToTarget.totalTravelTime} mins
                        </p>
                      </motion.div>
                    ))}
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
                  <p>Client ID: {shiftData.property.clientId}</p>
                  <p>Property Address: {shiftData.property.id}</p>
                  <p>Date: {updatedShift.date}</p>
                  <p>Time: {updatedShift.startTime} - {updatedShift.endTime}</p>
                  <p>Selected workers: {availableWorkers.map(worker => worker.name).join(', ')}</p>
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