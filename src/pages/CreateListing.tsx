// src/pages/CreateListing.tsx - MVP Create Listing (Placeholder)

import React from 'react';
import { useNavigate } from 'react-router-dom';

const CreateListing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-green-600 hover:text-green-700"
        >
          ← Back to Home
        </button>
        
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Create Listing</h1>
          <p className="text-gray-600">This feature will be implemented in Task 7</p>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;
