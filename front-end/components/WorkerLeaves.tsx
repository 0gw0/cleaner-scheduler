import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

interface Leave {
  id: number;
  startDate: string;
  endDate: string;
}

interface Worker {
  id: number;
  name: string;
  annualLeaves: Leave[];
  medicalLeaves: Leave[];
}


const WorkerLeaves: React.FC<Record<string, never>> = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await fetch(`http://localhost:8080/workers`);
        if (!response.ok) {
          throw new Error('Failed to fetch workers');
        }
        const data = await response.json();
        setWorkers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

  
      fetchWorkers();
    
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (err) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Worker Leave Records
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {workers.map((worker) => (
            <div key={worker.id} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">{worker.name}</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Annual Leaves ({worker.annualLeaves.length})</h4>
                  {worker.annualLeaves.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Duration</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {worker.annualLeaves.map((leave) => (
                          <TableRow key={leave.id}>
                            <TableCell>{formatDate(leave.startDate)}</TableCell>
                            <TableCell>{formatDate(leave.endDate)}</TableCell>
                            <TableCell>
                              {Math.ceil(
                                (new Date(leave.endDate) - new Date(leave.startDate)) / 
                                (1000 * 60 * 60 * 24)
                              ) + 1} days
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500 italic">No annual leaves recorded</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Medical Leaves ({worker.medicalLeaves.length})</h4>
                  {worker.medicalLeaves.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Duration</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {worker.medicalLeaves.map((leave) => (
                          <TableRow key={leave.id}>
                            <TableCell>{formatDate(leave.startDate)}</TableCell>
                            <TableCell>{formatDate(leave.endDate)}</TableCell>
                            <TableCell>
                              {Math.ceil(
                                (new Date(leave.endDate) - new Date(leave.startDate)) / 
                                (1000 * 60 * 60 * 24)
                              ) + 1} days
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500 italic">No medical leaves recorded</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkerLeaves;