import { ScheduleComponent, ViewsDirective, ViewDirective, Inject, Day, Week, Month, DragAndDrop } from "@syncfusion/ej2-react-schedule";
import { registerLicense } from "@syncfusion/ej2-base";
import { DataManager, ODataV4Adaptor, Query } from '@syncfusion/ej2-data';
import React, { useEffect, useState, useMemo } from "react";
import axios from 'axios';

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



// Hard coded data for testing
const data = [
    {
        Id: 61,
        Subject: 'Vaccuming',
        StartTime: new Date(2024, 9, 4, 9, 30),
        EndTime: new Date(2024, 9, 4, 10, 30),
        IsAllDay: false,
        Address: 'SMU',
        RecurrenceRule: 'FREQ=DAILY;INTERVAL=1;COUNT=5', // Repeat 5 times
        RecurrenceException: '20241005,20241006',
        // status: "Completed",
        // ProjectId: 2,
        // TaskId: 2
    }, {
        Id: 62,
        Subject: 'Bug Automation',
        StartTime: new Date(2024, 9, 4, 13, 30),
        EndTime: new Date(2024, 9, 4, 16, 30),
        IsAllDay: false,
        ProjectId: 2,
        TaskId: 1
    }, {
        Id: 63,
        Subject: 'Functionality testing',
        StartTime: new Date(2024, 9, 4, 9),
        EndTime: new Date(2024, 9, 4, 10, 30),
        IsAllDay: false,
        // ProjectId: 1,
        // TaskId: 1
    }, {
        Id: 64,
        Subject: 'Resolution-based testing',
        StartTime: new Date(2024, 9, 4, 12),
        EndTime: new Date(2024, 9, 4, 13),
        IsAllDay: false,
        // ProjectId: 1,
        // TaskId: 1
    }, {
        Id: 65,
        Subject: 'Test report Validation',
        StartTime: new Date(2024, 9, 4, 15),
        EndTime: new Date(2024, 9, 4, 18),
        IsAllDay: false,
        Status: "Completed",
        Priority: "High",
        // ProjectId: 1,
        // TaskId: 1
    }, {
        Id: 66,
        Subject: 'Test case correction',
        StartTime: new Date(2024, 9, 9, 14),
        EndTime: new Date(2024, 9, 9, 16),
        IsAllDay: false,
        Status: "Completed",
        Priority: "High",
        // ProjectId: 1,
        // TaskId: 2
    }, {
        Id: 67,
        Subject: 'Bug fixing',
        StartTime: new Date(2024, 9, 4, 14, 30),
        EndTime: new Date(2024, 9, 4, 18, 30),
        IsAllDay: false,
        Status: "Completed",
        Priority: "High",
        // ProjectId: 2,
        // TaskId: 2
    }, {
        Id: 68,
        Subject: 'Run test cases',
        StartTime: new Date(2024, 9, 4, 17, 30),
        EndTime: new Date(2024, 9, 4, 19, 30),
        IsAllDay: false,
        Status: "Completed",
        Priority: "High",
        // ProjectId: 1,
        // TaskId: 2
    }, {
        Id: 70,
        Subject: 'Bug Automation',
        StartTime: new Date(2024, 9, 4, 18, 30),
        EndTime: new Date(2024, 9, 4, 20),
        IsAllDay: false,
        Status: "Completed",
        Priority: "High",
        // ProjectId: 2,
        // TaskId: 1
    }
];

export default function Schedule() {
    const [apiData, setApiData] = useState<ApiItem[]>([]);
    const [eventsData, setEventsData] = useState<EventData[]>([]);
    const [workerIdFilter, setWorkerIdFilter] = useState<number | null>(null);
    // const [uniqueWorkerIds, setUniqueWorkerIds] = useState<number[]>([]);
    const [uniqueWorkers, setUniqueWorkers] = useState<{ id: number; name: string }[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

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


    // Filtered data based on the selected worker ID or name and search term
    const filteredEvents = eventsData.filter(event => {
        const matchesWorkerFilter = workerIdFilter !== null 
            ? event.Ids.includes(workerIdFilter)
            : true;

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
                {/* Dropdown to select worker */}
                <div className="w-full max-w-5xl text-center">
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
                        placeholder="Search for Worker Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 border border-gray-300 rounded ml-2"
                    />
                </div>
                <div className="w-full">
                    <ScheduleComponent
                    // className="m-12"
                    width="100%"
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