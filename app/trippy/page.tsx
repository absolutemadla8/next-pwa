'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SmallLogoWhite from '@/app/components/svg/SmallLogoWhite';
import VoiceComponent from "@/app/components/VoiceComponent";
import { Mic, MicOff } from 'lucide-react';
import BottomSheet from '../components/ui/BottomSheet';
import HorizontalScroll from '../components/ui/HorizontalScroll';
import useVoiceChatStore from '../store/voiceChatStore';
import DealsScroll from '../components/DealsScroll';

interface FormData {
  country: string;
  type: 'hotel';
  checkIn: string;
  checkOut: string;
  travelMonth: string;
  additionalRequests: string;
}

const TrippyPage = () => {
  const [mounted, setMounted] = useState(false);
  const { sessionPin } = useVoiceChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    country: '',
    type: 'hotel',
    checkIn: '',
    checkOut: '',
    travelMonth: '',
    additionalRequests: ''
  });

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Don't render until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  const SessionPin = () => {
    if (!sessionPin) {
      return <p className='text-blue-800 text-md'>No active session</p>;
    }

    return (
      <div className="flex justify-center space-x-1">
        {sessionPin.split("").map((digit, index) => (
          <div 
            key={index} 
            className="w-5 h-6 flex items-center justify-center bg-blue-100 border border-blue-600 rounded-md text-blue-800 text-md capitalize"
            aria-label={`Pin digit ${index + 1}`}
          >
            {digit}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className='flex flex-col w-full h-screen items-center justify-center overscroll-contain relative'>
      <div className="flex flex-col items-center justify-start h-screen w-full bg-gradient-to-b from-[#0C66E4] to-[#5751FF] p-4">
        <img 
          src="https://aktt5yjwyc.ufs.sh/f/VfNn67L471NriyZEUVGTOah6yUfotzbSjNJ5LBrsDwqx1g7e" 
          className='absolute h-full w-full object-cover'
          alt="Background"
        />
        
        <div className="relative z-10 w-full">
          <SmallLogoWhite />
        </div>

        <div className='flex flex-col items-center justify-center gap-y-6 py-14 z-10'>
          <div>
            <VoiceComponent />
          </div>
        </div>

        <div className='absolute bottom-0 left-0 right-0'>
          <div className='flex flex-col items-center justify-center p-6 bg-white w-full rounded-t-xl shadow-lg'>
            <button 
              onClick={() => setIsOpen(true)} 
              className="flex flex-row items-center justify-between w-full hover:bg-gray-50 p-2 rounded-lg transition-colors"
              aria-label="Open action sheet"
            >
              <h2 
                style={{ fontFamily: 'var(--font-nohemi)' }} 
                className="text-lg text-blue-950"
              >
                Trippy ActionSheet
              </h2>
              
              <SessionPin />
            </button>
          </div>
        </div>

        <BottomSheet 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)}
        >
          <DealsScroll onPopulate={() => setIsOpen(true)} />
        </BottomSheet>
      </div>
    </div>
  );
};

// Export a client-only version of the component
export default dynamic(() => Promise.resolve(TrippyPage), {
  ssr: false
});