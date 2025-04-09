'use client'
import SmallLogoWhite from '@/app/components/svg/SmallLogoWhite'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import HorizontalScroll from '@/app/components/ui/HorizontalScroll'
import DealsListSection from '@/app/components/deals/DealsListSection'

const Page = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const searchTerms = ["destination", "property", "vibe"]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % searchTerms.length)
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])

  const topDestinations = [
    {
      "id": "1",
      "name":"Maldives",
      "heroImage":"https://often-public-assets.blr1.cdn.digitaloceanspaces.com/maldives.webp"
    },
    {
      "id": "2",
      "name":"Singapore",
      "heroImage":"https://often-public-assets.blr1.cdn.digitaloceanspaces.com/Singapore.webp"
    },
    {
      "id": "3",
      "name":"Thailand",
      "heroImage":"https://often-public-assets.blr1.cdn.digitaloceanspaces.com/Thailand.webp"
    }
  ]
  
  return (
    <div className='flex flex-col items-start justify-start w-full h-full bg-[#F1F2F4]'>
        <div className='flex flex-col items-start justify-start p-4 gap-y-2 bg-blue-600 w-full'>
            <div className='flex flex-row items-center justify-center gap-x-2'>
              <SmallLogoWhite size={46} />
              <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-white font-normal text-md'>OftenTravel</h2>
            </div>
            <div className='flex flex-row items-center justify-start bg-white rounded-lg px-4 w-full h-14'>
              <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary font-normal text-md flex items-center'>
                Search a deal for&nbsp;
                <div className="inline-block h-7 w-24 overflow-hidden">
                  <motion.div
                    animate={{ y: -currentTextIndex * 28 }} // 28px is the approximate height of each text item
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-start mt-0.5"
                  >
                    {searchTerms.map((term, index) => (
                      <div key={index} className="h-7 text-blue-600">
                        {term}
                      </div>
                    ))}
                  </motion.div>
                </div>
              </h2>
            </div>
        </div>
        <div className='flex flex-col items-start justify-start w-full gap-y-4'>
            <div className='flex flex-col items-start justify-start w-full bg-white py-4'>
            <div className='flex flex-row items-start justify-between w-full px-4 pb-4'>
                <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary font-normal text-lg w-1/2 pr-4'>Explore top destinations</h2>
                <hr className='w-1/2 border-[0.5px] border-slate-500 mt-3' />
            </div>
            <HorizontalScroll>
              {topDestinations.map((dest:any, index:number)=>(
                <div key={index} className='flex flex-col items-center justify-center w-36 h-fit'>
                    <img src={dest.heroImage} className='w-full h-44 object-cover rounded-lg' />
                    <div className='flex flex-col items-center justify-center w-full pt-2'>
                        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary font-normal text-md'>{dest.name}</h2>
                    </div>
                </div>
                ))}
            </HorizontalScroll>
            </div>
            <div className='flex flex-col w-full'>
            <HorizontalScroll>
                <div className='flex flex-col items-center justify-center px-4 py-2 max-w-28 rounded-lg h-fit border border-slate-400'>
                    <div className='flex flex-col items-center justify-center w-full'>
                        <h2 className='text-primary font-normal text-sm tracking-tight truncate'>Country</h2>
                    </div>
                </div>
                <div className='flex flex-col items-center justify-center px-4 py-2 max-w-28 rounded-lg h-fit border border-slate-400'>
                    <div className='flex flex-col items-center justify-center w-full'>
                        <h2 className='text-primary font-normal text-sm tracking-tight truncate'>Occasion</h2>
                    </div>
                </div>
                <div className='flex flex-col items-center justify-center px-4 py-2 max-w-28 rounded-lg h-fit border border-slate-400'>
                    <div className='flex flex-col items-center justify-center w-full'>
                        <h2 className='text-primary font-normal text-sm tracking-tight truncate'>Visa Type</h2>
                    </div>
                </div>
                <div className='flex flex-col items-center justify-center px-4 py-2 max-w-28 rounded-lg h-fit border border-slate-400'>
                    <div className='flex flex-col items-center justify-center w-full'>
                        <h2 className='text-primary font-normal text-sm tracking-tight truncate'>Property Type</h2>
                    </div>
                </div>
            </HorizontalScroll>
            </div>
            <DealsListSection />
        </div>
    </div>
  )
}

export default Page