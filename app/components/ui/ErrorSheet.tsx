'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import useBottomSheetStore from '@/app/store/bottomSheetStore';

const ErrorSheet = () => {
  const { errorData, closeSheet } = useBottomSheetStore();

  if (!errorData) return null;

  return (
    <div className="flex flex-col items-center px-6 py-4 w-full">
      <div className="flex flex-col items-center justify-center w-full mb-6">
        <div className="bg-red-100 rounded-full p-4 mb-4">
          <AlertCircle className="text-red-600 w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-red-600 text-center">{errorData.message}</h3>
      </div>

      {errorData.details && (
        <div className="w-full mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Details</h4>
          <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md">{errorData.details}</p>
        </div>
      )}

      {errorData.code && (
        <div className="w-full mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Error Code</h4>
          <p className="text-sm text-gray-600">{errorData.code}</p>
        </div>
      )}

      <button 
        onClick={closeSheet}
        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Dismiss
      </button>
    </div>
  );
};

export default ErrorSheet;