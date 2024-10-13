import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShiftData } from "@/types/task"
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon } from 'lucide-react'

interface TaskCardProps {
  shiftData: ShiftData
  onCardClick: (shift: ShiftData) => void
}

export const TaskCard: React.FC<TaskCardProps> = ({ shiftData, onCardClick }) => {
  const formatTime = (time: { hour: number; minute: number }) => {
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`
  }

  return (
    <Card 
      className="w-full cursor-pointer hover:shadow-lg transition-shadow duration-300" 
      onClick={() => onCardClick(shiftData)}
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center">
          <MapPinIcon className="w-5 h-5 mr-2" />
          {shiftData.property.address}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" />
            {shiftData.date.toDateString()}
          </p>
          <p className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-2" />
            {formatTime(shiftData.startTime)} - {formatTime(shiftData.endTime)}
          </p>
          <p className="flex items-center">
            <UserIcon className="w-4 h-4 mr-2" />
            Worker ID: {shiftData.worker}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}