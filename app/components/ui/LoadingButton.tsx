'use client';

import React from 'react';

interface LoadingButtonProps {
  loading: boolean;
  onClick?: () => void;
  text: string;
  loadingText?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

export default function LoadingButton({
  loading,
  onClick,
  text,
  loadingText = 'Loading...',
  className = '',
  type = 'button',
  icon
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`flex items-center justify-between px-4 py-3 w-full ${className}`}
    >
      <span className="text-left">{loading ? loadingText : text}</span>
      
      {loading ? (
        <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-blue-500 rounded-full"></div>
      ) : (
        icon && <span>{icon}</span>
      )}
    </button>
  );
}