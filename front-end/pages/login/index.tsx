import React, { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage() {
  const [userType, setUserType] = useState<string>("");
  const [ID, setID] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (ID && userType) {
      if (userType === "admin") {
        axios
          .get("http://localhost:8080/admins/" + ID)
          .then((res) => {
            if (res.status === 200 && res.data.password === password && !res.data.root) {
              const user = {
                id: res.data.id,
                name: res.data.name,
                role: userType as "admin" | "worker",
                workers: res.data.workers,
              };
              login(user);
              router.push("/dashboard");
            }
            else if(res.status === 200 && res.data.password === password && res.data.root){
              const user = {
                id: res.data.id,
                name: res.data.name,
                role: "root",
                workers: res.data.workers,
              };
              login(user);
              router.push("/dashboard");
            } else {
              setError("Invalid credentials");
            }
          })
          .catch((err) => {
            console.log(err);
            setError("Invalid credentials");
          });
      } else {
        axios
          .get("http://localhost:8080/workers/" + ID)
          .then((res) => {
            console.log(res.data);
            if (res.status === 200 && res.data.password === password) {
              if (res.data.isVerified) {
                const user = {
                  id: res.data.id,
                  name: res.data.name,
                  role: userType as "admin" | "worker",
                  shifts: res.data.shifts,
                  phoneNumber: res.data.phoneNumber,
                  supervisorId: res.data.supervisorId,
                  bio: res.data.bio,
                  annualLeaves: res.data.annualLeaves,
                  medicalLeaves: res.data.medicalLeaves,
                  status: res.data.status,
                };
                login(user);
                router.push("/dashboard");
              } else {
                setError("Please verify your account!");
              }
            } else {
              setError("Invalid credentials");
            }
          })
          .catch((err) => {
            console.log(err);
            setError("Invalid credentials");
          });
      }
  };
}
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Login
          </CardTitle>
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
              <Select
                onValueChange={(value: string) => setUserType(value)}
                required
              >
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
              <label
                htmlFor="id"
                className="block text-sm font-medium text-gray-700"
              >
                ID
              </label>
              <Input
                type="id"
                id="id"
                value={ID}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setID(e.target.value)
                }
                placeholder="Enter your ID"
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
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
                New Worker? Click here to Register!
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
