import React, { useState, useEffect } from 'react';
import { Search, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/router";
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
import { Badge } from "@/components/ui/badge";

interface Shift {
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
  status: string;
}

interface Leave {
  id: number;
  startDate: string;
  endDate: string;
}

interface WorkerData {
  id: number;
  name: string;
  shifts: Shift[];
  phoneNumber: string;
  supervisor: number;
  bio: string;
  annualLeaves: Leave[];
  medicalLeaves: Leave[];
  homePostalCode: string;
}

const WorkerProfiles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [workerData, setWorkerData] = useState<WorkerData[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<WorkerData[]>([]);
  const workersPerPage = 9;
  const router = useRouter();

  const handleViewSchedule = (workerId: number) => {
    router.push(`/workerdashboard/${workerId}`);
  };

  useEffect(() => {
    const fetchWorkerData = async () => {
      const userWorkers = JSON.parse(localStorage.getItem('user') || '{}').workers || [];
      const workerPromises = userWorkers.map((id: number) =>
        fetch(`http://localhost:8080/workers/${id}`).then(res => res.json())
      );
      const workers = await Promise.all(workerPromises);
      setWorkerData(workers);
      setFilteredWorkers(workers);
    };

    fetchWorkerData();
  }, []);

  useEffect(() => {
    const results = workerData.filter(
      (worker) =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.bio.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredWorkers(results);
    setCurrentPage(1);
  }, [searchTerm, workerData]);

  const indexOfLastWorker = currentPage * workersPerPage;
  const indexOfFirstWorker = indexOfLastWorker - workersPerPage;
  const currentWorkers = filteredWorkers.slice(
    indexOfFirstWorker,
    indexOfLastWorker
  );
  const totalPages = Math.ceil(filteredWorkers.length / workersPerPage);

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      COMPLETED: "bg-green-100 text-green-800",
      UPCOMING: "bg-blue-100 text-blue-800",
      CANCELLED: "bg-red-100 text-red-800",
      INPROGRESS: "bg-yellow-100 text-yellow-800",
    };

    return (
      <Badge className={`${statusColors[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </Badge>
    );
  };

  const ScheduleDialog = ({ shifts }: { shifts: Shift[] }) => (
    <DialogContent className="max-w-4xl">
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
          {shifts.map((shift) => {
            const startTime = new Date(`2024-01-01T${shift.startTime}`);
            const endTime = new Date(`2024-01-01T${shift.endTime}`);
            const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

            return (
              <TableRow key={shift.id}>
                <TableCell>{new Date(shift.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {shift.startTime.slice(0, 5)} - {shift.endTime.slice(0, 5)}
                </TableCell>
                <TableCell>{duration} hours</TableCell>
                <TableCell className="max-w-xs truncate">{shift.property.address}</TableCell>
                <TableCell>{getStatusBadge(shift.status)}</TableCell>
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
                </div>

                {/* <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      View Schedule ({worker.shifts.length} shifts)
                    </Button>
                  </DialogTrigger>
                  <ScheduleDialog shifts={worker.shifts} />
                </Dialog> */}

                <div className="text-center">
                  <Button
                    variant="link"
                    className="text-blue-600 hover:underline"
                    onClick={() => handleViewSchedule(worker.id)}
                  >
                    View {worker.name}'s Schedule
                  </Button>
                  
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>
                    Total Shifts: {worker.shifts.length}
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