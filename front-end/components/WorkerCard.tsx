import { Phone, Calendar, FileText, Building} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shift, WorkerCardProps } from "@/types/workermanagement";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

export const WorkerCard = ({ worker, onActionClick }: WorkerCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: worker.name,
    phoneNumber: worker.phoneNumber,
    bio: worker.bio,
    status: worker.status
  });
  const { toast } = useToast();
  // Calculate active MC count
  const activeMCCount = worker.medicalLeaves.filter(
    (leave) => new Date(leave.endDate) >= new Date()
  ).length;

  // Get the next scheduled shift
  const getNextShift = (shifts: Shift[]): Shift | null => {
    const futureShifts = shifts
      .filter((shift) => new Date(shift.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return futureShifts[0] || null;
  };

  const nextShift = getNextShift(worker.shifts);

  // Format the next shift date and time
  const formatNextShift = (shift: Shift | null): string => {
    if (!shift) return "None scheduled";

    const shiftDate = new Date(shift.date);
    return `${format(shiftDate, "dd MMM yyyy")} ${shift.startTime}-${
      shift.endTime
    }`;
  };

  // Calculate worker status
  const getWorkerStatus = () => {
    const currentMC = worker.medicalLeaves.find((leave) => {
      const now = new Date();
      return new Date(leave.startDate) <= now && new Date(leave.endDate) >= now;
    });

    if (currentMC) {
      return {
        label: "On MC",
        className: "bg-red-100 text-red-800",
      };
    }

    const currentShift = worker.shifts.find((shift) => {
      const shiftDate = new Date(shift.date);
      const now = new Date();
      return (
        shiftDate.getDate() === now.getDate() &&
        shiftDate.getMonth() === now.getMonth() &&
        shiftDate.getFullYear() === now.getFullYear()
      );
    });

    if (currentShift) {
      return {
        label: "On Duty",
        className: "bg-green-100 text-green-800",
      };
    }

    return {
      label: "Available",
      className: "bg-gray-100 text-gray-800",
    };
  };

  const status = getWorkerStatus();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateWorker = async () => {
    setIsUpdating(true);
    try {
      await axios.patch(`http://localhost:8080/workers/${worker.id}`, formData);
      Object.assign(worker, formData);
      
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Worker details updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update worker details",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleScheduleClick = () => {
    onActionClick("showSchedule", worker);
  };

  const handleMCHistoryClick = () => {
    onActionClick("showMCHistory", worker);
  };

  const handleSubmitMCClick = () => {
    onActionClick("showMC", worker);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col">
          <CardTitle className="text-lg font-semibold">{worker.name}</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{worker.phoneNumber}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={status.className}>{status.label}</Badge>
        
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Worker Bio */}
        <p className="text-sm text-gray-600 line-clamp-2">{worker.bio}</p>

        {/* Worker Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Building className="w-4 h-4" />
            <span>ID: {worker.id}</span>
          </div>
          
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Shifts: {worker.shifts.length}</span>
          </div>
          
        </div>
        <div className="flex items-center gap-1 text-gray-600 text-sm">
            <Building className="w-4 h-4" />
            <span>Status: {worker.status}</span>
          </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={handleScheduleClick}
            className="w-full h-9"
          >
            <div className="flex items-center justify-center w-full">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="truncate">Schedule</span>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={handleMCHistoryClick}
            className="w-full h-9"
          >
            <div className="flex items-center justify-center w-full">
              <FileText className="w-4 h-4 mr-2" />
              <span className="truncate">MCs ({activeMCCount})</span>
            </div>
          </Button>

          
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="text-red-500 hover:bg-red-50 bg-white w-full"
            >
              Modify Worker Details
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Worker Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="h-20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateWorker}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant="default"
          onClick={handleSubmitMCClick}
          className="w-full h-9"
        >
          <FileText className="w-4 h-4 mr-2" />
          <span>Submit MC</span>
        </Button>

        {/* Next Shift Information */}
        <div className="text-sm text-gray-600 pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">Next Shift:</span>
            <span className="text-right">{formatNextShift(nextShift)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};