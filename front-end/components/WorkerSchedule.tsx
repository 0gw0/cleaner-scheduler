import React from 'react';

// Define the ScheduleItem type
interface ScheduleItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  client_id: string;
  status: 'completed' | 'upcoming' | 'cancelled';
  cancelReason?: string;
}
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';


interface WorkerScheduleProps {
  schedule: ScheduleItem[];
  onCancelShift: (shiftId: string, reason: string) => void;
}

const WorkerSchedule: React.FC<WorkerScheduleProps> = ({ schedule, onCancelShift }) => {
  const [cancelReason, setCancelReason] = React.useState<string>('');
  const [selectedShiftId, setSelectedShiftId] = React.useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

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
      onCancelShift(selectedShiftId, cancelReason.trim());
      setCancelReason('');
      setSelectedShiftId(null);
      setIsDialogOpen(false);
    }
  };

  const handleOpenDialog = (shiftId: string) => {
    setSelectedShiftId(shiftId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedShiftId(null);
    setCancelReason('');
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: ScheduleItem['status']) => {
    const statusStyles = {
      completed: 'bg-green-500',
      upcoming: 'bg-blue-500',
      cancelled: 'bg-red-500'
    };
    
    return (
      <Badge className={`${statusStyles[status]} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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
                  {getStatusBadge(item.status)}
                </div>
                <p>{`${item.startTime} - ${item.endTime}`}</p>
                <p>{`Location: ${item.location}`}</p>
                <p>{`Client ID: ${item.client_id}`}</p>
                {item.status === 'cancelled' && item.cancelReason && (
                  <div className="mt-4 p-2 bg-red-100 dark:bg-red-900 rounded">
                    <p className="font-semibold">Cancellation Reason:</p>
                    <p>{item.cancelReason}</p>
                  </div>
                )}
                {item.status === 'upcoming' && (
                  <div className="mt-4">
                    <Button 
                      variant="destructive" 
                      onClick={() => handleOpenDialog(item.id)}
                    >
                      Cancel Shift
                    </Button>
                  </div>
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

      <ScheduleSection title="Current Schedule" items={current} />
      <ScheduleSection title="Upcoming Schedule" items={upcoming} />
      <ScheduleSection title="Past Schedule" items={past} />
    </div>
  );
};

export default WorkerSchedule;