import SmallLogoWhite from '@/app/components/svg/SmallLogoWhite';
import React from 'react'

export default function ChatLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
  return (
    <main className="flex flex-col bg-gradient-to-b from-blue-100 to-rose-100 h-full w-full md:max-w-md">
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