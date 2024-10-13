import React, { useState } from 'react'
import { Filter, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TaskCard } from '@/components/TaskCard'
import { TaskDetailModal } from '@/components/TaskDetailModal'
import { ShiftData, WorkerTravelData } from '@/types/task'
import AddTaskForm from '@/components/AddTaskForm'

export const fakeShiftData: ShiftData[] = [
    {
      id: 101,
      worker: 1,
      status: "upcoming",
      property: {
        propertyId: 1001,
        clientId: 201,
        address: "789 Sample Blvd, Singapore",
        postalCode: "112233",
      },
      date: new Date("2024-10-13"),
      startTime: {
        hour: 9,
        minute: 0,
        second: 0,
        nano: 0,
      },
      endTime: {
        hour: 17,
        minute: 0,
        second: 0,
        nano: 0,
      },
    },
    {
      id: 102,
      worker: 2,
      status: "upcoming",
      property: {
        propertyId: 1002,
        clientId: 202,
        address: "456 Example St, Singapore",
        postalCode: "445566",
      },
      date: new Date("2024-10-14"),
      startTime: {
        hour: 10,
        minute: 30,
        second: 0,
        nano: 0,
      },
      endTime: {
        hour: 18,
        minute: 30,
        second: 0,
        nano: 0,
      },
    },
    {
      id: 103,
      worker: 3,
      status: "upcoming",
      property: {
        propertyId: 1003,
        clientId: 203,
        address: "123 Random Rd, Singapore",
        postalCode: "334455",
      },
      date: new Date("2024-10-15"),
      startTime: {
        hour: 8,
        minute: 0,
        second: 0,
        nano: 0,
      },
      endTime: {
        hour: 16,
        minute: 0,
        second: 0,
        nano: 0,
      },
    },
    {
      id: 104,
      worker: 4,
      status: "upcoming",
      property: {
        propertyId: 1004,
        clientId: 204,
        address: "321 Main St, Singapore",
        postalCode: "223344",
      },
      date: new Date("2024-10-16"),
      startTime: {
        hour: 7,
        minute: 30,
        second: 0,
        nano: 0,
      },
      endTime: {
        hour: 15,
        minute: 30,
        second: 0,
        nano: 0,
      },
    },
    {
      id: 105,
      worker: 5,
      status: "upcoming",
      property: {
        propertyId: 1005,
        clientId: 205,
        address: "789 Industrial Way, Singapore",
        postalCode: "556677",
      },
      date: new Date("2024-10-17"),
      startTime: {
        hour: 11,
        minute: 0,
        second: 0,
        nano: 0,
      },
      endTime: {
        hour: 19,
        minute: 0,
        second: 0,
        nano: 0,
      },
    },
  ];
  

  
  const ManageTasks: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
    const [selectedTask, setSelectedTask] = useState<ShiftData | null>(null)
    const [shiftData, setShiftData] = useState<ShiftData[]>(fakeShiftData)
    const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false)
  
    
    const filteredTasks = shiftData.filter((task) =>
      task.property.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
  
    const sortedTasks = filteredTasks.sort((a, b) => {
      if (sortOrder === "asc") {
        return new Date(a.date).getTime() - new Date(b.date).getTime() 
      } else {
        return new Date(b.date).getTime() - new Date(a.date).getTime() 
      }
    })
  
    const handleCardClick = (task: ShiftData) => {
      setSelectedTask(task)
      setIsTaskDetailModalOpen(true)
    }
  
    const handleCloseTaskDetailModal = () => {
      setIsTaskDetailModalOpen(false)
      setSelectedTask(null)
    }
  
    const handleSortToggle = () => {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    }
  
    const upcomingTasks = sortedTasks.filter((task) => task.status === 'upcoming')
  
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center space-x-4 justify-between">
          <Input
            type="text"
            placeholder="Search by worker name or property address..."
            className="w-8/12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
  
          <Button
            variant="outline"
            className="flex items-center"
            onClick={handleSortToggle}
          >
            <Filter className="mr-2 h-5 w-5" />
            {sortOrder === "asc" ? "Sort by Date (Oldest First)" : "Sort by Date (Newest First)"}
          </Button>
  
          <AddTaskForm/>        
          
          </div>
  
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingTasks.map((task) => (
            <TaskCard
              key={task.id}
              shiftData={task}
              onCardClick={() => handleCardClick(task)}
            />
          ))}
        </div>
  
        {upcomingTasks.length === 0 && (
          <p className="text-gray-500 mt-6">No tasks match the search term.</p>
        )}
  
        {selectedTask && (
          <TaskDetailModal
            shiftData={selectedTask}
            isOpen={isTaskDetailModalOpen}
            onClose={handleCloseTaskDetailModal}
          />
        )}
      </div>
    )
  }
  
  export default ManageTasks