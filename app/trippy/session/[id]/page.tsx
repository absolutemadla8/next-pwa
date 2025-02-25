import { Star } from 'lucide-react'
import React from 'react'

const Page = () => {
  return (
    <div className='flex flex-col w-full h-screen items-center justify-center'>
        <div className="flex flex-col items-center justify-start h-screen w-full bg-[#F1F2F4]">
            <div className='relative flex flex-col items-start justify-start w-full h-64'>
            <img src="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/01JG6HDAY8SRG68FA33A696BDC.webp" className='h-64 w-full transition-all delay-150 duration-300 ease-in-out' />
            <div className='absolute -bottom-1 h-48 w-full bg-gradient-to-t from-[#F1F2F4] to-[#F1F2F400]' />
            </div>
            <div className='flex flex-col items-center justify-center w-full gap-y-3 px-6 -mt-10 z-10'>
                <div className='flex flex-col items-start justify-start w-full bg-white p-4 rounded-xl gap-y-2'>
                    <div className='flex flex-row items-center justify-between w-full'>
                        <div className='flex flex-col gap-y-1 w-[60%]'>
                        <div className='flex flex-row items-center justify-start gap-x-4 w-full'>
                        <div className='flex flex-row items-center justify-start w-fit'>
                            <Star className=' size-5 fill-gray-800' />
                            <Star className=' size-5 fill-gray-800' />
                            <Star className=' size-5 fill-gray-800' />
                            <Star className=' size-5 fill-gray-800' />
                            <Star className=' size-5 fill-gray-300' />
                            </div>
                        </div>
                        <div className='flex flex-col w-full'>
                        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-xl'>
                            Taj Palace, Udaipur
                        </h1>
                        <span className='text-blue-500 text-sm font-normal tracking-tight'>
                            Udaipur, Rajasthan
                        </span>
                        </div>
                        </div>
                        <div className='flex flex-col w-20 h-fit rounded-lg overflow-hidden'>
                            <div className='flex flex-row items-center justify-center gap-x-1 bg-teal-600 p-1'>
                            <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-white text-sm font-normal'>
                            4.9
                        </span>
                        <Star className='size-3 fill-white' />
                            </div>
                            <div className='flex flex-col items-center justify-center bg-slate-100 p-1'>
                            <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-sm font-normal'>
                            1490
                        </span>
                        <span className='text-blue-950 text-xs font-normal tracking-tighter'>
                            reviews
                        </span>
                            </div>
                        </div>
                    </div>
                    <hr className='w-full' />
                    <div className='flex flex-row items-start justify-between w-full'>
                        <div className='flex flex-col items-start justify-start'>
                        <span className='text-gray-800 text-sm font-normal'>
                            Check-in
                        </span>
                        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-lg' >
                            12 Mar 2025
                        </h2>
                        <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-gray-800 text-sm font-normal'>
                            From 2:00 PM
                        </span>
                        </div>
                        <div className='flex flex-col items-end justify-start'>
                        <span className='text-gray-800 text-sm font-normal'>
                            Check out
                        </span>
                        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-lg' >
                            14 Mar 2025
                        </h2>
                        <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-gray-800 text-sm font-normal'>
                            Until 11:00 AM
                        </span>
                        </div>
                    </div>
                    <hr className='w-full' />
                    <div className='flex flex-row items-start justify-between w-full'>
                        <div className='flex flex-col items-start justify-start'>
                        <span className='text-gray-800 text-sm font-normal'>
                            Guests & Rooms
                        </span>
                        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-lg' >
                            2 Adults, 1 Room
                        </h2>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col items-start justify-start w-full bg-white p-4 rounded-xl gap-y-2'>
                <div className='flex flex-col w-full'>
                <span className='text-blue-500 text-sm font-normal tracking-tight'>
                            Breakfast Included
                        </span>
                        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-lg'>
                           Deluxe Room with Balcony (City View)
                        </h1>
                        <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-teal-600 text-sm'>
                            Refundable until March 20, 2:30 PM
                        </span>
                        </div>
                </div>
                <div className='flex flex-col items-start justify-start w-full bg-white p-4 rounded-xl gap-y-2'>
                <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-lg'>
                           Cancellation Policy
                        </h1>
                </div>
                <div className='flex flex-col items-start justify-start w-full bg-white p-4 rounded-xl gap-y-2'>
                <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-lg'>
                           Price Breakdown
                        </h1>
                </div>
            </div>
        </div>
   </div>
  )
}

export default Page