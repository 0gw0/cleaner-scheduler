import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { WorkerTravelData, ShiftData } from '@/types/task'

interface TaskDetailModalProps {
  ShiftData: ShiftData
  WorkerTravelData: WorkerTravelData[]
  onConfirm: (workerId: number, shiftId: number) => void
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ ShiftData, WorkerTravelData, onConfirm }) => {
  const [selectedWorker, setSelectedWorker] = useState<WorkerTravelData | null>(null)

  const handleWorkerSelect = (worker: WorkerTravelData) => {
    setSelectedWorker(prevWorker => prevWorker?.id === worker.id ? null : worker)
  }

  const handleConfirm = () => {
    if (selectedWorker) {
      onConfirm(selectedWorker.id, ShiftData.id)
    }
  }

  const formatTime = (time: { hour: Number; minute: Number }) => {
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-lg font-semibold">Shift Details</h4>
        <p className="text-sm"><strong>Client:</strong> {ShiftData.property.address}</p>
        <p className="text-sm"><strong>Date:</strong> {ShiftData.date.toDateString()}</p>
        <p className="text-sm"><strong>Time:</strong> {formatTime(ShiftData.startTime)} - {formatTime(ShiftData.endTime)}</p>
      </div>
      <div>
        <h4 className="text-lg font-semibold mb-2">Available Workers</h4>
        <div className="space-y-2">
          {WorkerTravelData.map((worker) => (
            <div
              key={worker.id}
              className={`p-2 rounded-lg text-sm cursor-pointer transition-colors ${
                selectedWorker?.id === worker.id
                  ? "bg-black text-white"
                  : "bg-slate-200 hover:bg-secondary/80"
              }`}
              onClick={() => handleWorkerSelect(worker)}
            >
              <h5 className="font-semibold">{worker.name}</h5>
              <p><strong>Previous Location:</strong> {worker.originLocation}</p>
              <p><strong>Estimated Arrival:</strong> {worker.travelTimeToTarget.totalTravelTime} mins</p>
            </div>
          ))}
        </div>
      </div>
      <Button 
        className="w-full" 
        onClick={handleConfirm} 
        disabled={!selectedWorker}
      >
        {selectedWorker ? `Confirm: ${selectedWorker.name}` : 'Select a worker'}
      </Button>
    </div>
  )
}

export default TaskDetailModal