import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { WorkerData } from "@/types/dashboard";

interface WorkerTableProps {
  workers: WorkerData[];
}

const WorkerTable: React.FC<WorkerTableProps> = ({ workers }) => {
  const displayedWorkers = workers.slice(0, 2); 

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workers Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {displayedWorkers.map((worker) => (
          <Card key={worker.id} className="mb-4">
            <CardHeader>
              <CardTitle>{worker.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Phone:</strong> {worker.phoneNumber}</p>
              <p><strong>Supervisor:</strong> {worker.supervisor}</p>
              <p><strong>Supervisor Number:</strong> {worker.supervisor_number}</p>
              <p><strong>Bio:</strong> {worker.bio}</p>
              <p><strong>Upcoming Jobs:</strong> {worker.schedule.filter(job => job.status === "upcoming").length}</p>
            </CardContent>
          </Card>
        ))}

        {workers.length > 2 && <p className="text-gray-500">... and {workers.length - 2} more workers</p>}

        <Link href="/workerprofile">
          <Button className="mt-4">View All Workers</Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default WorkerTable;