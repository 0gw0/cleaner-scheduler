import React, { useState } from 'react';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import axios from 'axios';

interface PhotoUploadDialogProps {
	isOpen: boolean;
	onClose: () => void;
	endpoint: string;
	shiftId: number;
	onUploadSuccess?: (response: any) => void;
}

const PhotoUploadDialog: React.FC<PhotoUploadDialogProps> = ({
	isOpen,
	onClose,
	endpoint,
	shiftId,
	onUploadSuccess,
}) => {
	const [photoFile, setPhotoFile] = useState<File | null>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setPhotoFile(e.target.files[0]);
		}
	};

	const handlePhotoSubmit = async () => {
		if (photoFile) {
			const formData = new FormData();
			formData.append('file', photoFile);

			// Get workerId from localStorage
			const userDetails = localStorage.getItem('user');
			const workerId = userDetails ? JSON.parse(userDetails).id : null;

			if (!workerId) {
				console.error('Worker ID not found');
				return;
			}

			// Append workerId to formData
			formData.append('workerId', workerId.toString());

			try {
				const response = await axios.post(
					endpoint.replace(':shiftId', shiftId.toString()),
					formData,
					{
						headers: {
							'Content-Type': 'multipart/form-data',
						},
					}
				);
				console.log(
					`Photo uploaded successfully for shift ${shiftId}:`,
					response.data
				);
				if (onUploadSuccess) {
					onUploadSuccess(response.data);
				}
				onClose();
			} catch (error) {
				console.error(
					`Error uploading photo for shift ${shiftId}:`,
					error
				);
			}
		}
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Submit Photo</AlertDialogTitle>
					<AlertDialogDescription>
						Please upload a photo for this shift.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<Input
					type="file"
					accept="image/*"
					capture="environment"
					onChange={handleFileChange}
					className="my-4"
				/>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onClose}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handlePhotoSubmit}
						disabled={!photoFile}
					>
						Submit
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default PhotoUploadDialog;
