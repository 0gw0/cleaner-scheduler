import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Plus, Check, X } from 'lucide-react'
import { Property, WorkerTravelData } from '@/types/task'
import axios from 'axios'

type FormData = {
  clientId: string
  propertyId: string
  startTime: string
  endTime: string
  date: string
  isRecurring: boolean
  recurringType: 'weekly' | 'monthly' | ''
  numberOfWorkers : number
  selectedWorker: WorkerTravelData | null,
  recurringInterval: number 
  endDate: string};

const initialFormData: FormData = {
  clientId: '',
  propertyId: '',
  startTime: '',
  endTime: '',
  date: '',
  isRecurring: false,
  recurringType: '',
  selectedWorker: null,
  numberOfWorkers : 0,
  recurringInterval: 0,
  endDate: ""
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
  },
  {
    id: 3,
    name: "Alex Johnson",
    travelTimeToTarget: {
      totalTravelTime: 60,
      travelTimeWithoutTraffic: 50,
      travelTimeInTraffic: 10,
    },
    relevantShift: {
      date: "2024-10-15",
      startTime: "08:00:00",
      endTime: "16:00:00",
    },
    originLocation: "789 Some Blvd, Singapore",
  },
  {
    id: 4,
    name: "Bobby",
    travelTimeToTarget: {
      totalTravelTime: 60,
      travelTimeWithoutTraffic: 50,
      travelTimeInTraffic: 10,
    },
    relevantShift: {
      date: "2024-10-15",
      startTime: "08:00:00",
      endTime: "16:00:00",
    },
    originLocation: "700 DingDong Blvd, Singapore",
  },
  {
    id: 5,
    name: "Kevin",
    travelTimeToTarget: {
      totalTravelTime: 60,
      travelTimeWithoutTraffic: 50,
      travelTimeInTraffic: 10,
    },
    relevantShift: {
      date: "2024-10-15",
      startTime: "08:00:00",
      endTime: "16:00:00",
    },
    originLocation: "750 Dingus Blvd, Singapore",
  },
];

interface AddTaskFormProps {
  onTaskAdded: () => void; 
}

