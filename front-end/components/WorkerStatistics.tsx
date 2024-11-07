import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle } from 'lucide-react';
import axios from 'axios';

interface Property {
  propertyId: number;
  clientId: number;
  address: string;
  postalCode: string;
}

interface Shift {
  id: number;
  workers: number[];
  property: Property;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  arrivalImage: any;
  workerIds: number[];
}

interface WorkerStatisticsProps {
  shifts: Shift[];
}

interface WorkerNames {
  [key: number]: string;
}

const WorkerStatistics: React.FC<WorkerStatisticsProps> = ({ shifts }) => {
  const [statistics, setStatistics] = useState<{
    weeklyHours: { [key: string]: { [workerId: number]: number } };
    monthlyHours: { [key: string]: { [workerId: number]: number } };
    annualHours: { [key: string]: { [workerId: number]: number } };
    leaveStats: { [key: string]: { [workerId: number]: number } };
    overtimeHours: { [key: string]: { [workerId: number]: number } };
  }>({
    weeklyHours: {},
    monthlyHours: {},
    annualHours: {},
    leaveStats: {},
    overtimeHours: {}
  });
  const [workerNames, setWorkerNames] = useState<WorkerNames>({});

  // Fetch worker names
  const fetchWorkerName = async (workerId: number) => {
    try {
      const response = await axios.get(`http://localhost:8080/workers/${workerId}`);
      setWorkerNames(prev => ({
        ...prev,
        [workerId]: response.data.name
      }));
    } catch (error) {
      console.error(`Error fetching worker name for ID ${workerId}:`, error);
      setWorkerNames(prev => ({
        ...prev,
        [workerId]: `Worker ${workerId}`  
      }));
    }
  };

  useEffect(() => {
    const workerIds = JSON.parse(localStorage.getItem("user") || "{}").workers || [];
    
    workerIds.forEach(id => {
      fetchWorkerName(id);
    });

    const calculateStatistics = (shiftsData: Shift[]) => {
      const validShifts = shiftsData.filter(shift => 
        typeof shift === 'object' && 
        shift !== null && 
        shift.workers && 
        shift.workers.some(id => workerIds.includes(id))
      );

      const stats: {
        weeklyHours: { [key: string]: { [workerId: number]: number } };
        monthlyHours: { [key: string]: { [workerId: number]: number } };
        annualHours: { [key: string]: { [workerId: number]: number } };
        leaveStats: { [key: string]: { [workerId: number]: number } };
        overtimeHours: { [key: string]: { [workerId: number]: number } };
      } = {
        weeklyHours: {},
        monthlyHours: {},
        annualHours: {},
        leaveStats: {},
        overtimeHours: {}
      };

      validShifts.forEach(shift => {
        const date = new Date(shift.date);
        const startTime = new Date(`${shift.date}T${shift.startTime}`);
        const endTime = new Date(`${shift.date}T${shift.endTime}`);
        const hoursWorked = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

        shift.workers.forEach(workerId => {
          if (workerIds.includes(workerId)) {
            // Weekly hours
            const weekKey = `${date.getFullYear()}-W${getWeekNumber(date)}`;
            stats.weeklyHours[weekKey] = stats.weeklyHours[weekKey] || {};
            stats.weeklyHours[weekKey][workerId] = (stats.weeklyHours[weekKey][workerId] || 0) + hoursWorked;

            // Monthly hours
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            stats.monthlyHours[monthKey] = stats.monthlyHours[monthKey] || {};
            stats.monthlyHours[monthKey][workerId] = (stats.monthlyHours[monthKey][workerId] || 0) + hoursWorked;

            // Annual hours
            const yearKey = date.getFullYear().toString();
            stats.annualHours[yearKey] = stats.annualHours[yearKey] || {};
            stats.annualHours[yearKey][workerId] = (stats.annualHours[yearKey][workerId] || 0) + hoursWorked;

            // Calculate overtime
            if (stats.weeklyHours[weekKey][workerId] > 44) {
              stats.overtimeHours[weekKey] = stats.overtimeHours[weekKey] || {};
              stats.overtimeHours[weekKey][workerId] = stats.weeklyHours[weekKey][workerId] - 44;
            }
          }
        });
      });

      return stats;
    };

    setStatistics(calculateStatistics(shifts));
  }, [shifts]);

  const getWeekNumber = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const prepareChartData = (data: any) => {
    return Object.entries(data).map(([period, workerHours]) => ({
      period,
      ...(typeof workerHours === 'object' ? workerHours : {})
    }));
  };

  const hasOvertimeData = Object.keys(statistics.overtimeHours).length > 0;
  const hasMonthlyData = Object.keys(statistics.monthlyHours).length > 0;

  // Custom tooltip to display worker names
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow">
          <p className="text-sm font-medium">{`Period: ${label}`}</p>
          {payload.map((entry: any) => (
            <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
              {`${workerNames[entry.dataKey] || `Worker ${entry.dataKey}`}: ${entry.value.toFixed(1)} hours`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Working Hours</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {hasMonthlyData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prepareChartData(statistics.monthlyHours, 'monthly')}>
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => workerNames[value] || `Worker ${value}`} />
                {Object.keys(statistics.monthlyHours[Object.keys(statistics.monthlyHours)[0]] || {}).map((workerId) => (
                  <Bar 
                    key={workerId} 
                    dataKey={workerId} 
                    name={workerId}
                    fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>No monthly data available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overtime Hours</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {hasOvertimeData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prepareChartData(statistics.overtimeHours, 'overtime')}>
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => workerNames[value] || `Worker ${value}`} />
                {Object.keys(statistics.overtimeHours[Object.keys(statistics.overtimeHours)[0]] || {}).map((workerId) => (
                  <Bar 
                    key={workerId} 
                    dataKey={workerId} 
                    name={workerId}
                    fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>No overtime hours recorded</p>
                <p className="text-sm mt-1">All workers are within standard working hours</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkerStatistics;