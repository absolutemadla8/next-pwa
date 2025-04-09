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
    <div className='flex flex-col items-start justify-start bg-gradient-to-t h-full from-white to-blue-100'>
        <div className='flex flex-col items-start justify-start p-4 gap-y-2 w-full'>
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
        </div>
  )
}

export default Page