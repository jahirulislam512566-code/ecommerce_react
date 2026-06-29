// pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Title } from '../components/Title';

export const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="text-center max-w-md mx-auto">
        <div className="text-6xl mb-4">🔍</div>
        <Title text1="404" text2="PAGE NOT FOUND" />
        <p className="text-gray-500 mt-4 text-sm">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block mt-6 px-6 py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;