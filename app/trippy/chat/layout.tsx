import SmallLogoWhite from '@/app/components/svg/SmallLogoWhite';
import React from 'react'

export default function ChatLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
  return (
    <main className="flex flex-col bg-gradient-to-t from-blue-200 via-blue-100 to-white h-full w-full md:max-w-md">
        {children}
    </main>
  )
}