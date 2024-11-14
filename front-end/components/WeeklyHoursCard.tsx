import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle } from 'lucide-react';

interface WeeklyHoursCardProps {
  statistics: {
    weeklyHours: {
      [key: string]: {
        [workerId: string]: number;
      };
    };
  };
  workerNames: {
    [workerId: string]: string;
  };
}

const WeeklyHoursCard: React.FC<WeeklyHoursCardProps> = ({ statistics, workerNames }) => {
  // Get all unique worker IDs across all weeks
  const getAllWorkerIds = (weeklyData: { [s: string]: unknown; } | ArrayLike<unknown>) => {
    const workerIds = new Set();
    Object.values(weeklyData).forEach(week => {
      Object.keys(week as object).forEach(workerId => {
        workerIds.add(workerId);
      });
    });
    return Array.from(workerIds);
  };

  const prepareChartData = (data: ArrayLike<unknown> | { [s: string]: unknown; }) => {
    const allWorkerIds = getAllWorkerIds(data);
    
    return Object.entries(data).map(([period, workers]) => {
      const weekData = {
        period: period
      };
      
      // Initialize all worker hours to 0
      allWorkerIds.forEach(workerId => {
        weekData[workerId] = workers[workerId] || 0;
      });
      
      return weekData;
    });
  };

  const CustomTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: string }> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow">
          <p className="text-sm font-medium">{`Week: ${label}`}</p>
          {payload.map((entry: { dataKey: React.Key | null | undefined; color: any; value: number; }) => (
            <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
              {`${workerNames[String(entry.dataKey)] || `Worker ${entry.dataKey}`}: ${entry.value.toFixed(1)} hours`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getWorkerColor = (workerId: unknown) => {
    const colors = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed'];
    return colors[parseInt(workerId) % colors.length];
  };

  const hasWeeklyData = Object.keys(statistics.weeklyHours).length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Working Hours</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {hasWeeklyData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={prepareChartData(statistics.weeklyHours)}>
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(value) => workerNames[value] || `Worker ${value}`} />
              {getAllWorkerIds(statistics.weeklyHours).map((workerId) => (
                <Bar
                  key={workerId}
                  dataKey={workerId}
                  name={workerId}
                  fill={getWorkerColor(workerId)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <AlertCircle className="mx-auto h-8 w-8 mb-2" />
              <p>No weekly data available</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyHoursCard;