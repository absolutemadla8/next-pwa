"use client";

import SmallLogoWhite from '@/app/components/svg/SmallLogoWhite'
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/app/store/authStore';

const Page = () => {
  const {user, token} = useAuthStore();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputValue, role: "user", userId: user?.id, userToken: token}),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response from API:', data);
      
      // Check if threadId is available in the response
      if (data.threadId) {
        // Redirect to the thread page
        router.push(`/trippy/chat/v2/${data.threadId}`);
      } else {
        console.error('No threadId in response');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-start justify-start'>
        <div className='flex flex-row bg-white items-center justify-start w-full px-4 py-2'>
            <SmallLogoWhite size={46} color='#020A34' />
            <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary font-normal text-lg ml-2'>Often<span className='font-medium'>Travel</span></h1>
        </div>
        <div className='flex flex-col items-start justify-start px-4 py-6 gap-y-2'>
            <div className='flex flex-col items-start justify-start gap-y-2 w-full'>
                <img src="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/trippy.png" alt="trippy" className='size-8' />
            <p style={{ fontFamily: 'var(--font-domine)'}}  className='text-xl text-slate-900'>Hey Mukul, Where can I take you? <br></br> I&apos;m Trippy! Your AI travel genie, I make all your travel wishes come true.</p>
            </div>
        </div>
        <div className="w-full px-4">
        <div className="relative rounded-lg overflow-hidden ring-0 border-none">
          <textarea
            ref={textareaRef}
            className="resize-none p-3 sm:p-4 pb-12 sm:pb-12 block w-full bg-transparent rounded-lg sm:text-sm border-none ring-0 focus:border-0 text-primary placeholder:text-slate-600"
            placeholder="Tap to chat with Trippy"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={3}
            disabled={isLoading}
          ></textarea>

          {/* Toolbar */}
          <div className="absolute bottom-px inset-x-px p-2 bg-slate-100">
            <div className="flex flex-wrap justify-between items-center gap-2">
              {/* Left Button Group */}
              <div className="flex items-center">
                <button type="button" className="inline-flex shrink-0 justify-center items-center size-8 rounded-lg text-slate-700 hover:bg-white focus:z-10 focus:outline-hidden focus:bg-white dark:text-neutral-500 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
                  <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><line x1="9" x2="15" y1="15" y2="9"/></svg>
                </button>
                <button type="button" className="inline-flex shrink-0 justify-center items-center size-8 rounded-lg text-slate-700 hover:bg-white focus:z-10 focus:outline-hidden focus:bg-white dark:text-neutral-500 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
                  <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                </button>
              </div>

              {/* Right Button Group */}
              <div className="flex items-center gap-x-1">
                <button 
                  type="button" 
                  className={`inline-flex shrink-0 justify-center items-center size-8 rounded-lg ${
                    isLoading || !inputValue.trim() 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'text-white bg-blue-600 hover:bg-blue-500 focus:z-10 focus:outline-hidden focus:bg-blue-500'
                  }`}
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                >
                  {isLoading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          {/* End Toolbar */}
        </div>
      </div>
      <div className='flex flex-col items-start justify-start px-4 py-6 gap-y-2 w-full'>
      <div className='flex flex-row items-start justify-between w-full'>
          <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary font-normal text-lg w-1/2 pr-4'>Top deals for you</h2>
          <hr className='w-1/2 border-[0.5px] border-slate-500 mt-3' />
          </div>
      </div>
    </div>
  )
}

export default Page