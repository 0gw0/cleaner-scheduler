import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  name: string;
  role: 'staff' | 'manager' | 'director' | 'hr' | 'senior_management';
  email?: string;
  department?: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setEditedUser(JSON.parse(storedUser));
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedUser) {
      localStorage.setItem('user', JSON.stringify(editedUser));
      setUser(editedUser);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedUser) {
      setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
    }
  };

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
          
          {isEditing ? (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={editedUser?.name} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={editedUser?.email || ''} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" value={editedUser?.department || ''} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" name="newPassword" value='' onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="cfmPassword">Confirm Password</Label>
                <Input id="cfmPassword" name="cfmPassword" value='' onChange={handleChange} />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSave}>Save Changes</Button>
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              </div>
            </form>
          ) : (
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
              <Button onClick={handleEdit}>Edit Profile</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;