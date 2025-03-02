import SmallLogoWhite from '@/app/components/svg/SmallLogoWhite';
import React from 'react'

export default function ChatLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
  return (
    <main className="flex flex-col bg-gradient-to-b from-blue-100 to-rose-100 min-h-[100vh] max-h-[100vh] overflow-hidden w-full">
      <div className='absolute top-0 w-full flex flex-col items-center justify-center p-4'>
        <div className='z-10'>
        <SmallLogoWhite />
        </div>
        <div className='absolute top-0 w-full bg-gradient-to-b from-blue-500 to-transparent h-24' />
      </div>
        {children}
    </main>
  )
}