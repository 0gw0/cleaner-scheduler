import React, { useState, useEffect } from "react";
import { Search, MapPin, User, Calendar, Home } from "lucide-react";
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

// Updated Types
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

const ClientProfiles = () => {
  const [clients, setClients] = useState<Client[]>([]);
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

    fetchClients();
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
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <p className="truncate">{client.properties[0]?.address}</p>
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <User className="w-4 h-4 mr-1" />
                  <p>Client ID: {client.id}</p>
                </div>
                
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Home className="w-4 h-4 mr-1" />
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClientProfiles;