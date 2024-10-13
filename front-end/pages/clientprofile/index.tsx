import React, { useState, useEffect } from "react";
import { Search, MapPin, User, Calendar, Briefcase } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

interface Property {
  id: number;
  address: string;
  postalCode: string;
  client: number;
}

interface Client {
  id: number;
  name: string;
  properties: Property[];
}

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

interface Worker {
  id: number;
  name: string;
  phoneNumber: string;
  supervisor: number;
  bio: string;
  homePostalCode: string;
}

const ClientProfiles = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('http://localhost:8080/clients');
        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    const fetchShifts = async () => {
      try {
        const response = await fetch('http://localhost:8080/shifts');
        const data = await response.json();
        setShifts(data);
      } catch (error) {
        console.error("Error fetching shifts:", error);
      }
    };

    fetchClients();
    fetchShifts();
  }, []);

  useEffect(() => {
    let results = [...clients];

    if (searchTerm) {
      results = results.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.properties.some(property => 
            property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.postalCode.includes(searchTerm)
          )
      );
    }

    setFilteredClients(results);
  }, [searchTerm, clients]);

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

  const fetchWorkerDetails = async (workerId: number): Promise<Worker> => {
    try {
      const response = await fetch(`http://localhost:8080/workers/${workerId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching worker details:", error);
      throw error;
    }
  };

  const PropertiesDialog = ({ properties }: { properties: Property[] }) => (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Client Properties</DialogTitle>
      </DialogHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>Postal Code</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property.id}>
              <TableCell>{property.address}</TableCell>
              <TableCell>{property.postalCode}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DialogContent>
  );

  const ShiftsDialog = ({ clientId }: { clientId: number }) => {
    const [clientShifts, setClientShifts] = useState<Shift[]>([]);
    const [workerDetails, setWorkerDetails] = useState<{ [key: number]: Worker }>({});

    useEffect(() => {
      const filteredShifts = shifts.filter(shift => shift.property.clientId === clientId);
      setClientShifts(filteredShifts);

      const fetchWorkers = async () => {
        const workerIds = [...new Set(filteredShifts.map(shift => shift.worker))];
        const workerPromises = workerIds.map(id => fetchWorkerDetails(id));
        const workers = await Promise.all(workerPromises);
        const workerMap = workers.reduce((acc, worker) => {
          acc[worker.id] = worker;
          return acc;
        }, {} as { [key: number]: Worker });
        setWorkerDetails(workerMap);
      };

      fetchWorkers();
    }, [clientId]);

    return (
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Client Shifts</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Worker</TableHead>
              <TableHead>Worker Phone</TableHead>
              <TableHead>Supervisor ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientShifts.map((shift) => (
              <TableRow key={shift.id}>
                <TableCell>{new Date(shift.date).toLocaleDateString()}</TableCell>
                <TableCell>{`${shift.startTime} - ${shift.endTime}`}</TableCell>
                <TableCell>{getStatusBadge(shift.status)}</TableCell>
                <TableCell>{workerDetails[shift.worker]?.name || 'Loading...'}</TableCell>
                <TableCell>{workerDetails[shift.worker]?.phoneNumber || 'Loading...'}</TableCell>
                <TableCell>{workerDetails[shift.worker]?.supervisor || 'Loading...'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    );
  };

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
                  <p className="truncate">{client.properties[0]?.address}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-1" />
                    <span>Postal Code:</span>
                  </div>
                  <span className="text-sm font-medium">
                    {client.properties[0]?.postalCode}
                  </span>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      View Properties ({client.properties.length})
                    </Button>
                  </DialogTrigger>
                  <PropertiesDialog properties={client.properties} />
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Briefcase className="w-4 h-4 mr-2" />
                      View Shifts
                    </Button>
                  </DialogTrigger>
                  <ShiftsDialog clientId={client.id} />
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClientProfiles;