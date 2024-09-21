import React, { ReactElement } from 'react';
import { Calendar, Users, CheckSquare, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FeatureCardProps } from '@/types/landingPage';

const FeatureCard: React.FC<FeatureCardProps> = ({
	title,
	icon: Icon,
	description,
}) => (
	<Card>
		<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle className="text-sm font-medium">{title}</CardTitle>
			<Icon className="h-4 w-4 text-muted-foreground" />
		</CardHeader>
		<CardContent>
			<div className="text-2xl font-bold">{description}</div>
		</CardContent>
	</Card>
);

export default function LandingPage(): ReactElement {
	const features: FeatureCardProps[] = [
		{
			title: 'Easy Scheduling',
			icon: Calendar,
			description: "Manage Worker's Schedule with ease",
		},
		{
			title: 'Worker Management',
			icon: Users,
			description: 'Organize your workers and tasks',
		},
		{
			title: 'Efficient Planning',
			icon: CheckSquare,
			description: 'Plan tasks with ease',
		},
		{
			title: 'Customization',
			icon: Settings,
			description: 'Tailor to your needs',
		},
	];

	return (
		<div className="flex justify-center items-center min-h-screen">
			<div className="max-h-screen p-8">
				<header className="mb-8 text-center">
					<h1 className="text-4xl font-bold text-gray-800">
						Welcome to the Future of Worker Management
					</h1>
					<p className="text-gray-600 mt-2">
						Efficient scheduling for your workplace
					</p>
				</header>

				<main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
					{features.map((feature, index) => (
						<FeatureCard key={index} {...feature} />
					))}
				</main>

				<div className="mt-12 text-center space-x-4">
					<Link href="/signup">
						<Button size="lg">Get Started</Button>
					</Link>
					<Link href="/login">
						<Button size="lg">Log In</Button>
					</Link>
				</div>

				<footer className="mt-12 text-center text-gray-600">
					© {new Date().getFullYear()} Worker Bee. All rights
					reserved.
				</footer>
			</div>
		</div>
	);
}
