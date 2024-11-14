import { ScheduleComponent, ViewsDirective, ViewDirective, Inject, Day, Week, Month, DragAndDrop } from "@syncfusion/ej2-react-schedule";
import { registerLicense } from "@syncfusion/ej2-base";
import React, { useEffect, useState } from "react";
import axios from 'axios';
import ProfilePage from "../profile";

registerLicense("Ngo9BigBOggjHTQxAR8/V1NDaF5cWWtCf1JpRGRGfV5ycEVHYlZTRXxcR00DNHVRdkdnWH9feHVXRGFfV012V0U=");

const SHIFT_API_URL = 'http://localhost:8080/shifts';
const WORKER_API_URL = 'http://localhost:8080/workers';

interface ApiProperty {
    address: string;
    postalCode: string;
}

interface ApiItem {
    id: number; // TaskId
    workers: number[]; // Array of Worker IDs
    property?: ApiProperty;
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
    shifts: number[];
}
interface EventData {
    Ids: number[]; // Array of Worker IDs
    Subject: string; // Worker Names
    StartTime: Date;
    EndTime: Date;
    IsAllDay: boolean;
    Address: string;
    Status: string;
    TaskId: number; // Task ID
}



export default function Schedule() {
    const [apiData, setApiData] = useState<ApiItem[]>([]);
    const [eventsData, setEventsData] = useState<EventData[]>([]);
    const [workerIdFilter, setWorkerIdFilter] = useState<number | null>(null);
    // const [uniqueWorkerIds, setUniqueWorkerIds] = useState<number[]>([]);
    const [uniqueWorkers, setUniqueWorkers] = useState<{ id: number; name: string }[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [userRole, setUserRole] = useState("");
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        // Fetch shift and worker data from the API and transform it
        const fetchData = async () => {
            try {
                const [shiftResponse, workerResponse] = await Promise.all([
                    axios.get<ApiItem[]>(SHIFT_API_URL),
                    axios.get<Worker[]>(WORKER_API_URL)
                ]);

                setApiData(shiftResponse.data);
                setUniqueWorkers(workerResponse.data.map(worker => ({ id: worker.id, name: worker.name })));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Transform shift data to EventData format once both apiData and uniqueWorkers are populated
        if (apiData.length && uniqueWorkers.length) {
            const transformedData = apiData.map((item: ApiItem) => {
                const workerNames = item.workers
                    .map(workerId => uniqueWorkers.find(worker => worker.id === workerId)?.name || `Worker ${workerId}`)
                    .join(", ");

                const subjectPrefix = item.workers.length > 1 ? "Workers" : "Worker";
                const subject = `${subjectPrefix} ${workerNames}`;

                return {
                    Ids: item.workers,
                    Subject: subject,
                    StartTime: new Date(`${item.date}T${item.startTime}`),
                    EndTime: new Date(`${item.date}T${item.endTime}`),
                    IsAllDay: false,
                    Address: item.property ? item.property.address : "N/A",
                    Status: item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase(),
                    TaskId: item.id
                };
            });

            setEventsData(transformedData);
        }
    }, [apiData, uniqueWorkers]);

    useEffect(() => {
        // Fetch the user role and user ID from local storage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserRole(user.role);
            setUserId(user.id); // Set the user's ID
        }
    }, []);

    // Filtered data based on the selected worker ID or name and search term
    const filteredEvents = eventsData.filter(event => {
        // Exclude events with a "Cancelled" status
        if (event.Status.toLowerCase() === "cancelled") return false;

        const matchesWorkerFilter = userRole === "admin" 
            ? (workerIdFilter !== null ? event.Ids.includes(workerIdFilter) : true)
            : event.Ids.includes(userId!); // Only show events for the logged-in worker

        // Combine worker names and IDs into a single searchable string
        const workerDetails = event.Ids.map(id => {
            const worker = uniqueWorkers.find(worker => worker.id === id);
            return worker ? `${worker.id} ${worker.name}` : "";
        }).join(", ");

        const matchesSearchTerm = searchTerm
        ? workerDetails.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

        return matchesWorkerFilter && matchesSearchTerm;
    });

    return (
        <main className="flex flex-col items-center min-h-screen">
            {userRole === "admin" && (
            <div className="w-full max-w-5xl text-center">
                {/* Dropdown to select worker */}
                <select onChange={(e) => setWorkerIdFilter(Number(e.target.value) || null)} className="m-4 p-2 border">
                    <option value="">All Workers</option>
                    {uniqueWorkers.map(worker => (
                        <option key={worker.id} value={worker.id}>
                            {worker.id}. {worker.name}
                        </option>
                    ))}
                    {/* Add more options dynamically or as needed */}
                </select>

                {/* Search input */}
                <input
                    type="text"
                    placeholder="Search for Worker..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border border-gray-300 rounded ml-2"
                />
            </div>
        )}
                
                <div className="w-full">
                    <ScheduleComponent
                    className="mx-auto"
      
                    width="95%"
                    height={650}
                    allowMultiDrag={true}
                    eventSettings={{
                        dataSource: filteredEvents,
                        fields: {
                            location: { name: 'Address' },
                        }
                    }} 
                    currentView="Month"
                    selectedDate={new Date(2024, 8, 15)}
                >
                        <ViewsDirective>
                            <ViewDirective option="Day" />
                            <ViewDirective option="Week" />
                            <ViewDirective option="Month" />
                        </ViewsDirective>

                        <Inject services={[Day, Week, Month, DragAndDrop]} />
                    </ScheduleComponent>
                </div>
                

            
        </main>
    );
}