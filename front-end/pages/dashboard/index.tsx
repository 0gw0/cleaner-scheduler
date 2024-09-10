import Dashboard from '@/components/dashboard';
import Calendar from '@/components/calendar';

const IndexPage: React.FC = () => {
  // Fetch the data from your data source
  const jobsPerMonth = [
    { month: 'Jan', jobs: 50 },
    { month: 'Feb', jobs: 60 },
    { month: 'Mar', jobs: 45 },
    // Add more data as needed
  ];

  const clientProfile = {
    totalClients: 1000,
    newClients: 50,
    terminatedClients: 20,
  };

  const newJobs = 25;
  const newClients = 15;
  const cancelledAndRescheduled = 10;

  const tasks = [
    {
      id: '1',
      worker: 'John Doe',
      location: 'Office A',
      supervisor: 'Jane Smith',
      startTime: new Date(2024, 8, 10, 8, 0), // September 10, 2024, 9:00 AM
      duration: 3,
    },
    {
      id: '4',
      worker: 'Supa Dupa',
      location: '570239',
      supervisor: 'Potato Monster',
      startTime: new Date(2024, 8, 10, 9, 0), // September 10, 2024, 9:00 AM
      duration: 3,
    },
    {
      id: '2',
      worker: 'Fraser',
      location: 'Kovan',
      supervisor: 'Milo Myo',
      startTime: new Date(2024, 8, 11, 12, 0), // September 10, 2024, 9:00 AM
      duration: 3,
    },
    {
      id: '3',
      worker: 'Lynn Doe',
      location: 'Bistro B',
      supervisor: 'Milo Myo',
      startTime: new Date(2024, 8, 12, 9, 0), // September 10, 2024, 9:00 AM
      duration: 3,
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
      <Dashboard
        jobsPerMonth={jobsPerMonth}
        clientProfile={clientProfile}
        newJobs={newJobs}
        newClients={newClients}
        cancelledAndRescheduled={cancelledAndRescheduled}
      />

    <div className="container mx-auto pt-5">
      <h1 className="text-2xl font-bold mb-4">Cleaning Tasks Calendar</h1>
      <Calendar tasks={tasks} />
    </div>
    </div>
  );  
};

export default IndexPage;