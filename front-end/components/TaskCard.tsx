import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { time, ShiftData } from "@/types/task"

interface TaskCardProps {
  ShiftData: ShiftData
  onCardClick: () => void
}

const TaskCard: React.FC<TaskCardProps> = ({ ShiftData, onCardClick }) => {
  const formatTime = (time: time) => {
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`
  }

  return (
    <Card className="w-full mb-4 cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={onCardClick}>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Shift ID: {ShiftData.id}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 text-sm">
          <p><strong>Client:</strong> {ShiftData.property.address}</p>
          <p><strong>Date:</strong> {ShiftData.date.toDateString()}</p>
          <p><strong>Time:</strong> {formatTime(ShiftData.startTime)} - {formatTime(ShiftData.endTime)}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default TaskCard