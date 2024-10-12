import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { WorkerTravelData, time, ShiftData } from "@/types/task";

interface TaskCardProps {
  ShiftData: ShiftData;
  WorkerTravelData: WorkerTravelData[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
    ShiftData,
    WorkerTravelData,
    isExpanded,
    onToggleExpand,
  }) => {
    const [selectedWorker, setSelectedWorker] = useState<WorkerTravelData | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
  
    const handleWorkerSelect = (worker: WorkerTravelData) => {
      setSelectedWorker(prevWorker => prevWorker?.id === worker.id ? null : worker);
    };
  
    const handleWorkerConfirm = () => {
      if (selectedWorker) {
        console.log(`Worker ${selectedWorker.name} confirmed for the task.`);
        setSelectedWorker(null);
      }
    };
  
    const formatTime = (time: time) => {
      return time.hour + ":" + time.minute;
    };
  
    useEffect(() => {
        if (contentRef.current) {
          if (isExpanded) {
            contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
          } else {
            contentRef.current.style.maxHeight = '0px';
          }
        }
      }, [isExpanded, selectedWorker]);

    return (
    <div>
      <Card className="w-full mx-auto my-4 transition-all duration-500 ease-in-out">
        <CardHeader className="cursor-pointer" onClick={onToggleExpand}>
            {/* Title text size changed to text-lg */}
            <CardTitle className="text-lg font-bold">Shift ID: {ShiftData.id}</CardTitle>
            <div className="mt-2 space-y-1">
            {/* Text size for content reduced to text-sm for consistency */}
            <p className="text-sm">
                <strong>Client:</strong> {ShiftData.property.address}
            </p>
            <p className="text-sm">
                <strong>Address:</strong> {ShiftData.property.address}
            </p>
            <p className="text-sm">
                <strong>Date:</strong> {ShiftData.date.toString()}
            </p>
            <p className="text-sm">
                <strong>Time:</strong> {formatTime(ShiftData.startTime)} - {formatTime(ShiftData.endTime)}
            </p>
            </div>
            <Button variant="ghost" size="sm" className="mt-2 text-sm">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {isExpanded ? "Hide Details" : "Show Details"}
            </Button>
        </CardHeader>

        {/* Collapsible content with smooth transition */}
        <div
            ref={contentRef}
            style={{
            maxHeight: isExpanded ? contentRef.current?.scrollHeight : 0,
            opacity: isExpanded ? 1 : 0,
            }}
            className="overflow-hidden transition-all duration-500 ease-in-out"
        >
            <CardContent>
            <h3 className="text-base font-semibold mb-4">Available Workers</h3> {/* Adjusted heading size */}
            <div className="space-y-4">
                {WorkerTravelData.map((worker) => (
                <div
                    key={worker.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedWorker?.id === worker.id
                        ? "bg-black text-white"
                        : "bg-slate-100 hover:bg-slate-300/80 hover:shadow-md"
                    }`}
                    onClick={() => handleWorkerSelect(worker)}
                >
                    <h4 className="text-sm font-semibold">{worker.name}</h4> {/* Reduced to text-sm */}
                    <p className="text-sm">
                    <strong>Previous Location:</strong> {worker.originLocation}
                    </p>
                    <p className="text-sm">
                    <strong>Estimated Arrival:</strong> {worker.travelTimeToTarget.totalTravelTime} mins
                    </p>
                </div>
                ))}
            </div>
            {selectedWorker && (
                <Button className="mt-4 w-full text-sm" onClick={handleWorkerConfirm}>
                Confirm Selection: {selectedWorker.name}
                </Button>
            )}
            </CardContent>
        </div>
        </Card>
        </div>
    );
  };
  
  export default TaskCard;