export default function AddTaskForm({ onTaskAdded }: AddTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [showSuccess, setShowSuccess] = useState(false)
  const [availableWorkers, setAvailableWorkers] = useState<WorkerTravelData[]>([]);
  const [error, setError] = useState("")
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));

    if (name === 'clientId' && value) {
      try {
        const response = await axios.get('http://localhost:8080/properties', {
          params: { clientId: value }
        });
        setProperties(response.data);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
        setProperties([]);
      }
    }

    if (name === "propertyId" && value){
      console.log("does this run")
      const propertyId = value;
      const foundProperty = properties.find(
        (property: Property) => property.address === propertyId
      );
  
      if (foundProperty) {
        setSelectedProperty(foundProperty);
      } else {
        console.error("Property not found");
        setError("Property not found");
        return;
      }
    }

    setError('');
  };

  const handleWorkerSelect = (worker: WorkerTravelData) => {
    setFormData(prev => ({ ...prev, selectedWorker: worker }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const now = new Date();
    const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now
    const selectedDateTime = new Date(`${formData.date}T${formData.startTime}`);

    if (selectedDateTime < threeHoursLater) {
      setError('The start time must be at least 3 hours from now.');
      return;
    }

    if (currentStep === 0) {
    
      if (selectedProperty) {
        try {
          const requestData = {
            postalCode: selectedProperty.postalCode,
            startTime: {
              hour: parseInt(formData.startTime.split(':')[0], 10),
              minute: parseInt(formData.startTime.split(':')[1], 10),
              second: 0,
              nano: 0,
            },
            endTime: {
              hour: parseInt(formData.endTime.split(':')[0], 10),
              minute: parseInt(formData.endTime.split(':')[1], 10),
              second: 0,
              nano: 0,
            },
            date: formData.date,
          };
  
          //TODO: add the s after available-worker
          // const response = await axios.post('http://localhost:8080/shifts/available-worker', requestData);
          // const workersData: WorkerTravelData[] = response.data;
          //TODO: change bottom to workersData
          const selectedWorkers = fakeWorkerTravelData.slice(0, formData.numberOfWorkers);
          setAvailableWorkers(selectedWorkers);
        } catch (error) {
          console.error('Failed to fetch available workers:', error);
          setAvailableWorkers([]);
        }
      } else {
        console.error('No selected property found for fetching workers');
        setError('Please select a property before proceeding.');
        return;
      }
    }

    console.log("availableWorkers",availableWorkers)
    console.log("selectedProperty", selectedProperty)

    
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1)
    } else {

      try{
        const workerIds = availableWorkers.map(worker => worker.id);
        const requestData = {
          workerIds,
          propertyId: selectedProperty ? selectedProperty.id : null,
          startDate: formData.date,
          endDate: formData.isRecurring ? formData.endDate : null,
          startTime: formData.startTime,
          endTime: formData.endTime,
          frequency: formData.isRecurring ? { unit: formData.recurringType == "weekly" ? "WEEKS" : "MONTHS", interval: formData.recurringInterval } : undefined,
        };
        const response = await axios.post('http://localhost:8080/workers/bulk/shifts', requestData);
        console.log('Task created successfully:', response.data);
        
        if (onTaskAdded) {
          onTaskAdded();
        }
        setShowSuccess(true)
      
      setTimeout(() => {
        setIsOpen(false);
        setShowSuccess(false);
        setCurrentStep(0);
        setFormData(initialFormData);
      }, 1500);
        }
    catch (error) {
      console.error('Failed to submit form:', error);
      setError('An error occurred while submitting the form.');
    }
  }
};


  const steps = [
    { title: 'Task Details', description: 'Enter the basic task information' },
    { title: 'Worker assignment', description: 'Helping you choose the best worker(s) for the task' },
    { title: 'Confirmation', description: 'Review and confirm task details' },
  ]

  return (
    <div>
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
        <Plus size={16} />
        Add a new task
      </Button>
  
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{showSuccess ? 'Task Confirmed!' : steps[currentStep].title}</CardTitle>
                  <CardDescription>{showSuccess ? 'Your task has been successfully added.' : steps[currentStep].description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    {showSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center py-8"
                      >
                        <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <p className="text-lg font-semibold mb-2">Task Added Successfully!</p>
                        <p className="text-sm text-gray-500">You will be redirected shortly.</p>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit}>
                        <motion.div
                          key={currentStep}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -20, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {currentStep === 0 && (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="clientId">Client ID</Label>
                                <Input
                                  id="clientId"
                                  name="clientId"
                                  value={formData.clientId}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              {/* Property dropdown */}
                              {properties.length > 0 && (
                                <div>
                                  <Label htmlFor="propertyId">Select Property</Label>
                                  <select
                                    id="propertyId"
                                    name="propertyId"
                                    value={formData.propertyId}
                                    onChange={handleInputChange}
                                    required
                                    className="block w-full mt-1 bg-white border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  >
                                    <option value="">Select a property</option>
                                    {properties.map((property: Property) => (
                                      <option key={property.address} value={property.address}>
                                        {property.address}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              <div>
                                <Label htmlFor="numberOfWorkers">Number of workers needed</Label>
                                <Input
                                  type="number"
                                  max="5"
                                  min="1"
                                  id="numberOfWorkers"
                                  name="numberOfWorkers"
                                  value={formData.numberOfWorkers}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
  
                              <div>
                                <Label htmlFor="date">Date</Label>
                                <Input
                                  id="date"
                                  name="date"
                                  type="date"
                                  min={new Date().toISOString().split('T')[0]}
                                  value={formData.date}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="startTime">Start Time</Label>
                                  <Input
                                    id="startTime"
                                    name="startTime"
                                    type="time"
                                    value={formData.startTime}
                                    onChange={handleInputChange}
                                    required
                                  />
                                  {error && (
                                    <p className="text-red-500 text-sm mt-1">{error}</p>
                                  )}
                                </div>
                                <div>
                                  <Label htmlFor="endTime">End Time</Label>
                                  <Input
                                    id="endTime"
                                    name="endTime"
                                    type="time"
                                    value={formData.endTime}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="isRecurring"
                                  name="isRecurring"
                                  checked={formData.isRecurring}
                                  onCheckedChange={(checked) =>
                                    setFormData((prev) => ({ ...prev, isRecurring: checked }))
                                  }
                                />
                                <Label htmlFor="isRecurring">Recurring Task</Label>
                              </div>
                              {formData.isRecurring && (
                                <div className="space-y-2">
                                  <Label>Recurring Type</Label>
                                  <div className="flex space-x-4">
                                    <label className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        name="recurringType"
                                        value="weekly"
                                        checked={formData.recurringType === 'weekly'}
                                        onChange={handleInputChange}
                                      />
                                      <span>Weekly</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        name="recurringType"
                                        value="monthly"
                                        checked={formData.recurringType === 'monthly'}
                                        onChange={handleInputChange}
                                      />
                                      <span>Monthly</span>
                                    </label>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Interval of shift</Label>
                                    <label className="flex items-center space-x-2">
                                    <Input
                                        type="number"
                                        name="recurringInterval"
                                        value={formData.recurringInterval}
                                        onChange={handleInputChange}
                                      />
                                    </label>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <label className="flex items-center space-x-2">
                                    <Input
                                        type="Date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                      />
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
  
                          {currentStep === 1 && (
                          <div className="space-y-4">
                            <p>The following workers have been assigned:</p>
                            {availableWorkers.slice(0, formData.numberOfWorkers).map((worker, index) => (
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
  
                          {currentStep === 2 && (
                            <div className="space-y-4">
                              <h3 className="font-semibold">Task Summary</h3>
                              <p>Client ID: {formData.clientId}</p>
                              <p>Property ID: {formData.propertyId}</p>
                              <p>Date: {formData.date}</p>
                              <p>Time: {formData.startTime} - {formData.endTime}</p>
                              <p>Recurring: {formData.isRecurring ? 'Yes' : 'No'}</p>
                              {formData.isRecurring && <p>Recurring Type: {formData.recurringType}</p>}
                              <p>Assigned Worker: {availableWorkers.map(worker => worker.name).join(', ')}</p>
                            </div>
                          )}
                        </motion.div>
  
                        <div className="flex justify-between mt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => currentStep > 0 && setCurrentStep((prev) => prev - 1)}
                            disabled={currentStep === 0}
                          >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                          </Button>
                          <Button type="submit">
                            {currentStep < 2 ? (
                              <>
                                Next
                                <ChevronRight className="ml-2 h-4 w-4" />
                              </>
                            ) : (
                              <>
                                Confirm
                                <Check className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
  
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
  