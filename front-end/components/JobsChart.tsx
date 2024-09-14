import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';
import { MonthlyData } from '../types/dashboard';

interface JobsChartProps {
	data: MonthlyData[];
}

const JobsChart: React.FC<JobsChartProps> = ({ data }) => (
	<Card>
		<CardHeader>
			<CardTitle>Jobs per Month</CardTitle>
		</CardHeader>
		<CardContent>
			<ResponsiveContainer width="100%" height={300}>
				<BarChart data={data}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="month" />
					<YAxis />
					<Tooltip />
					<Legend />
					<Bar dataKey="jobs" fill="#8884d8" />
				</BarChart>
			</ResponsiveContainer>
		</CardContent>
	</Card>
);

export default JobsChart;
