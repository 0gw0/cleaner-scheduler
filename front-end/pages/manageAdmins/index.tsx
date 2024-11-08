import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from 'lucide-react';

const ManageAdmins = () => {
  const [admins, setAdmins] = useState<{ id: string; name: string; workers: any[] }[]>([]);
  const [workerDetails, setWorkerDetails] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [newAdminName, setNewAdminName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Fetch admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await fetch('http://localhost:8080/admins');
        const data = await response.json();
        const nonRootAdmins = data.filter((admin: { root: boolean }) => !admin.root);
        setAdmins(nonRootAdmins);
        
        nonRootAdmins.forEach((admin: { id: string; workers: any[] }) => {
          if (admin.workers.length > 0) {
            fetchWorkerDetails(admin.id);
          }
        });
      } catch (error) {
        console.error('Error fetching admins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

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

  // Create new admin
  const handleCreateAdmin = async () => {
    if (!newAdminName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch('http://localhost:8080/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newAdminName }),
      });

      if (response.ok) {
        const newAdmin = await response.json();
        setAdmins(prev => [...prev, newAdmin]);
        setNewAdminName('');
        setDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating admin:', error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Administrators</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((admin) => (
          <Card key={admin.id} className="shadow-lg">
            <CardHeader>
              <CardTitle>{admin.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">ID: {admin.id}</p>
                <div>
                  <p className="font-medium">Workers ({admin.workers.length}):</p>
                  {workerDetails[admin.id] ? (
                    <ul className="list-disc list-inside">
                      {workerDetails[admin.id].map(worker => (
                        <li key={worker.id} className="text-sm">
                          {worker.name} - {worker.status}
                        </li>
                      ))}
                    </ul>
                  ) : admin.workers.length > 0 ? (
                    <p className="text-sm text-gray-500">Loading worker details...</p>
                  ) : (
                    <p className="text-sm text-gray-500">No workers assigned</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManageAdmins;