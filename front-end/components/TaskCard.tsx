import React, { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Shift } from "@/types/task"
import { BanIcon, CalendarIcon, ClockIcon, EyeIcon, MapPinIcon, Pencil, PersonStandingIcon, UserIcon } from 'lucide-react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'

interface TaskCardProps {
  shiftData: Shift
  onCardClick: (shift: Shift) => void
  cancelShift: (shift: Shift) => void
}

export const TaskCard: React.FC<TaskCardProps> = ({ shiftData, onCardClick, cancelShift }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCancelClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmCancel = () => {
    cancelShift(shiftData);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      COMPLETED: 'bg-green-100 text-green-800',
      UPCOMING: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-red-100 text-red-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    };
  
    return (
      <span
        className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs z-10 font-semibold ${
          statusColors[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <>
      <Card className="relative w-full hover:shadow-lg transition-shadow z-10 duration-300">
        {getStatusBadge(shiftData.status)}

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
            <p className="flex items-center">
              <PersonStandingIcon className="w-4 h-4 mr-2" />
              Assigned worker ID(s): {shiftData.workerIds.join(", ")}
            </p>
          </div>
        </CardContent>

        {shiftData.status != "UPCOMING" ? (
          <CardFooter className="flex justify-center">
            <Button variant="outline" className="w-full mb-3 inline-flex" onClick={() => onCardClick(shiftData)}>
              <EyeIcon className="w-4 h-4 mr-2" />
              View shift details
            </Button>
          </CardFooter>
        ) : (
          <CardFooter className="flex flex-col items-center">
            <Button variant="outline" className="w-full mb-3" onClick={() => onCardClick(shiftData)}>
              <Pencil className="w-4 h-4 mr-2" />
              View or modify shift details
            </Button>

            <Button variant="outline" className="w-full hover:bg-red-100" onClick={handleCancelClick}>
              <BanIcon className="w-4 h-4 mr-2 text-red-500" />
              <p className="text-red-500">Cancel shift</p>
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Confirmation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this shift? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmCancel}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
