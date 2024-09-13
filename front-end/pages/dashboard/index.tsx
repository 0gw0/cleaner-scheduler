import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, CheckSquare, Settings, Home, Briefcase } from "lucide-react";
import FlexibleCalendar from "@/components/calendar";


const StatusCard = ({ title, value, icon: Icon }) => (
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


const QuickActions = () => (
  <Card>
    <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col space-y-2">
      <Button className="w-full">
        <Home className="mr-2 h-4 w-4"/> Apply for WFH
      </Button>
      <Button className="w-full" variant="outline">
        <Briefcase className="mr-2 h-4 w-4" /> View Team Schedule
      </Button>
    </CardContent>
  </Card>
);


const PendingRequests = () => (
  <Card>
    <CardHeader>
      <CardTitle>Pending WFH Requests</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        <li className="flex justify-between items-center">
          <span>John Doe</span>
          <div>
            <Button size="sm" className="mr-2">Approve</Button>
            <Button size="sm" variant="outline">Reject</Button>
          </div>
        </li>
        <li className="flex justify-between items-center">
          <span>Jane Smith</span>
          <div>
            <Button size="sm" className="mr-2">Approve</Button>
            <Button size="sm" variant="outline">Reject</Button>
          </div>
        </li>
      </ul>
    </CardContent>
  </Card>
);

const Dashboard = () => {
 
  const userDetails = localStorage.getItem('user'); 
  const userRole = userDetails ? JSON.parse(userDetails).role : '';
  const isManager = userRole === 'manager';
  const events = [
    {
      title: 'WFH',
      start: new Date(2024, 8, 16),
      end: new Date(2024, 8, 16),
      allDay: true,
    },
    {
      title: 'Office',
      start: new Date(2024, 8, 17),
      end: new Date(2024, 8, 17),
      allDay: true,
    },
    {
      title: 'WFH',
      start: new Date(2024, 8, 18),
      end: new Date(2024, 8, 18),
      allDay: true,
    },
  ];

  const handleSelectEvent = (event) => {
    console.log('Event selected:', event);
    // Handle event selection (e.g., show details, edit event)
  };

  const handleSelectSlot = (slotInfo) => {
    console.log('Slot selected:', slotInfo);
    // Handle slot selection (e.g., create new event)
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* change the value -> call api or smth */}
        <StatusCard title="Today's Status" value="WFH" icon={Home} />
        <StatusCard title="WFH Days This Month" value="8/12" icon={Calendar} />
        <StatusCard title="Team Members WFH Today" value="5" icon={Users} />
        <StatusCard title="Pending WFH Requests" value="4" icon={CheckSquare} />
        <StatusCard title="Pending Approval Requests" value={isManager ? "2" : "0"} icon={CheckSquare} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <FlexibleCalendar 
            events={events} 
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
          />
        </div>
        <div className="space-y-6">
          <QuickActions />
          {isManager && <PendingRequests />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;