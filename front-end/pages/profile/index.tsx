import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Worker' | 'Root';
  email?: string;
  department?: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);



  if (!user) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-gray-500">{user.role.replace('_', ' ').charAt(0).toUpperCase() + user.role.slice(1)}</p>
            </div>
          </div>
          
          
            <div className="space-y-4">
              <div>
                <Label>ID</Label>
                <p>{user.id}</p>
              </div>
              <div>
                <Label>Name</Label>
                <p>{user.name}</p>
              </div>
              <div>
                <Label>Role</Label>
                <p>{user.role.replace('_', ' ').charAt(0).toUpperCase() + user.role.slice(1)}</p>
              </div>
              {user.email && (
                <div>
                  <Label>Email</Label>
                  <p>{user.email}</p>
                </div>
              )}
              {user.department && (
                <div>
                  <Label>Department</Label>
                  <p>{user.department}</p>
                </div>
              )}
            </div>
      
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;