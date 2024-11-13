import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Shift, WorkerTravelData } from '@/types/task';
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, BuildingIcon, Check, TimerIcon, Clock, PersonStanding, X } from 'lucide-react';
import Image from 'next/image'
import { PersonIcon } from '@radix-ui/react-icons';
import axios from 'axios';
import { motion } from 'framer-motion';
import { WorkerData } from '@/types/dashboard';
import { validateShift } from '@/utils/timeUtils';

interface TaskDetailModalProps {
  shiftData: Shift;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (updatedData: Shift) => Promise<void>;
  onTaskUpdate: () => void;
}


export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ shiftData, isOpen, onClose, onEdit, onTaskUpdate }) => {
  const [isEditing, setIsEditing] = useState(false); 
  const [updatedShift, setUpdatedShift] = useState(shiftData); 
  const [currentStep, setCurrentStep] = useState(0); 
  const [assignmentType, setAssignmentType] = useState<'manual' | 'automatic'>('manual'); 
  const [availableWorkers, setAvailableWorkers] = useState<WorkerTravelData[]>([]); // this is for automatic
  const [topFiveWorkers, setTopFiveWorkers] = useState<WorkerTravelData[]>([]); // this is for automatic
  const [selectedWorkers, setSelectedWorkers] = useState<WorkerData[]>([]); // this is for manual selected
  const [showSuccess, setShowSuccess] = useState(false);
  const [workerChoice, setWorkerChoice] = useState<WorkerData[]>([]); // these are choices given if manual selected
  const [error, setError] = useState("");
  const [showFailure, setShowFailure] = useState(false); //not available to perform update because no available workers
  const [searchTerm, setSearchTerm] = useState(''); 
  const [travelTimes, setTravelTimes] = useState<{ [workerId: number]: number }>({});

  const handleRetrieveTravelTime = async (workerId : number, targetPostalCode : string, date : string, startTime : string, endTime : string) => {
    try {
      const response = await axios.get(`http://localhost:8080/workers/${workerId}/travel-time`, {
        params: {
          targetPostalCode: targetPostalCode,
          date: date,
          startTime: startTime,
          endTime: endTime,
        },
      });
      const travelTime = response.data.travelTimeToTarget.totalTravelTime; 
  
      setTravelTimes((prev) => ({
        ...prev,
        [workerId]: travelTime,
      }));
    } catch (error) {
      console.error(`Error retrieving travel time for worker ID ${workerId}:`, error);
    }
  };

  console.log("travelTimes", travelTimes)
  

  const handleChange = (field: keyof Shift, value: any) => {
    setUpdatedShift((prev) => ({ ...prev, [field]: value }));

    setUpdatedShift((prev) => ({ ...prev, [field]: value }));
  };

  const toggleWorkerSelection = (worker: WorkerData) => {
    setSelectedWorkers((prevSelected) => {
      if (prevSelected.some((selectedWorker) => selectedWorker.id === worker.id)) {
        return prevSelected.filter((selectedWorker) => selectedWorker.id !== worker.id);
      } else {
        return [...prevSelected, worker];
      }
    });
  };

  const handleNextStep = async () => {
    setError("")

    const validationError = validateShift(updatedShift.startTime, updatedShift.endTime, updatedShift.date);
    if (validationError) {
      setError(validationError); 
      return
    } else {
      setError("")}

    if (currentStep === 0) {

      const userDetails = localStorage.getItem('user');
      const supervisorId = userDetails ? JSON.parse(userDetails).id : null;
      const requestBody = {
        postalCode: shiftData.property.postalCode,
        startTime: updatedShift.startTime,
        endTime: updatedShift.endTime,
        date: updatedShift.date,
        supervisorId: supervisorId
      };

      try {
        const response = await axios.post('http://localhost:8080/shifts/available-workers', requestBody);
        const workersData = response.data;
        const selectedWorkers = workersData.slice(0, shiftData.workers.length);
        setTopFiveWorkers(workersData)
        setAvailableWorkers(selectedWorkers);

      } catch (error) {
        console.error('Failed to fetch available workers:', error);
      }
    }
    if (currentStep === 0 && assignmentType === 'manual') {
      try {
        const userDetails = localStorage.getItem('user');
        const supervisorId = userDetails ? JSON.parse(userDetails).id : null;
        const response = await axios.get('http://localhost:8080/workers/available', {
          params: { date: updatedShift.date, startTime: updatedShift.startTime, endTime: updatedShift.endTime, supervisorId:supervisorId, shiftId:updatedShift.id  }
        });  
        if (response.data.length < shiftData.workers.length) {
          setError('Not enough available workers to fulfill the shift requirements.');
          setShowFailure(true);
        }
        else {
          const combinedWorkers = [...response.data.newWorkers, ...response.data.currentWorkers]
          setWorkerChoice(combinedWorkers);
        }
       }
       catch (error) {
        console.error('Failed to fetch available workers:', error);
      }
    }

    if (currentStep === 1 && assignmentType === 'manual' && selectedWorkers.length < shiftData.workers.length){
      setError("Not enough workers selected, please select only " + shiftData.workers.length + " workers")
      return;
    }

    if (currentStep === 1 && assignmentType === 'manual' && selectedWorkers.length > shiftData.workers.length){
      setError("Too many workers selected, please select only " + shiftData.workers.length + " workers")
      return;
    }
    
    setCurrentStep((prev) => prev + 1);

  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);

    if (showFailure){
      setShowFailure(false)
    }
  };

  const handleSave = async () => {
    try {
      const workerIds = (availableWorkers && availableWorkers.length > 0 ? availableWorkers : selectedWorkers)
      .map(worker => worker.id);

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
      setTimeout(() => {
        setShowSuccess(false);
        setCurrentStep(0);
        onTaskUpdate();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to update shift:', error);
    }
  };

  const filteredWorkers = workerChoice.filter(worker =>
    worker.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const steps = [
    { title: 'View task', description: 'Details of the task' },
    { title: 'Worker assignment', description: 'Assign the desired workers' },
    { title: 'Confirmation', description: 'Review and confirm task details' },
  ]


  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[600px] overflow-y-auto">
          <DialogHeader className="sticky pr-8">
            <DialogTitle>{steps[currentStep].title}</DialogTitle>
            <DialogDescription>{steps[currentStep].description}</DialogDescription>
            <span
              className={`absolute top-1 right-5 px-2 py-1 rounded-full text-xs z-10 font-semibold ${
                shiftData.status === 'COMPLETED'
                  ? 'bg-green-100 text-green-600'
                  // TODO: remove the underscore lol
                  : shiftData.status === 'IN_PROGRESS'
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
                {error && (
                    <div className="text-red-500 mb-4 text-sm">
                      {error}
                    </div>
                    )}
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

                {/* manual type */}
                {assignmentType === 'manual' && !showFailure ? (
                  <div className="space-y-4">
                  <p>These are the top 5 suggested workers:</p>
                  {topFiveWorkers.map((worker, index) => (
                    <motion.div
                      key={worker.id}
                      className="p-4 rounded-lg bg-slate-200 text-black"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, delay: index * 0.2 }}
                    >
                      <h3 className="font-semibold">{worker.name}</h3>
                      <p className="text-sm">Travel Time: {worker.travelTimeToTarget.totalTravelTime} mins</p>
                    </motion.div>
                  ))}
                
                <hr/>

                  <p className="mt-6">Select your workers below:</p>
                  <input
                      type="text"
                      placeholder="Search workers..."
                      className="w-full px-3 py-2 border rounded-md mb-4"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  {filteredWorkers.map((worker, index) => {
                    const isSelected = selectedWorkers.some((selectedWorker) => selectedWorker.id === worker.id);
                    return (
                      <motion.div
                        key={worker.id}
                        className={`p-4 rounded-lg cursor-pointer ${isSelected ? 'bg-black text-white' : 'bg-slate-200 text-black'}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        onClick={() => toggleWorkerSelection(worker)}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{worker.name}</h3>
                          {!topFiveWorkers.some(topWorker => topWorker.name === worker.name) && (
                            <Button
                              className="ml-4 px-3 py-1 bg-slate-500 text-white rounded hover:bg-black text-sm"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevents triggering parent onClick
                                handleRetrieveTravelTime(worker.id, updatedShift.property.postalCode, updatedShift.date, updatedShift.startTime, updatedShift.endTime);
                              }}
                            >
                              <Clock/>
                            </Button>
                          )}
                        </div>
                        {/* Conditionally display travel time if available */}
                        {travelTimes[worker.id] !== undefined && (
                            <p className="text-sm">Travel Time: {travelTimes[worker.id]} mins</p>
                          )}
                      </motion.div>
                    );
                  })}
                
                  {error && (
                    <div className="text-red-500 mb-4 text-sm">
                      {error}
                    </div>
                  )}
                </div>
                
                ) : !showFailure ? (

                  // automatic assignment
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
                ): 
                showFailure && (
                  <div className="text-center py-4">
                    <p className="text-red-500 mb-4">Not enough available workers to fulfill the shift requirements.</p>
                  </div>
                )}

                <div className="flex justify-between mt-4">
                  <Button onClick={handlePreviousStep}>Back</Button>
                  {showFailure ? (
                    <Button onClick={onClose}>Cancel</Button>
                  ) : (
                    <Button onClick={handleNextStep}>Next</Button>
                  )}
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
                  <p>Selected workers: {(availableWorkers && availableWorkers.length > 0 ? availableWorkers : selectedWorkers)
                    .map(worker => worker.name)
                    .join(', ')}
                  </p>
                  <div className="flex justify-between mt-4">
                    <Button onClick={handlePreviousStep}>Back</Button>
                    <Button onClick={handleSave}>Confirm</Button>
                  </div>
                </div>
              )
            }

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
                <span className="col-span-1 flex items-center">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold col-span-1">Assigned worker ID(s):</span>
                <span className="col-span-3 flex items-center">
                  <PersonStanding className="w-4 h-4 mr-2" />
                    {shiftData.workerIds.join(", ")}
                </span>
              </div>

              {/* Photo of proof */}
              {(shiftData.status === "COMPLETED" || shiftData.status === "IN_PROGRESS") && (
                <div className="overflow-x-auto">
                <div
                  className="flex gap-6"
                  style={{ minWidth: '600px' }} // Set a minimum width for the entire container
                >
                  {shiftData.workerIds.map((workerId) => {
                    const arrivalPhoto = shiftData.arrivalImages.find((photo) => photo.workerId === workerId);
                    const completionPhoto = shiftData.completionImages.find((photo) => photo.workerId === workerId);
              
                    return (
                      <div
                        key={workerId}
                        className="p-4 border rounded-lg shadow-md bg-white w-72" 
                      >
                        <h4 className="font-semibold text-lg mb-2 text-center">Worker ID: {workerId}</h4>
              
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-bold mb-1 text-sm">Arrival Photo:</h5>
                            {arrivalPhoto ? (
                              <Image
                                src={arrivalPhoto.presignedUrl || 'default-arrival-placeholder.jpg'}
                                alt={`Arrival photo for Worker ID ${workerId}`}
                                width={200}
                                height={200}
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              <p className="text-red-500 text-sm">Worker has yet to upload an arrival photo</p>
                            )}
                          </div>
              
                          <div>
                            <h5 className="font-bold mb-1 text-sm">Completion Photo:</h5>
                            {completionPhoto ? (
                              <Image
                                src={completionPhoto.presignedUrl || 'default-completion-placeholder.jpg'}
                                alt={`Completion photo for Worker ID ${workerId}`}
                                width={200}
                                height={200}
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              <p className="text-red-500 text-sm">Worker has yet to upload a completion photo</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>                                        
              )}


              {/* if got rescheduling */}
              {(shiftData.date !== shiftData.originalDate || 
                shiftData.originalEndTime !== shiftData.endTime || 
                shiftData.originalStartTime !== shiftData.startTime) && (
                  <>
                    <hr />
                    <span className="font-bold">Rescheduling history:</span>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <span className="font-bold col-span-1">Original date:</span>
                      <span className="col-span-3 flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {shiftData.originalDate}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <span className="font-bold col-span-1">Start time:</span>
                      <span className="col-span-3 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        {shiftData.originalStartTime}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <span className="font-bold col-span-1">End time:</span>
                      <span className="col-span-3 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        {shiftData.originalEndTime}
                      </span>
                    </div>
                  </>
              )}

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