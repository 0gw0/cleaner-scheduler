import React, { useState, useEffect, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Calendar } from 'lucide-react';

interface User {
  id: string;
  name: string;
  annualLeaves: { id: string; startDate: string; endDate: string; status?:string }[];
  medicalLeaves: {
    id: string;
    startDate: string;
    endDate: string;
    reason: string;
    pdfUploaded: boolean;
  }[];
}

interface LeaveCardProps {
  title: string;
  leaves: { id: string; startDate: string; endDate: string; reason?: string; pdfUploaded?: boolean; }[];
  renderLeaveItem: (leave: {
    [x: string]: ReactNode; id: string; startDate: string; endDate: string; reason?: string; pdfUploaded?: boolean 
}) => React.ReactNode;
}

const AnnualLeaveDialog = ({
  user,
  onSuccess,
}: {
  user: User;
  onSuccess: () => void;
}) => {
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());
  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    message: '',
  });
  const [isOpen, setIsOpen] = useState(false);

  const resetForm = () => {
    setSelectedStartDate(new Date());
    setSelectedEndDate(new Date());
    setSubmitStatus({ success: false, message: '' });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/workers/${user.id}/annual-leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: format(selectedStartDate, 'yyyy-MM-dd'),
          endDate: format(selectedEndDate, 'yyyy-MM-dd'),
        }),
      });

      if (response.ok) {
        setSubmitStatus({
          success: true,
          message: 'Annual leave application submitted successfully',
        });
        setTimeout(() => {
          setIsOpen(false);
          resetForm();
          onSuccess();
        }, 2000);
      } else {
        throw new Error('Failed to submit annual leave');
      }
    } catch (err) {
      setSubmitStatus({
        success: false,
        message: 'Failed to submit annual leave',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full flex items-center gap-2">
          <Calendar size={16} />
          Apply for Annual Leave
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Annual Leave Application</DialogTitle>
          <DialogDescription>
            Submit your annual leave request below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <Input
              type="date"
              value={format(selectedStartDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedStartDate(new Date(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <Input
              type="date"
              value={format(selectedEndDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedEndDate(new Date(e.target.value))}
              className="w-full"
            />
          </div>

          {submitStatus.message && (
            <Alert variant={submitStatus.success ? "default" : "destructive"}>
              <AlertTitle>
                {submitStatus.success ? "Success" : "Error"}
              </AlertTitle>
              <AlertDescription>{submitStatus.message}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="submit" className="w-full">
              Submit Annual Leave
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const MCUploadDialog = ({
  isOpen,
  onOpenChange,
  leave,
  user,
  onSuccess,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  leave: { id: string; startDate: string; endDate: string; status?:string };
  user: User;
  onSuccess: () => void;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    message: '',
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      setSubmitStatus({ success: false, message: 'No file selected' });
      return;
    }
    const file = files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setSubmitStatus({ success: false, message: '' });
    } else {
      setSubmitStatus({ success: false, message: 'Please upload a PDF file' });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      setSubmitStatus({ success: false, message: 'Please select a file' });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const emailResponse = await fetch('/api/send-mc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'adrian.koh.2022@scis.smu.edu.sg',
            subject: `Medical Certificate Upload - ${leave.startDate} to ${leave.endDate}`,
            from: `${user?.name} - worker ID: ${user?.id}`,
            pdfData: base64Data,
            filename: 'medical-certificate.pdf',
            leaveId: leave.id,
          }),
        });

        if (emailResponse.ok) {
          setSubmitStatus({
            success: true,
            message: 'Medical certificate uploaded successfully',
          });
          setTimeout(() => {
            onOpenChange(false);
            setSelectedFile(null);
            setSubmitStatus({ success: false, message: '' });
            onSuccess();
          }, 2000);
        } else {
          throw new Error('Failed to upload medical certificate');
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setSubmitStatus({
        success: false,
        message: 'Failed to upload medical certificate',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Medical Certificate</DialogTitle>
          <DialogDescription>
            Please upload the medical certificate for your leave from {leave.startDate} to {leave.endDate}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Medical Certificate (PDF only)
            </label>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full"
            />
          </div>

          {submitStatus.message && (
            <Alert variant={submitStatus.success ? "default" : "destructive"}>
              <AlertTitle>
                {submitStatus.success ? "Success" : "Error"}
              </AlertTitle>
              <AlertDescription>{submitStatus.message}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="submit" className="w-full">
              Upload Certificate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const LeaveCard: React.FC<LeaveCardProps> = ({
  title,
  leaves,
  renderLeaveItem,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {leaves.length > 0 ? (
          leaves.map(renderLeaveItem)
        ) : (
          <p className="text-gray-500 italic">
            No {title.toLowerCase()} recorded
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);

const MCApplicationForm = ({
  user,
  onSuccess,
}: {
  user: User;
  onSuccess: () => void;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reason, setReason] = useState('');
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());
  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    message: '',
  });
  const [isOpen, setIsOpen] = useState(false);

  const resetForm = () => {
    setSelectedFile(null);
    setReason('');
    setSelectedStartDate(new Date());
    setSelectedEndDate(new Date());
    setSubmitStatus({ success: false, message: '' });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      setSubmitStatus({ success: false, message: 'No file selected' });
      return;
    }
    const file = files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setSubmitStatus({ success: false, message: '' });
    } else {
      setSubmitStatus({ success: false, message: 'Please upload a PDF file' });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      let base64Data;
      if (selectedFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
          base64Data = (reader.result as string).split(',')[1];
          sendEmail(base64Data);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        sendEmail();
      }
    } catch (err) {
      setSubmitStatus({
        success: false,
        message: 'Failed to submit medical leave',
      });
    }
  };

  const sendEmail = async (pdfData?: string) => {
    const emailResponse = await fetch('/api/send-mc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'adrian.koh.2022@scis.smu.edu.sg',
        subject: `Medical Leave Application - ${format(
          selectedStartDate,
          'yyyy-MM-dd'
        )} to ${format(selectedEndDate, 'yyyy-MM-dd')} for this reason: ${reason}`,
        from: `${user?.name} - worker ID: ${user?.id}`,
        pdfData,
        filename: 'medical-certificate.pdf',
      }),
    });

    if (emailResponse.ok) {
      setSubmitStatus({
        success: true,
        message: 'Medical leave application submitted successfully',
      });
      setTimeout(() => {
        setIsOpen(false);
        resetForm();
        onSuccess();
      }, 2000);
    } else {
      throw new Error('Failed to submit medical leave');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full flex items-center gap-2">
          <Plus size={16} />
          Apply for Medical Leave
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Medical Leave Application</DialogTitle>
          <DialogDescription>
            Submit your medical leave details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <Input
              type="date"
              value={format(selectedStartDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedStartDate(new Date(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <Input
              type="date"
              value={format(selectedEndDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedEndDate(new Date(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for medical leave"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Upload Medical Certificate (PDF)
            </label>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full"
            />
          </div>

          {submitStatus.message && (
            <Alert variant={submitStatus.success ? "default" : "destructive"}>
              <AlertTitle>
                {submitStatus.success ? "Success" : "Error"}
              </AlertTitle>
              <AlertDescription>{submitStatus.message}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="submit" className="w-full">
              Submit Medical Leave
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const WorkerMCPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLeave, setSelectedLeave] = useState<{
    id: string;
    startDate: string;
    endDate: string;
  } | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const fetchUserData = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const response = await fetch(
          `http://localhost:8080/workers/${userData.id}`
        );
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setUser(data);
      }
    } catch (err) {
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUploadClick = (leave: {
    id: string;
    startDate: string;
    endDate: string;
  }) => {
    setSelectedLeave(leave);
    setIsUploadDialogOpen(true);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!user) return <div className="p-8 text-center">Please log in to view this page</div>;

  return (
    <div className=" mx-auto p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <LeaveCard
            title="Annual Leaves"
            leaves={user.annualLeaves}
            renderLeaveItem={(leave) => (
              <div
                key={leave.id}
                className="flex flex-col p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Start Date:</div>
                    <div className="font-medium">{leave.startDate}</div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="text-sm text-gray-600">End Date:</div>
                    <div className="font-medium">{leave.endDate}</div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    leave.status === 'APPROVED' 
                      ? 'bg-green-100 text-green-800' 
                      : leave.status === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {leave.status || 'PENDING'}
                  </span>
                </div>
              </div>
            )}
          />
          <AnnualLeaveDialog user={user} onSuccess={fetchUserData} />
        </div>

        <div className="space-y-4">
          <LeaveCard
            title="Medical Leaves"
            leaves={user.medicalLeaves}
            renderLeaveItem={(leave) => (
              <div
                key={leave.id}
                className="flex flex-col p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Start Date:</div>
                    <div className="font-medium">{leave.startDate}</div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="text-sm text-gray-600">End Date:</div>
                    <div className="font-medium">{leave.endDate}</div>
                  </div>
                </div>
                {!leave.pdfUploaded && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() =>
                        handleUploadClick({
                          id: leave.id,
                          startDate: leave.startDate,
                          endDate: leave.endDate,
                        })
                      }
                    >
                      Upload Medical Certificate
                    </Button>
                  </div>
                )}
              </div>
            )}
          />
          <MCApplicationForm user={user} onSuccess={fetchUserData} />
        </div>
      </div>

      {selectedLeave && (
        <MCUploadDialog
          isOpen={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          leave={selectedLeave}
          user={user}
          onSuccess={fetchUserData}
        />
      )}
    </div>
  );
};

export default WorkerMCPage;