import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar as CalendarIcon,
  Users,
  Briefcase,
  UserPlus,
  UserMinus,
  XCircle,
  Phone,
  LucideIcon
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import WorkerCalendar from '@/components/calendar';

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

interface MonthlyData {
  month: string;
  jobs: number;
  newJobs: number;
  newClients: number;
  terminatedClients: number;
  cancellations: number;
}

interface Client {
  name: string;
  status: string;
  jobs: number;
}

interface Workers {
  name: string;
  jobs: number;
}

interface Shift {
  date: string;
  startTime: string;
  endTime: string;
  valid: boolean;
}

interface ScheduleItem extends Shift {
  location: string;
  client_id: number;
}

interface WorkerData {
  id: number;
  name: string;
  shifts: Shift[];
  schedule: ScheduleItem[];
  phoneNumber: string;
  supervisor: number;
  supervisor_number: string;
  bio: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, value, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const JobsChart: React.FC<{ data: MonthlyData[] }> = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle>Jobs per Month</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="jobs" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const ClientsTable: React.FC<{ clients: Client[] }> = ({ clients }) => (
  <Card>
    <CardHeader>
      <CardTitle>Clients' Profile</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Jobs</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, index) => (
              <tr key={index}>
                <td className="p-2">{client.name}</td>
                <td className="p-2">{client.status}</td>
                <td className="p-2">{client.jobs}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button className="mt-4" variant="outline">
          View All
        </Button>
      </div>
    </CardContent>
  </Card>
);

const WorkerTable: React.FC<{ workers: Workers[] }> = ({ workers }) => (
  <Card>
    <CardHeader>
      <CardTitle>Workers' Profile</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Jobs</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((worker, index) => (
              <tr key={index}>
                <td className="p-2">{worker.name}</td>
                <td className="p-2">{worker.jobs}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button className="mt-4" variant="outline">
          View All
        </Button>
      </div>
    </CardContent>
  </Card>
);

const WorkerSchedule: React.FC<{ schedule: ScheduleItem[] }> = ({ schedule }) => (
  <Card>
    <CardHeader>
      <CardTitle>Upcoming Work Schedule</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {schedule.map((item, index) => (
          <div key={index} className="bg-secondary p-4 rounded-lg">
            <p className="font-semibold">{new Date(item.date).toLocaleDateString()}</p>
            <p>{`${item.startTime} - ${item.endTime}`}</p>
            <p>{`Location: ${item.location}`}</p>
            <p>{`Client ID: ${item.client_id}`}</p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const WorkerDashboard: React.FC<{ workerData: WorkerData }> = ({ workerData }) => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Worker Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatusCard title="Name" value={workerData.name} icon={Users} />
        <StatusCard title="Phone Number" value={workerData.phoneNumber} icon={Phone} />
        <StatusCard title="Supervisor ID" value={workerData.supervisor} icon={Users} />
      </div>
      <div className="mb-6">
        <WorkerCalendar workerData={workerData} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Worker Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Bio:</strong> {workerData.bio}</p>
          <p><strong>Supervisor Number:</strong> {workerData.supervisor_number}</p>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminDashboard: React.FC<{ monthlyData: MonthlyData[], clients: Client[], workers:Workers[] }> = ({ monthlyData, clients, workers }) => {
  const currentMonth = monthlyData[monthlyData.length - 1];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
        <StatusCard title="Total Jobs This Month" value={currentMonth.jobs} icon={Briefcase} />
        <StatusCard title="New Jobs" value={currentMonth.newJobs} icon={Briefcase} />
        <StatusCard title="New Clients" value={currentMonth.newClients} icon={UserPlus} />
        <StatusCard title="Terminated Clients" value={currentMonth.terminatedClients} icon={UserMinus} />
        <StatusCard title="Cancellations" value={currentMonth.cancellations} icon={XCircle} />
        <StatusCard title="Active Clients" value={clients.filter(c => c.status === 'Active').length} icon={Users} />
      </div>
      <div>
      <JobsChart data={monthlyData} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        <ClientsTable clients={clients} />
        <WorkerTable workers={workers} />
      </div>
    </div>
  );
};

interface UserData {
  role: 'worker' | 'admin';
  id: string;
  name: string;
}


const mockWorkerData = {
  id: 1,
  name: "Mati",
  shifts: [
    {
      date: "2024-09-12",
      startTime: "09:00:00",
      endTime: "17:00:00",
      valid: true
    },
    {
      date: "2024-09-16",
      startTime: "09:00:00",
      endTime: "17:00:00",
      valid: true
    }
  ],
  schedule: [
    {
      date: "2024-09-14",
      startTime: "09:00:00",
      endTime: "12:00:00",
      location: "123 Main St",
      client_id: 1,
      valid: true
    },
    {
      date: "2024-09-14",
      startTime: "13:00:00",
      endTime: "17:00:00",
      location: "456 Elm",
      client_id: 2,
      valid: true
    }
  ],
  phoneNumber: "1234567890",
  supervisor: 1,
  supervisor_number: "0987654321",
  bio: "eg bio 1"
};

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [monthlyData] = useState<MonthlyData[]>([
    { month: 'Jan', jobs: 120, newJobs: 15, newClients: 5, terminatedClients: 2, cancellations: 8 },
    { month: 'Feb', jobs: 150, newJobs: 20, newClients: 7, terminatedClients: 1, cancellations: 10 },
    { month: 'Mar', jobs: 180, newJobs: 25, newClients: 10, terminatedClients: 3, cancellations: 12 },
    { month: 'Apr', jobs: 160, newJobs: 25, newClients: 10, terminatedClients: 3, cancellations: 12 },
    { month: 'May', jobs: 200, newJobs: 25, newClients: 10, terminatedClients: 3, cancellations: 12 },
    { month: 'Jun', jobs: 180, newJobs: 25, newClients: 10, terminatedClients: 3, cancellations: 12 },
    { month: 'Jul', jobs: 150, newJobs: 25, newClients: 10, terminatedClients: 3, cancellations: 12 },
    { month: 'Aug', jobs: 160, newJobs: 25, newClients: 10, terminatedClients: 3, cancellations: 12 },
    { month: 'Sept', jobs: 182, newJobs: 25, newClients: 10, terminatedClients: 3, cancellations: 12 },

  ]);
  const [clients] = useState<Client[]>([
    { name: 'Client A', status: 'Active', jobs: 5 },
    { name: 'Client B', status: 'Inactive', jobs: 0 },
    { name: 'Client C', status: 'Active', jobs: 3 },
  ]);
  const [workers] = useState<Workers[]>([
    { name: 'Worker A', jobs: 2 },
    { name: 'Worker B', jobs: 1 },
    { name: 'Worker C', jobs: 3 },
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  if (!userData) {
    return <div>Loading...</div>;
  }

  if (userData.role === 'worker') {
    return <WorkerDashboard workerData={mockWorkerData as WorkerData} />;
  }

  if (userData.role === 'admin') {
    return <AdminDashboard monthlyData={monthlyData} clients={clients} workers ={workers} />;
  }

  return <div>Unauthorized access</div>;
};

export default Dashboard;