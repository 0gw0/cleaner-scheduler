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

export default function LoginPage() {
  const [userType, setUserType] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    //  API call to authenticate the user
    if (email && password && userType) {
      if (
        userType === "admin" &&
        email === "admin@gmail.com" &&
        password === "admin123"
      ) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userType', 'admin');
        router.push("/homepage");
        router.push('/homepage').then(() => {
          if (router.pathname !== '/homepage') {
            window.location.href = '/homepage';
          }
        });
      } else if (
        userType === "maid" &&
        email === "maid@gmail.com" &&
        password === "maid123"
      ) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userType', 'maid');
        router.push("/homepage");
        router.push('/homepage').then(() => {
          if (router.pathname !== '/homepage') {
            window.location.href = '/homepage';
          }
        });
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
              <label
                htmlFor="userType"
                className="block text-sm font-medium text-gray-700"
              >
                User Type
              </label>
              <Select onValueChange={(value: string) => setUserType(value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="maid">Maid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
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
            <Button type="button" className="w-full">
              <Link href="/signup">
                Register here
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}