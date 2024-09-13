import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">401 Unauthorized</h1>
        <p className="text-gray-700 mb-6">You do not have permission to view this page.</p>
        <button
          onClick={handleGoHome}
          className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;