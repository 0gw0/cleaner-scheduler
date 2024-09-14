import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusCardProps } from '../types/dashboard';

const StatusCard: React.FC<StatusCardProps> = ({
	title,
	value,
	icon: Icon,
}) => (
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

export default StatusCard;
