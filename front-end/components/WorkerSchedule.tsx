import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {Button} from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input'

// Update the ScheduleItem interface to match the new data structure
interface ScheduleItem {
  id: number;
  worker: number;
  property: {
    propertyId: number;
    clientId: number;
    address: string;
    postalCode: string;
  };
  date: string;
  startTime: string;
  endTime: string;
}

interface WorkerScheduleProps {
  schedule: ScheduleItem[];
}

const WorkerSchedule: React.FC<WorkerScheduleProps> = ({ schedule }) => {
  const [cancelReason, setCancelReason] = React.useState<string>('');
  const [selectedShiftId, setSelectedShiftId] = React.useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  today.setHours(0, 0, 0, 0);

  const categorizeSchedule = () => {
    return schedule.reduce(
      (acc, item) => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        if (itemDate < today) {
          acc.past.push(item);
        } else if (itemDate > today) {
          acc.upcoming.push(item);
        } else {
          acc.current.push(item);
        }
        return acc;
      },
      { past: [], current: [], upcoming: [] } as Record<string, ScheduleItem[]>
    );
  };

  const { past, current, upcoming } = categorizeSchedule();

  const handleConfirmCancel = () => {
    if (selectedShiftId && cancelReason.trim()) {
      setCancelReason('');
      setSelectedShiftId(null);
      setIsDialogOpen(false);
    }
  };

  const handleCloseDialog = () => {
    setSelectedShiftId(null);
    setCancelReason('');
    setIsDialogOpen(false);
  };

  const handleOpenPhotoDialog = (shiftId: number) => {
    setSelectedShiftId(shiftId);
    setIsPhotoDialogOpen(true);
  };

  const handleClosePhotoDialog = () => {
    setSelectedShiftId(null);
    setPhotoFile(null);
    setIsPhotoDialogOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
  };

  const handlePhotoSubmit = () => {
    if (photoFile && selectedShiftId) {
      console.log(`Submitting photo for shift ${selectedShiftId}:`, photoFile);
      handleClosePhotoDialog(); 
      //TO DO: Add API call to submit photo
      //TO DO: Add API call to change status to in progress
    }
  };

  const ScheduleSection = ({ title, items }: { title: string; items: ScheduleItem[] }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="bg-secondary">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <p className="font-semibold">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
                <p>{`${item.startTime} - ${item.endTime}`}</p>
                <p>{`Address: ${item.property.address}`}</p>
                <p>{`Postal Code: ${item.property.postalCode}`}</p>
                <p>{`Property ID: ${item.property.propertyId}`}</p>
                <p>{`Client ID: ${item.property.clientId}`}</p>

                {title === 'Current Schedule' && (
                  <Button
                    className="mt-4"
                    onClick={() => handleOpenPhotoDialog(item.id)}
                  >
                    Submit Photo
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && (
            <p className="text-muted-foreground">No shifts scheduled</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Shift</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this shift? Please provide a reason:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Enter reason for cancellation..."
            className="my-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDialog}>
              Nevermind
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCancel}
              disabled={!cancelReason.trim()}
            >
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Please upload a photo for this shift.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            type="file"
            accept="image/*"
            capture="environment" 
            onChange={handleFileChange}
            className="my-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleClosePhotoDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePhotoSubmit}
              disabled={!photoFile}
            >
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ScheduleSection title="Current Schedule" items={current} />
      <ScheduleSection title="Upcoming Schedule" items={upcoming} />
      <ScheduleSection title="Past Schedule" items={past} />
    </div>
  );
};

export default WorkerSchedule;