import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Ban } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

const ManageAdmins = () => {
  const [admins, setAdmins] = useState<{ id: string; name: string; root: boolean; workers: any[] }[]>([]);
  const [workerDetails, setWorkerDetails] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [newAdminName, setNewAdminName] = useState('');
  const [newSupervisorId, setNewSupervisorId] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
  const [adminToTerminate, setAdminToTerminate] = useState<{ id: string; name: string } | null>(null);
  const [creating, setCreating] = useState(false);
  const [terminating, setTerminating] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/admins');
      const data = await response.json();
      const nonRootAdmins = data.filter((admin: { root: boolean }) => !admin.root);
      setAdmins(data);
    
      setWorkerDetails({});
      
      nonRootAdmins.forEach((admin: { id: string; workers: any[] }) => {
        if (admin.workers.length > 0) {
          fetchWorkerDetails(admin.id);
        }
      });
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        title: "Error",
        description: "Failed to fetch administrators",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const getAvailableSupervisors = (excludeId?: string) => {
    return admins.filter(admin => 
      !admin.root && 
      admin.id !== excludeId
    );
  };

  const fetchWorkerDetails = async (adminId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/workers?supervisorId=${adminId}`);
      const data = await response.json();
      setWorkerDetails(prev => ({
        ...prev,
        [adminId]: data
      }));
    } catch (error) {
      console.error(`Error fetching worker details for admin ${adminId}:`, error);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch('http://localhost:8080/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: newAdminName,
        }),
      });

      if (response.ok) {
        await fetchAdmins(); 
        setNewAdminName('');
        setDialogOpen(false);
        toast({
          title: "Success",
          description: "Administrator created successfully",
        });
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      toast({
        title: "Error",
        description: "Failed to create administrator",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleTerminateAdmin = async () => {
    if (!adminToTerminate || !newSupervisorId) return;

    setTerminating(true);
    try {
      const response = await fetch(`http://localhost:8080/admins/${adminToTerminate.id}/terminate`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supervisorId: newSupervisorId
        })
      });

      if (response.ok) {
        await fetchAdmins(); 
        setTerminateDialogOpen(false);
        setAdminToTerminate(null);
        setNewSupervisorId('');
        toast({
          title: "Success",
          description: "Administrator terminated successfully",
        });
      }
    } catch (error) {
      console.error('Error terminating admin:', error);
      toast({
        title: "Error",
        description: "Failed to terminate administrator",
        variant: "destructive",
      });
    } finally {
      setTerminating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const nonRootAdmins = admins.filter(admin => !admin.root);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Manage Administrators</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Administrator</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Administrator Name</Label>
                <Input
                  id="name"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Enter admin name"
                />
              </div>
              <Button 
                onClick={handleCreateAdmin} 
                disabled={creating || !newAdminName.trim()}
                className="w-full"
              >
                {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Administrator
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {nonRootAdmins.map((admin) => (
          <Card key={admin.id} className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">{admin.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-gray-500">ID: {admin.id}</p>
                <div>
                  <p className="font-medium text-sm sm:text-base">Workers ({admin.workers.length}):</p>
                  {workerDetails[admin.id] ? (
                    <ul className="list-disc list-inside">
                      {workerDetails[admin.id].map(worker => (
                        <li key={worker.id} className="text-xs sm:text-sm">
                          {worker.name} - {worker.status}
                        </li>
                      ))}
                    </ul>
                  ) : admin.workers.length > 0 ? (
                    <p className="text-xs sm:text-sm text-gray-500">Loading worker details...</p>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500">No workers assigned</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => {
                  setAdminToTerminate(admin);
                  setTerminateDialogOpen(true);
                }}
                className="w-full"
              >
                <Ban className="w-4 h-4 mr-2" />
                Terminate
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={terminateDialogOpen} onOpenChange={setTerminateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Terminate Administrator</DialogTitle>
            <DialogDescription>
              To terminate {adminToTerminate?.name}, please select a new supervisor for their workers:
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="newSupervisor">New Supervisor</Label>
            <Select
              value={newSupervisorId}
              onValueChange={setNewSupervisorId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a new supervisor" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableSupervisors(adminToTerminate?.id).map((admin) => (
                  <SelectItem key={admin.id} value={admin.id.toString()}>
                    {admin.name} (ID: {admin.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTerminateDialogOpen(false);
                setNewSupervisorId('');
              }}
              disabled={terminating}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handleTerminateAdmin}
              disabled={terminating || !newSupervisorId}
              className="w-full sm:w-auto"
            >
              {terminating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Terminate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageAdmins;