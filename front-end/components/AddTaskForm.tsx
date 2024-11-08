import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Plus, Check, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { WorkerTravelData } from '@/types/task'

type FormData = {
  clientId: string
  propertyId: string
  startTime: string
  endTime: string
  date: string
  isRecurring: boolean
  recurringType: 'weekly' | 'monthly' | ''
  numberOfWorkers : number
  selectedWorker: WorkerTravelData | null
}

const initialFormData: FormData = {
  clientId: '',
  propertyId: '',
  startTime: '',
  endTime: '',
  date: '',
  isRecurring: false,
  recurringType: '',
  selectedWorker: null,
  numberOfWorkers : 0
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

export default function AddTaskForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [showSuccess, setShowSuccess] = useState(false)
  const [availableWorkers, setAvailableWorkers] = useState(fakeWorkerTravelData)
  const [error, setError] = useState("")
  const { toast } = useToast();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    setError('');
  }

  const handleWorkerSelect = (worker: WorkerTravelData) => {
    setFormData(prev => ({ ...prev, selectedWorker: worker }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const now = new Date();
    const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now
    const selectedDateTime = new Date(`${formData.date}T${formData.startTime}`);

    if (selectedDateTime < threeHoursLater) {
      setError('The start time must be at least 3 hours from now.');
      return;
    }

    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1)
    } else {
      setShowSuccess(true)
      
      setTimeout(() => {
        setIsOpen(false)
        setShowSuccess(false)
        setCurrentStep(0)
        setFormData(initialFormData)
      }, 1500)
    }
  }

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
                              <div>
                                <Label htmlFor="propertyId">Property ID</Label>
                                <Input
                                  id="propertyId"
                                  name="propertyId"
                                  value={formData.propertyId}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="numberOfWorkers">Number of workers needed</Label>
                                <Input
                                  type = "number"
                                  max = "5"
                                  min = "1"
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
                                </div>
                              )}
                            </div>
                          )}

                          {currentStep === 1 && (
                            <div className="space-y-4">
                                {fakeWorkerTravelData.map((worker) => (
                                <div
                                  key={worker.id}
                                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                                    formData.selectedWorker?.id === worker.id
                                      ? 'bg-black text-white'
                                      : 'bg-slate-200 hover:bg-slate-300'
                                  }`}
                                  onClick={() => handleWorkerSelect(worker)}
                                >
                                  <h3 className="font-semibold">{worker.name}</h3>
                                  <p className="text-sm">Location: {worker.originLocation}</p>
                                  <p className="text-sm">
                                    Travel Time: {worker.travelTimeToTarget.totalTravelTime} mins
                                  </p>
                                </div>
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
                              <p>Assigned Worker: {formData.selectedWorker?.name}</p>
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
}