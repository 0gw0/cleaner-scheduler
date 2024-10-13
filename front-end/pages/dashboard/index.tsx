import React, { useState, useEffect } from "react";
import {
  UserData,
  MonthlyData,
  ClientData,
  WorkerData,
} from "@/types/dashboard";
import AdminDashboard from "@/components/AdminDashboard";
import WorkerDashboard from "@/components/WorkerDashboard";
import axios from "axios";

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [workerData, setWorkerData] = useState<WorkerData[]>([]);
  const [worker] = useState<WorkerData[]>({...JSON.parse(localStorage.getItem('user') || '{}'),});

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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserData(parsedUser);
    }
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("http://localhost:8080/clients");
        if (!response.ok) {
          throw new Error("Failed to fetch clients");
        }
        const clientsData: ClientData[] = await response.json();

        const transformedClients: ClientData[] = clientsData.map((client) => ({
          id: client.id,
          name: client.name,
          properties: client.properties,
          address: client.properties[0]?.address || "",
          postalCode: client.properties[0]?.postalCode || "",
          status: "Active",
          cleaningJobs: [],
          preferredCleaner: "Fake Halimah",
          jobs: 0,
        }));

        setClients(transformedClients);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    const fetchWorkers = async () => {
      if (!userData || userData.role !== "admin") return;

      try {
        const workerIds = userData.workers || [];
        const workerPromises = workerIds.map((id) =>
          axios
            .get(`http://localhost:8080/workers/${id}`)
            .then((res) => res.data)
        );
        const workerArray = await Promise.all(workerPromises);
        setWorkerData(workerArray);
      } catch (error) {
        console.error("Error fetching worker data:", error);
      }
    };

    if (userData) {
      fetchClients();
      if (userData.role === "admin") {
        fetchWorkers();
      }
    }
  }, [userData]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  if (userData.role === "worker") {
    return <WorkerDashboard workerData={worker} />;
  }

  if (userData.role === "admin") {
    return (
      <AdminDashboard
        monthlyData={monthlyData}
        clients={clients}
        workerData={workerData}
      />
    );
  }

  return <div>Unauthorized access</div>;
};

export default Dashboard;