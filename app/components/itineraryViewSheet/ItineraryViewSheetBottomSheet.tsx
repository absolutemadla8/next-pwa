'use client';

import React from 'react';
import { motion } from 'framer-motion'
import SeeMoreText from '../ui/SeeMoreText';
import { Bed, Check, CheckCircle2, Circle, CircleDashed, Shuffle, User2 } from 'lucide-react';
import HorizontalScroll from '../ui/HorizontalScroll';
import StarRating from '../ui/StarRating';
import { LogoGoogle } from '../chat/icons';
import { ActivityCard, FlightCard, HotelCard, PlaceCard } from '../cards';


interface ItineraryViewSheetBottomSheetProps {
  trip?: any
}

const ItineraryViewSheetBottomSheet: React.FC<ItineraryViewSheetBottomSheetProps> = ({
  trip
}) => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  }

  const [mainImage, secondaryImage1, secondaryImage2] = [
    ...(trip?.images.map((i:any) => i.url ?? '') || []),
    'https://often-public-assets.blr1.cdn.digitaloceanspaces.com/01JH7JPYCS5V69DY0DDJWX10WD.jpg',
    'https://often-public-assets.blr1.cdn.digitaloceanspaces.com/01JHFJNG3CKHE1M1WG2ME55PX6.jpg',
    'https://often-public-assets.blr1.cdn.digitaloceanspaces.com/01JJE8FM6V4C23KM8SR080SJN1.jpeg'
  ]
  return (
    <div className="flex flex-col items-start justify-start bg-white py-6">
      <div className='flex flex-row items-center justify-start gap-x-2 w-full mb-4 px-6'>
        <div className='flex flex-row items-center justify-start gap-x-1 border border-gray-800 p-2 rounded-full'>
          <User2 size={20} className='text-gray-800'/>
          <p
          style={{ fontFamily: 'var(--font-nohemi)' }}
          className='text-sm font-medium text-gray-800'>
                2 Adults, 2 Children
            </p>
        </div>
        <div className='flex flex-row items-center justify-start gap-x-1 border border-gray-800 p-2 rounded-full'>
          <Bed size={20} className='text-gray-800'/>
          <p
          style={{ fontFamily: 'var(--font-nohemi)' }}
          className='text-sm font-medium text-gray-800'>
                2 Rooms
            </p>
        </div>
      </div>
      <motion.div 
        className='flex flex-row items-center justify-start gap-x-2 w-full px-6'
        variants={fadeIn}
      >
        <div className='w-1/2 h-[250px] overflow-hidden rounded-lg'>
          <motion.img 
            className='rounded-lg w-full h-[280px] md:h-[456px] object-cover hover:scale-105 transition-transform duration-700'
            src={mainImage} 
            alt={trip?.name}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.7 }}
          />
        </div>
        <div className='flex flex-col items-start justify-start gap-y-2 w-1/2'>
          <motion.img
            className='rounded-lg object-cover w-full h-[121px] md:h-56 hover:scale-105 transition-transform duration-700'
            src={secondaryImage1} 
            alt={`${trip?.name} view 2`}
            variants={fadeIn}
          />
          <motion.img
            className='rounded-lg object-cover w-full h-[121px] md:h-56 hover:scale-105 transition-transform duration-700'
            src={secondaryImage2} 
            alt={`${trip?.name} view 3`}
            variants={fadeIn}
          />
        </div>
      </motion.div>
      
      {/* Add your content here */}
      <div className="py-4 px-6">
        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-primary text-lg">
        6-Day Vietnam Adventure: Hanoi to Hoi An with Da Nang
        </h1>
        <SeeMoreText
        maxLength={180}
        text=" I've successfully fixed the alignment issue with the vertical lines connecting the steps in the StepperComponent and updated the color scheme to be monochromatic using shades of gray instead of green."
        />
      </div>
      <div className='flex flex-col items-start justify-start gap-y-2 px-6'>
      <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-blue-600 text-md">
        Inclusions
        </h1>
      <motion.div 
          className='flex flex-row gap-x-2 items-start justify-start flex-wrap'
          variants={fadeIn}
        >
          <div className='flex flex-row items-center justify-start gap-x-1'>
              <CheckCircle2 size={22} className='fill-green-900/70 text-white' />
              <p className='text-sm font-medium text-gray-800'>
                Airport Transfers
              </p>
            </div>
        </motion.div>
        </div>
        <div className='flex flex-col items-start justify-start gap-y-4 w-full mt-6'>
          <HorizontalScroll className='gap-x-1 px-6'>
          <motion.button
                        style={{ fontFamily: 'var(--font-nohemi)' }}
                        className='px-4 py-2 rounded-full mr-2 text-sm bg-neutral-100 text-neutral-700 w-24'
                        // onClick={() => setSelectedDay(dayNumber)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Day 1
                      </motion.button>
                      <motion.button
                        style={{ fontFamily: 'var(--font-nohemi)' }}
                        className='px-4 py-2 rounded-full mr-2 text-sm bg-neutral-100 text-neutral-700 w-24'
                        // onClick={() => setSelectedDay(dayNumber)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Day 1
                      </motion.button>
                      <motion.button
                        style={{ fontFamily: 'var(--font-nohemi)' }}
                        className='px-4 py-2 rounded-full mr-2 text-sm bg-neutral-100 text-neutral-700 w-24'
                        // onClick={() => setSelectedDay(dayNumber)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Day 1
                      </motion.button>
                      <motion.button
                        style={{ fontFamily: 'var(--font-nohemi)' }}
                        className='px-4 py-2 rounded-full mr-2 text-sm bg-neutral-100 text-neutral-700 w-24'
                        // onClick={() => setSelectedDay(dayNumber)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Day 1
                      </motion.button>
          </HorizontalScroll>
          <div className='flex flex-col items-start justify-start py-4 w-full'>
          <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-md font-medium text-primary px-6'>
            Day 1: Hanoi to Da Nang
          </h1>
          <HorizontalScroll className='gap-x-2 mt-3 px-6'>
      <HotelCard
        imageUrl='https://often-public-assets.blr1.cdn.digitaloceanspaces.com/01JHFJNG3CKHE1M1WG2ME55PX6.jpg'
        name='Taj Bangalore hotel and palace'
        rating={4.5}
        description="I've successfully fixed the alignment issue with the vertical lines connecting the steps in the StepperComponent and updated the color scheme to be monochromatic using shades of gray instead of green."
        hideOptions={true}
      />
      
      <FlightCard
        airlineLogo="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/AI_Logo_Red_New.svg"
        flightNumber="ATQ2345"
        departureAirport="DEL"
        departureCity="Delhi"
        departureTime="12:00 AM"
        arrivalAirport="HAN"
        arrivalCity="Hanoi"
        arrivalTime="03:30 PM"
        isDirect={true}
        isConnecting={true}
      />
      
      <ActivityCard
        imageUrl='https://often-public-assets.blr1.cdn.digitaloceanspaces.com/01JHFJNG3CKHE1M1WG2ME55PX6.jpg'
        title='ATV Tandem (Double Sharing) Ride in Ubud. Muddy water with full gear and comfortable seats.'
        duration='2.5 Hours'
        description="I've successfully fixed the alignment issue with the vertical lines connecting the steps in the StepperComponent and updated the color scheme to be monochromatic using shades of gray instead of green."
      />
      
      <PlaceCard
        imageUrl='https://often-public-assets.blr1.cdn.digitaloceanspaces.com/01JHFJNG3CKHE1M1WG2ME55PX6.jpg'
        name='Donna Bali'
        rating='4.5 Stars'
        description="I've successfully fixed the alignment issue with the vertical lines connecting the steps in the StepperComponent and updated the color scheme to be monochromatic using shades of gray instead of green."
        isSelfTransfer={true}
      />
      </HorizontalScroll>
          <div className='flex w-full bg-neutral-100'>
          <HorizontalScroll className='gap-x-2 my-3 px-6'>
          <div className='flex flex-col items-start justify-start gap-y-2 w-64'>
              <img src='https://often-public-assets.blr1.cdn.digitaloceanspaces.com/01JHFJNG3CKHE1M1WG2ME55PX6.jpg' className='w-full h-40 rounded-lg object-cover' />
              <div className='flex flex-row items-center justify-between w-full'>
              <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-md font-medium text-gray-800 w-[60%]'>
                Taj Bangalore hotel and palace
              </h1>
              <StarRating size={4} rating={4.5} />
              </div>
              <SeeMoreText
                maxLength={60}
                text="I've successfully fixed the alignment issue with the vertical lines connecting the steps in the StepperComponent and updated the color scheme to be monochromatic using shades of gray instead of green."
              />
              <button className='flex flex-row items-center justify-start gap-x-2 py-2 px-3 rounded-lg bg-orange-500'>
                <Shuffle size={14} className='text-white' />
              <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-sm font-medium text-white'>
                Swap
              </h1>
              </button>
            </div>
          </HorizontalScroll>
          </div>
          </div>
        </div>
    </div>
  );
};

export default ItineraryViewSheetBottomSheet;
