import React, { useState, useEffect } from "react";
import { Search, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Types
interface Shift {
  date: string;
  startTime: string;
  endTime: string;
  valid: boolean;
}

interface Schedule {
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  client_id: number;
  valid: boolean;
}

interface WorkerData {
  id: number;
  name: string;
  shifts: Shift[];
  schedule: Schedule[];
  phoneNumber: string;
  supervisor: number;
  supervisor_number: string;
  bio: string;
}

// Time slot configurations
const timeSlots = [
  { start: "07:00:00", end: "10:00:00" }, // 3 hours
  { start: "08:00:00", end: "11:00:00" }, // 3 hours
  { start: "09:00:00", end: "12:00:00" }, // 3 hours
  { start: "10:00:00", end: "14:00:00" }, // 4 hours
  { start: "11:00:00", end: "15:00:00" }, // 4 hours
  { start: "13:00:00", end: "16:00:00" }, // 3 hours
  { start: "14:00:00", end: "17:00:00" }, // 3 hours
  { start: "15:00:00", end: "19:00:00" }, // 4 hours
];

// Generate random non-overlapping schedules for a worker
const generateWorkerSchedule = (): Schedule[] => {
  const schedule: Schedule[] = [];
  const numAppointments = Math.floor(Math.random() * 3) + 2; // 2-4 appointments
  const availableSlots = [...timeSlots];
  const selectedDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    .toISOString().split('T')[0];

  // Locations for mock data
  const locations = [
    { address: "123 Main St, Brooklyn, NY 11201", client_id: 1 },
    { address: "456 Park Ave, Manhattan, NY 10022", client_id: 2 },
    { address: "789 Broadway, Queens, NY 11373", client_id: 3 },
    { address: "321 5th Ave, Manhattan, NY 10016", client_id: 4 },
    { address: "654 Atlantic Ave, Brooklyn, NY 11217", client_id: 5 },
    { address: "987 Northern Blvd, Queens, NY 11101", client_id: 6 },
    { address: "147 Madison Ave, Manhattan, NY 10016", client_id: 7 },
    { address: "258 Court St, Brooklyn, NY 11201", client_id: 8 }
  ];

  for (let i = 0; i < numAppointments && availableSlots.length > 0; i++) {
    const randomSlotIndex = Math.floor(Math.random() * availableSlots.length);
    const selectedSlot = availableSlots[randomSlotIndex];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];

    // Remove the selected slot and any overlapping slots
    availableSlots.splice(randomSlotIndex, 1);
    const startTime = parseInt(selectedSlot.start.split(':')[0]);
    availableSlots.filter(slot => {
      const slotStart = parseInt(slot.start.split(':')[0]);
      return Math.abs(slotStart - startTime) >= 4;
    });

    schedule.push({
      date: selectedDate,
      startTime: selectedSlot.start,
      endTime: selectedSlot.end,
      location: randomLocation.address,
      client_id: randomLocation.client_id,
      valid: Math.random() > 0.1
    });
  }

  // Sort schedule by start time
  return schedule.sort((a, b) => 
    a.startTime.localeCompare(b.startTime)
  );
};

// Generate 100 mock workers with realistic schedules
const generateMockWorkers = (): WorkerData[] => {
  const names = [
    "John Smith", "Maria Garcia", "David Chen", "Sarah Johnson",
    "Michael Brown", "Emma Wilson", "James Lee", "Sofia Rodriguez",
    "William Davis", "Olivia Taylor", "Lucas Martin", "Isabella Anderson",
    "Alexander Kim", "Nina Patel", "Marcus Thompson", "Ana Santos"
  ];

  const bios = [
    "Experienced house cleaner specializing in eco-friendly cleaning solutions",
    "Professional cleaner with expertise in deep cleaning and organization",
    "Dedicated cleaning specialist with attention to detail",
    "Certified cleaning professional with focus on customer satisfaction",
    "Experienced in both residential and commercial cleaning services"
  ];

  return Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    name: names[Math.floor(Math.random() * names.length)],
    shifts: Array.from({ length: Math.floor(Math.random() * 3) + 3 }, () => ({
      date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        .toISOString().split('T')[0],
      startTime: "09:00:00",
      endTime: "17:00:00",
      valid: Math.random() > 0.2
    })),
    schedule: generateWorkerSchedule(),
    phoneNumber: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    supervisor: Math.floor(Math.random() * 5) + 1,
    supervisor_number: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    bio: bios[Math.floor(Math.random() * bios.length)],
  }));
};

const mockWorkers = generateMockWorkers();

const WorkerProfiles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredWorkers, setFilteredWorkers] =
    useState<WorkerData[]>(mockWorkers);
  const workersPerPage = 9;

  useEffect(() => {
    const results = mockWorkers.filter(
      (worker) =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.phoneNumber.includes(searchTerm) ||
        worker.bio.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredWorkers(results);
    setCurrentPage(1);
  }, [searchTerm]);

  const indexOfLastWorker = currentPage * workersPerPage;
  const indexOfFirstWorker = indexOfLastWorker - workersPerPage;
  const currentWorkers = filteredWorkers.slice(
    indexOfFirstWorker,
    indexOfLastWorker
  );
  const totalPages = Math.ceil(filteredWorkers.length / workersPerPage);

  const ScheduleDialog = ({ schedule }: { schedule: Schedule[] }) => (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Worker Schedule</DialogTitle>
      </DialogHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedule.map((appointment, idx) => {
            const startTime = new Date(`2024-01-01T${appointment.startTime}`);
            const endTime = new Date(`2024-01-01T${appointment.endTime}`);
            const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
            
            return (
              <TableRow key={idx}>
                <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {appointment.startTime.slice(0, 5)} - {appointment.endTime.slice(0, 5)}
                </TableCell>
                <TableCell>{duration} hours</TableCell>
                <TableCell className="max-w-xs truncate">{appointment.location}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    appointment.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {appointment.valid ? 'Confirmed' : 'Pending'}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </DialogContent>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Worker Profiles</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search workers..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentWorkers.map((worker) => (
          <Card key={worker.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
              <div className="flex-1">
                <CardTitle className="text-lg">{worker.name}</CardTitle>
                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="w-4 h-4 mr-1" />
                  <p>{worker.phoneNumber}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">{worker.bio}</p>

                <div className="flex items-center justify-between text-sm">
                  <span>Supervisor ID: {worker.supervisor}</span>
                  <span>{worker.supervisor_number}</span>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      View Schedule ({worker.schedule.length} appointments)
                    </Button>
                  </DialogTrigger>
                  <ScheduleDialog schedule={worker.schedule} />
                </Dialog>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>
                    Active Shifts:{" "}
                    {worker.shifts.filter((shift) => shift.valid).length}
                  </span>
                  <span>
                    Next Shift:{" "}
                    {worker.shifts
                      .filter((shift) => new Date(shift.date) > new Date())
                      .sort(
                        (a, b) =>
                          new Date(a.date).getTime() -
                          new Date(b.date).getTime()
                      )[0]?.date || "None scheduled"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className={
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 2
            )
            .map((page, index, array) => (
              <React.Fragment key={page}>
                {index > 0 && array[index - 1] !== page - 1 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              </React.Fragment>
            ))}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default WorkerProfiles;
