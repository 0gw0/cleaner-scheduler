import React, { useState, useEffect } from "react";
import { Search, MapPin, User, Calendar } from "lucide-react";
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

// Types
interface CleaningJob {
  id: string;
  type: string;
  date: string;
  status: string;
  price: number;
}

interface Client {
  id: number;
  name: string;
  address: string;
  cleaningJobs: CleaningJob[];
  preferredCleaner: string;
  status: string;
}

// Mock Data
const mockClients: Client[] = [
  {
    id: 1,
    name: "Fraser Chua",
    address: "Kovan S549610 Mansion",
    status: "Active",
    cleaningJobs: [
      {
        id: "1",
        type: "Deep Cleaning",
        date: "2024-03-15",
        status: "Completed",
        price: 200,
      },
      {
        id: "2",
        type: "Regular Cleaning",
        date: "2024-03-22",
        status: "Scheduled",
        price: 120,
      },
      {
        id: "3",
        type: "Window Cleaning",
        date: "2024-03-29",
        status: "Pending",
        price: 150,
      },
    ],
    preferredCleaner: "Maria Rodriguez",

  },
  {
    id: 2,
    name: "Glen Wang",
    address: "Botanic Garden S549120 Mansion",
    status: "Active",
    cleaningJobs: [
      {
        id: "4",
        type: "Move-out Cleaning",
        date: "2024-03-18",
        status: "Scheduled",
        price: 300,
      },
      {
        id: "5",
        type: "Regular Cleaning",
        date: "2024-03-25",
        status: "Pending",
        price: 120,
      },
    ],
    preferredCleaner: "Maria Arpit",
  },
  {
    id: 3,
    name: "Sasha Grey",
    address: "789 Pine Road, Queens, NY 11375",
    status: "Active",
    cleaningJobs: [
      {
        id: "6",
        type: "Deep Cleaning",
        date: "2024-03-20",
        status: "Completed",
        price: 200,
      },
      {
        id: "7",
        type: "Regular Cleaning",
        date: "2024-03-27",
        status: "Scheduled",
        price: 120,
      },
    ],
    preferredCleaner: "Fatzilla Gorloc",
 
  },
];

const ClientProfiles = () => {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClients, setFilteredClients] = useState<Client[]>(clients);

  useEffect(() => {
    let results = [...clients];

    if (searchTerm) {
      results = results.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.preferredCleaner
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredClients(results);
  }, [searchTerm, clients]);

  const JobsDialog = ({ jobs }: { jobs: CleaningJob[] }) => (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Cleaning Jobs History</DialogTitle>
      </DialogHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell>{new Date(job.date).toLocaleDateString()}</TableCell>
              <TableCell>{job.type}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    job.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : job.status === "Scheduled"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {job.status}
                </span>
              </TableCell>
              <TableCell>${job.price}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DialogContent>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Client Profiles</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search clients..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
          
              <div className="flex-1">
                <CardTitle className="text-lg">{client.name}</CardTitle>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-1" />
                  <p className="truncate">{client.address}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-1" />
                    <span>Preferred Cleaner:</span>
                  </div>
                  <span className="text-sm font-medium">
                    {client.preferredCleaner}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-1" />
                    <span>Status:</span>
                  </div>
                  <span className="text-sm font-medium">
                    {client.status}
                  </span>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      View Cleaning Jobs ({client.cleaningJobs.length})
                    </Button>
                  </DialogTrigger>
                  <JobsDialog jobs={client.cleaningJobs} />
                </Dialog>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>
                    Last Service:{" "}
                    {new Date(
                      client.cleaningJobs.sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime()
                      )[0].date
                    ).toLocaleDateString()}
                  </span>
                  <span>
                    Next Service:{" "}
                    {client.cleaningJobs
                      .filter((job) => job.status === "Scheduled")
                      .sort(
                        (a, b) =>
                          new Date(a.date).getTime() -
                          new Date(b.date).getTime()
                      )[0]?.date
                      ? new Date(
                          client.cleaningJobs
                            .filter((job) => job.status === "Scheduled")
                            .sort(
                              (a, b) =>
                                new Date(a.date).getTime() -
                                new Date(b.date).getTime()
                            )[0].date
                        ).toLocaleDateString()
                      : "None scheduled"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClientProfiles;
