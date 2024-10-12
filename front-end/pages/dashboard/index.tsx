import React, { useState, useEffect } from "react";
import {
  UserData,
  MonthlyData,
  ClientData,
  WorkerData,
} from "@/types/dashboard";
import AdminDashboard from "@/components/AdminDashboard";
import WorkerDashboard from "@/components/WorkerDashboard";


const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [workerData, setWorkerData] = useState<WorkerData>({
    ...JSON.parse(localStorage.getItem('user') || '{}'),
  });

  const [monthlyData] = useState<MonthlyData[]>([
    {
      month: "Jan",
      jobs: 120,
      newJobs: 15,
      newClients: 5,
      terminatedClients: 2,
      cancellations: 8,
    },
    {
      month: "Feb",
      jobs: 150,
      newJobs: 20,
      newClients: 7,
      terminatedClients: 1,
      cancellations: 10,
    },
    {
      month: "Mar",
      jobs: 180,
      newJobs: 25,
      newClients: 10,
      terminatedClients: 3,
      cancellations: 12,
    },
    {
      month: "Apr",
      jobs: 160,
      newJobs: 25,
      newClients: 10,
      terminatedClients: 3,
      cancellations: 12,
    },
    {
      month: "May",
      jobs: 200,
      newJobs: 25,
      newClients: 10,
      terminatedClients: 3,
      cancellations: 12,
    },
    {
      month: "Jun",
      jobs: 180,
      newJobs: 25,
      newClients: 10,
      terminatedClients: 3,
      cancellations: 12,
    },
    {
      month: "Jul",
      jobs: 150,
      newJobs: 25,
      newClients: 10,
      terminatedClients: 3,
      cancellations: 12,
    },
    {
      month: "Aug",
      jobs: 160,
      newJobs: 25,
      newClients: 10,
      terminatedClients: 3,
      cancellations: 12,
    },
    {
      month: "Sept",
      jobs: 182,
      newJobs: 25,
      newClients: 10,
      terminatedClients: 3,
      cancellations: 12,
    },
    {
      month: "Oct",
      jobs: 190,
      newJobs: 25,
      newClients: 10,
      terminatedClients: 3,
      cancellations: 12,
    },
    {
      month: "Nov",
      jobs: 182,
      newJobs: 25,
      newClients: 10,
      terminatedClients: 3,
      cancellations: 12,
    },
    {
      month: "Dec",
      jobs: 182,
      newJobs: 25,
      newClients: 10,
      terminatedClients: 3,
      cancellations: 12,
    },
  ]);
  

  const mockWorkers: WorkerData[] = [
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

  const [workers] = useState(mockWorkers);



  

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }

    // Fetch clients data
    const fetchClients = async () => {
      try {
        const response = await fetch('http://localhost:8080/clients');
        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }
        const clientsData: ClientData[] = await response.json();
        
        // Transform the data to match the Client interface
        const transformedClients: ClientData[] = clientsData.map(client => ({
          id: client.id,
          name: client.name,
          address: client.properties[0]?.address || '',
          postalCode: client.properties[0]?.postalCode || '',
          status: 'Active', 
          cleaningJobs: [], 
          preferredCleaner: 'Fake Halimah', 
          jobs: 0, 
        }));

        setClients(transformedClients);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, []);

  const handleCancelShift = (shiftId: string, reason: string) => {
    console.log(`Cancelling shift ${shiftId} with reason: ${reason}`);
    
    setWorkerData(prevData => ({
      ...prevData,
      schedule: prevData.shifts.map(shift =>
        shift.id === shiftId
          ? { ...shift, status: 'cancelled', cancelReason: reason }
          : shift
      )
    }));
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  if (userData.role === "worker") {
    return <WorkerDashboard 
      workerData={workerData}
      onCancelShift={handleCancelShift}
    />;
  }

  if (userData.role === "admin") {
    return (
      <AdminDashboard
        monthlyData={monthlyData}
        clients={clients}
        workers={workers}
      />
    );
  }

  return <div>Unauthorized access</div>;
};

export default Dashboard;