import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shift } from "@/types/task"
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon } from 'lucide-react'

interface TaskCardProps {
  shiftData: Shift
  onCardClick: (shift: Shift) => void
}

export const TaskCard: React.FC<TaskCardProps> = ({ shiftData, onCardClick }) => {
  

  return (
    <Card
  className="relative w-full cursor-pointer hover:shadow-lg transition-shadow z-10 duration-300"
  onClick={() => onCardClick(shiftData)}>

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
        {shiftData.date}
      </p>
      <p className="flex items-center">
        <ClockIcon className="w-4 h-4 mr-2" />
        {shiftData.startTime} - {shiftData.endTime}
      </p>
      <p className="flex items-center">
        <UserIcon className="w-4 h-4 mr-2" />
        Client ID: {shiftData.property.clientId}
      </p>
    </div>
  </CardContent>
</Card>
  )
}