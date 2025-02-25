// app/trippy/BottomContent.tsx
'use client';

import { useState } from 'react';
import useVoiceChatStore from '@/app/store/voiceChatStore';
import BottomSheet from '../ui/BottomSheet';
import DealsScroll from '../DealsScroll';

export default function BottomContent() {
  const { sessionPin } = useVoiceChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    country: '',
    type: 'hotel',
    checkIn: '',
    checkOut: '',
    travelMonth: '',
    additionalRequests: ''
  });

  return (
    <>
      <div className='absolute bottom-0 flex flex-col w-full md:max-w-md'>
        <div className='flex flex-row items-start justify-start p-4 bg-white/30 backdrop-blur-sm m-4 border border-white rounded-xl'>

        </div>
        <div className='flex flex-col items-center justify-center p-6 bg-white w-full rounded-t-xl z-1'>
          <button onClick={() => setIsOpen(true)} className="flex flex-row items-center justify-between w-full">
            <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-lg text-blue-950">Trippy ActionSheet</h2>
            
            {sessionPin ? (
              <div className="flex justify-center space-x-1">
                {sessionPin.split("").map((digit, index) => (
                  <div 
                    key={index} 
                    className="w-5 h-6 flex items-center justify-center bg-blue-100 border border-blue-600 rounded-md text-blue-800 text-md capitalize"
                  >
                    {digit}
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-blue-800 text-md'>No active session</p>
            )}
          </button>
        </div>
      </div>
      <BottomSheet 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
      >
        <DealsScroll onPopulate={() => setIsOpen(true)} />
      </BottomSheet>
    </>
  );
}