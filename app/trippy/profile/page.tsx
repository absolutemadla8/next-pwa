"use client"

import { useAuth, useAuthStore } from '@/app/store/authStore';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import React from 'react';

const Index = () => {
  const { user, logout } = useAuthStore();

  const sections = [
    {
      title: 'Legal',
      subtitle: 'Terms of Service & Privacy Policy',
    },
    {
      title: 'Delete Account',
      subtitle: 'Permanently delete your account and data',
    },
    {
      title: 'Logout',
      subtitle: 'Sign out from your account',
      onPress: logout,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full max-h-screen overflow-scroll bg-gray-50">
      <div className="flex flex-col">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-700 to-blue-600">
          <div className="p-4 flex flex-row items-center">
            <button 
              onClick={() => window.history.back()} 
              className="focus:outline-none"
            >
              <IconArrowLeft size={24} color="#FFF" />
            </button>
            <span className="text-white text-base font-medium ml-4">
              Profile Section
            </span>
          </div>
          
          <div className="p-4">
            <div className="flex flex-col space-y-1">
              <span className="text-white text-xl font-medium">
                {user?.name}
              </span>
              <div className="flex flex-row items-start gap-2">
                <span className="text-white/60 text-xs font-medium mt-1">
                  {user?.phone_number}
                </span>
                <span className="text-white/60 text-xs font-medium mt-1">
                  {user?.email}
                </span>
              </div>
              <button 
                onClick={() => window.location.href = '/profile/edit'} 
                className="flex flex-row items-center gap-2 w-fit"
              >
                <span className="text-white text-sm font-semibold">Edit Profile</span>
                <IconArrowRight size={16} color="#FFF" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Sections */}
        <div className="mt-4 bg-white flex flex-col w-full">
          {sections.map((section, index) => (
            <div key={index}>
              <button
                onClick={section.onPress}
                className="w-full flex flex-row items-center justify-between p-4"
              >
                <div className="flex flex-row gap-4">
                  <div className='flex flex-col items-start justify-start w-full'>
                    <span className={`text-sm font-semibold ${section.title === "Logout" ? "text-red-500" : "text-gray-800"}`}>
                      {section.title}
                    </span>
                    {section.subtitle && (
                      <p className="text-gray-500 text-xs mt-1">
                        {section.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                {
                    //@ts-ignore mlmr
                section.actionText && (
                  <span className="text-blue-600 text-xs font-semibold">
                    {
                    //@ts-ignore mlmr
                    section.actionText}
                  </span>
                )}
              </button>
              {index < sections.length - 1 && (
                <div className="h-px bg-gray-200 mx-4" />
              )}
            </div>
          ))}
        </div>
        
        {/* <MyTrips /> */}
      </div>
    </div>
  );
};

export default Index;