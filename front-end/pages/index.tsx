import React, { useState, useRef } from "react";
import { Calendar, Users, CheckSquare, Settings, Play, Pause } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export default function LandingPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
     <audio ref={audioRef} src="/sound.mp3" loop />
      <div className="max-h-screen p-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            Welcome to the Future of Worker Management
          </h1>
          <p className="text-gray-600 mt-2">
            Efficient scheduling for your workplace
          </p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Easy Scheduling
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Manage Worker's Schedule with ease
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Worker Management
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Organize your workers and tasks</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Efficient Planning
              </CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Plan tasks with ease</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Customization
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Tailor to your needs</div>
            </CardContent>
          </Card>
        </main>

        <div className="mt-12 text-center">
          <a href="/login">
            <Button size="lg">Get Started</Button>
          </a>

          <div className="div">
        <Button onClick={toggleAudio} className="mt-4">
            {isPlaying ? <Pause className="mr-2" /> : <Play className="mr-2" />}
            {isPlaying ? "Okay Enough" : "Click Me"}
          </Button>
        </div>
          
        </div>
        

        <footer className="mt-12 text-center text-gray-600">
          © 2024 Worker Bee. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
