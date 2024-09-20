import React, { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '../../contexts/AuthContext';

// Example user credentials
const userCredentials = {
  admin: { email: "admin@example.com", password: "admin123" },
  worker: { email: "worker@example.com", password: "worker123" },
};

export default function LoginPage() {
  const [userType, setUserType] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (email && password && userType) {
      const credentials = userCredentials[userType as keyof typeof userCredentials];
      if (credentials && email === credentials.email && password === credentials.password) {
        // Simulate successful login
        const user = {
          id: `${userType}-id`, //  this would be a unique user ID
          name: `${userType.charAt(0).toUpperCase() + userType.slice(1)} User`,
          role: userType as 'admin' | 'worker' 
        };
        // localStorage.setItem('user', JSON.stringify(user));
        login(user);
        router.push("/dashboard");
      } else {
        setError("Invalid credentials");
      }
    } else {
      setError("Please fill in all fields");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                User Type
              </label>
              <Select onValueChange={(value: string) => setUserType(value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="worker">Worker</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full">
              Login
            </Button>
            <div className="text-center">
              <Link href="/signup" className="text-blue-600 hover:underline">
                Dont have an account? Register here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}