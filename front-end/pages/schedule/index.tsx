import { ScheduleComponent, ViewsDirective, ViewDirective, Inject, Day, Week, Month, DragAndDrop } from "@syncfusion/ej2-react-schedule";
import { registerLicense } from "@syncfusion/ej2-base";
import { useMemo } from "react";
import React from 'react';

registerLicense("Ngo9BigBOggjHTQxAR8/V1NDaF5cWWtCf1JpRGRGfV5ycEVHYlZTRXxcR00DNHVRdkdnWH9feHVXRGFfV012V0U=");

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
    // const memoizedData = useMemo(() => data, []);

    return (
        <main 
        className="flex justify-content items-center min-h-screen">
            <ScheduleComponent
            className="m-12"
            // width={1000}
            height={650}
            allowMultiDrag={true} 
            eventSettings={{
                dataSource: data,
                fields: {
                    location: { name: 'Address' },
                }
            }} 
            currentView="Month"
            selectedDate={new Date(2024, 9, 15)} 
            >
                <ViewsDirective>
                    <ViewDirective option="Day" />
                    <ViewDirective option="Week" />
                    <ViewDirective option="Month" />
                </ViewsDirective>

                <Inject services={[Day, Week, Month, DragAndDrop]} />
            </ScheduleComponent>
            
        </main>
    );
}