'use client';
import React, { useState, FormEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import axios from "axios";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export default function Signup() {
	const router = useRouter();
	const [showDialog, setShowDialog] = useState(false);
	const [formData, setFormData] = useState({
		fullName: '',
		phoneNumber: '',
		email: '',
		homePostalCode: '',
		bio: '',
		password: '',
		confirmPassword: '',
		supervisorId: ''
	});

	const [formError, setFormError] = useState<string | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		setFormData(prev => ({
			...prev,
			[id]: value
		}));
	};

	const validateForm = () => {
		const requiredFields = ['fullName', 'phoneNumber', 'email', 'homePostalCode', 'password', 'confirmPassword', 'supervisorId'];
		const hasEmptyFields = requiredFields.some(field => !formData[field as keyof typeof formData].trim());

		if (hasEmptyFields) {
			setFormError('Please fill up all fields');
			return false;
		}

		if (formData.password !== formData.confirmPassword) {
			setFormError('Passwords do not match');
			return false;
		}

		const supervisorId = formData.supervisorId.trim();
		if (!/^\d+$/.test(supervisorId)) {
			setFormError('Supervisor ID must be a valid number');
			return false;
		}

		setFormError(null);
		return true;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (validateForm()) {
			try {
				const response = await axios.post("http://localhost:8080/workers", {
					name: formData.fullName,
					phoneNumber: formData.phoneNumber,
					bio: formData.bio,
					email: formData.email,
					homePostalCode: formData.homePostalCode,
					supervisorId: parseInt(formData.supervisorId),
					password: formData.password
				});

				if (response.status === 201) {
					setShowDialog(true);
				}
			} catch (error: any) {
				if (error.response?.status === 409) {
					setFormError('Email already exists');
				} else if (error.response?.status === 404) {
					setFormError('Supervisor not found');
				} else {
					setFormError('An error occurred. Please try again.');
				}
				console.error('Registration error:', error);
			}
		}
	};

	const handleLoginRedirect = () => {
		router.push('/login');
	};

	return (
		<>
			<div className="flex justify-center items-center min-h-screen">
				<div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white">
					<h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
						Welcome to Egg Scheduler
					</h2>
					<p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
						Register to Egg Scheduler
					</p>

					<form className="my-8" onSubmit={handleSubmit}>
						{formError && (
							<div className="mb-4 p-2 text-red-500 text-sm font-semibold bg-red-50 border border-red-200 rounded">
								{formError}
							</div>
						)}

						<LabelInputContainer>
							<Label htmlFor="fullName">Full Name</Label>
							<Input
								id="fullName"
								placeholder="e.g. Alpha Lynn"
								type="text"
								value={formData.fullName}
								onChange={handleChange}
							/>
						</LabelInputContainer>

						<LabelInputContainer>
							<Label htmlFor="phoneNumber">Phone Number</Label>
							<Input
								id="phoneNumber"
								placeholder="e.g. 98765432"
								type="text"
								value={formData.phoneNumber}
								onChange={handleChange}
							/>
						</LabelInputContainer>

						<LabelInputContainer>
							<Label htmlFor="homePostalCode">Home Postal Code</Label>
							<Input
								id="homePostalCode"
								placeholder="e.g. 549630"
								type="text"
								value={formData.homePostalCode}
								onChange={handleChange}
							/>
						</LabelInputContainer>

						<LabelInputContainer>
							<Label htmlFor="email">Email Address</Label>
							<Input
								id="email"
								placeholder="e.g. Fraserchua@wolfgang.com"
								type="email"
								value={formData.email}
								onChange={handleChange}
							/>
						</LabelInputContainer>

						<LabelInputContainer className="mb-4">
							<Label htmlFor="bio">Bio</Label>
							<Input
								id="bio"
								placeholder="e.g. I am very hardworking and efficient, hire me please!"
								type="text"
								value={formData.bio}
								onChange={handleChange}
							/>
						</LabelInputContainer>

						<LabelInputContainer className="mb-4">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								placeholder=""
								type="password"
								value={formData.password}
								onChange={handleChange}
							/>
						</LabelInputContainer>

						<LabelInputContainer className="mb-4">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								placeholder=""
								type="password"
								value={formData.confirmPassword}
								onChange={handleChange}
							/>
						</LabelInputContainer>

						<LabelInputContainer className="mb-8">
							<Label htmlFor="supervisorId">Supervisor ID</Label>
							<Input
								id="supervisorId"
								placeholder="e.g. 1"
								type="text"
								value={formData.supervisorId}
								onChange={handleChange}
							/>
						</LabelInputContainer>

						<Button
							className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
							type="submit"
						>
							Register Now
							<BottomGradient />
						</Button>

						<Button
							className="bg-gradient-to-br mt-2 relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
						>
							<Link href="/login">Log In here</Link>
							<BottomGradient />
						</Button>

						<div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
					</form>
				</div>
			</div>

			<Dialog open={showDialog} onOpenChange={setShowDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Registration Successful!</DialogTitle>
						<DialogDescription className="pt-5 text-l">
							To complete your registration, please check your email for a verification link. <br /> <br />
							Click on the link to verify your email address and activate your account.
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end mt-4">
						<Button onClick={handleLoginRedirect}>
							Login
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

const BottomGradient = () => {
	return (
		<>
			<span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
			<span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
		</>
	);
};

const LabelInputContainer = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div className={cn('flex flex-col space-y-2 w-full', className)}>
			{children}
		</div>
	);
};
