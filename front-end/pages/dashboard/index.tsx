import Dashboard from '@/components/dashboard';

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
      <Dashboard
        jobsPerMonth={jobsPerMonth}
        clientProfile={clientProfile}
        newJobs={newJobs}
        newClients={newClients}
        cancelledAndRescheduled={cancelledAndRescheduled}
      />
    </div>
  );
};

export default IndexPage;