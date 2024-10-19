import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import WorkerDashboard from "@/components/WorkerDashboard";
import { WorkerData } from "@/types/dashboard";

const WorkerDashboardPage: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [workerData, setWorkerData] = useState<WorkerData | null>(null);

    useEffect(() => {
        if (id) {
            fetchWorkerData(id as string);
        }
    }, [id]);

    const fetchWorkerData = async (workerId: string) => {
        try {
            const response = await fetch(`http://localhost:8080/workers/${workerId}`);
            const data = await response.json();
            setWorkerData(data);
        } catch (error) {
            console.error("Error fetching worker data:", error);
        }
    };

    if (!workerData) {
        return <div>Loading...</div>;
    }

    return <WorkerDashboard workerData={workerData} />;
};

export default WorkerDashboardPage;