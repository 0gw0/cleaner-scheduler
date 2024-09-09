import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import Metric from '@/components/ui/metric';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  jobsPerMonth: { month: string; jobs: number }[];
  clientProfile: { totalClients: number; newClients: number; terminatedClients: number };
  newJobs: number;
  newClients: number;
  cancelledAndRescheduled: number;
}

const Dashboard: React.FC<DashboardProps> = ({
  jobsPerMonth,
  clientProfile,
  newJobs,
  newClients,
  cancelledAndRescheduled,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>Jobs per Month</CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={jobsPerMonth}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="jobs" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Client Profile</CardHeader>
        <CardContent>
          <Metric value={clientProfile.totalClients} label="Total Clients" />
          <Metric value={clientProfile.newClients} label="New Clients" />
          <Metric value={clientProfile.terminatedClients} label="Terminated Clients" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Recent Activity</CardHeader>
        <CardContent>
          <Metric value={newJobs} label="New Jobs" />
          <Metric value={newClients} label="New Clients" />
          <Metric value={cancelledAndRescheduled} label="Cancelled/Rescheduled" />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;