import React, { useState, useEffect } from 'react';
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
import { WorkerData, ScheduleItem } from "@/types/dashboard";


export const mockWorkers: WorkerData[] = [
  {
    id: 1,
    name: "David Chen",
    shifts: [
      {
        date: "2024-07-23",
        startTime: "09:00:00",
        endTime: "17:00:00",
        valid: true
      },
      {
        date: "2024-12-19",
        startTime: "09:00:00",
        endTime: "17:00:00",
        valid: true
      },
      {
        date: "2024-10-07",
        startTime: "09:00:00",
        endTime: "17:00:00",
        valid: true
      },
      {
        date: "2024-04-02",
        startTime: "09:00:00",
        endTime: "17:00:00",
        valid: false
      }
    ],
    schedule: [
      {
        id: "1a",
        date: "2024-11-24",
        startTime: "13:00:00",
        endTime: "16:00:00",
        location: "123 Main St, Brooklyn, NY 11201",
        client_id: 1,
        valid: true,
        status: "upcoming"
      },
      {
        id: "1b",
        date: "2024-11-24",
        startTime: "14:00:00",
        endTime: "17:00:00",
        location: "456 Park Ave, Manhattan, NY 10022",
        client_id: 2,
        valid: true,
        status: "upcoming"
      }
    ],
    phoneNumber: "(499) 653-2151",
    supervisor: 1,
    supervisor_number: "(974) 308-8994",
    bio: "Experienced house cleaner specializing in eco-friendly cleaning solutions"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    shifts: [
      {
        date: "2024-08-15",
        startTime: "08:00:00",
        endTime: "16:00:00",
        valid: true
      },
      {
        date: "2024-09-01",
        startTime: "09:00:00",
        endTime: "17:00:00",
        valid: false
      }
    ],
    schedule: [
      {
        id: "2a",
        date: "2024-10-05",
        startTime: "10:00:00",
        endTime: "14:00:00",
        location: "789 Broadway, Queens, NY 11373",
        client_id: 3,
        valid: true,
        status: "upcoming"
      },
      {
        id: "2b",
        date: "2024-10-06",
        startTime: "09:00:00",
        endTime: "12:00:00",
        location: "321 5th Ave, Manhattan, NY 10016",
        client_id: 4,
        valid: true,
        status: "upcoming"
      },
      {
        id: "2c",
        date: "2024-09-30",
        startTime: "13:00:00",
        endTime: "17:00:00",
        location: "654 Atlantic Ave, Brooklyn, NY 11217",
        client_id: 5,
        valid: false,
        status: "cancelled",
        cancelReason: "Client rescheduled"
      }
    ],
    phoneNumber: "(212) 555-1234",
    supervisor: 3,
    supervisor_number: "(212) 555-5678",
    bio: "Detailed-oriented cleaner with 5+ years of experience in residential cleaning"
  },
  {
    id: 3,
    name: "Michael Rodriguez",
    shifts: [
      {
        date: "2024-11-01",
        startTime: "07:00:00",
        endTime: "15:00:00",
        valid: true
      },
      {
        date: "2024-11-02",
        startTime: "07:00:00",
        endTime: "15:00:00",
        valid: true
      }
    ],
    schedule: [
      {
        id: "3a",
        date: "2024-10-15",
        startTime: "08:00:00",
        endTime: "11:00:00",
        location: "987 Northern Blvd, Queens, NY 11101",
        client_id: 6,
        valid: true,
        status: "completed"
      },
      {
        id: "3b",
        date: "2024-10-15",
        startTime: "13:00:00",
        endTime: "16:00:00",
        location: "147 Madison Ave, Manhattan, NY 10016",
        client_id: 7,
        valid: true,
        status: "completed"
      }
    ],
    phoneNumber: "(347) 555-9876",
    supervisor: 2,
    supervisor_number: "(347) 555-4321",
    bio: "Experienced in both residential and commercial cleaning with a focus on customer satisfaction"
  },
  {
    id: 4,
    name: "Emily Nguyen",
    shifts: [
      {
        date: "2024-12-01",
        startTime: "09:00:00",
        endTime: "17:00:00",
        valid: true
      },
      {
        date: "2024-12-02",
        startTime: "09:00:00",
        endTime: "17:00:00",
        valid: true
      }
    ],
    schedule: [
      {
        id: "4a",
        date: "2024-11-20",
        startTime: "10:00:00",
        endTime: "13:00:00",
        location: "258 Court St, Brooklyn, NY 11201",
        client_id: 8,
        valid: true,
        status: "upcoming"
      }
    ],
    phoneNumber: "(718) 555-3456",
    supervisor: 1,
    supervisor_number: "(718) 555-7890",
    bio: "Specializes in green cleaning techniques and allergy-friendly cleaning products"
  },
  {
    id: 5,
    name: "James Wilson",
    shifts: [
      {
        date: "2024-10-10",
        startTime: "08:00:00",
        endTime: "16:00:00",
        valid: true
      },
      {
        date: "2024-10-11",
        startTime: "08:00:00",
        endTime: "16:00:00",
        valid: false
      }
    ],
    schedule: [
      {
        id: "5a",
        date: "2024-10-01",
        startTime: "09:00:00",
        endTime: "12:00:00",
        location: "123 Main St, Brooklyn, NY 11201",
        client_id: 1,
        valid: true,
        status: "completed"
      },
      {
        id: "5b",
        date: "2024-10-01",
        startTime: "14:00:00",
        endTime: "17:00:00",
        location: "456 Park Ave, Manhattan, NY 10022",
        client_id: 2,
        valid: true,
        status: "completed"
      }
    ],
    phoneNumber: "(646) 555-2468",
    supervisor: 3,
    supervisor_number: "(646) 555-1357",
    bio: "Experienced in high-end residential cleaning with attention to detail"
  }
];

const WorkerProfiles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredWorkers, setFilteredWorkers] = useState<WorkerData[]>(mockWorkers);
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

  const ScheduleDialog = ({ schedule }: { schedule: ScheduleItem[] }) => (
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
          {schedule.map((appointment) => {
            const startTime = new Date(`2024-01-01T${appointment.startTime}`);
            const endTime = new Date(`2024-01-01T${appointment.endTime}`);
            const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
            
            return (
              <TableRow key={appointment.id}>
                <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {appointment.startTime.slice(0, 5)} - {appointment.endTime.slice(0, 5)}
                </TableCell>
                <TableCell>{duration} hours</TableCell>
                <TableCell className="max-w-xs truncate">{appointment.location}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
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
                    Active Shifts: {worker.shifts.filter((shift) => shift.valid).length}
                  </span>
                  <span>
                    Next Shift: {
                      worker.shifts
                        .filter((shift) => new Date(shift.date) > new Date())
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]?.date || "None scheduled"
                    }
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
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
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
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default WorkerProfiles;