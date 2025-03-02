import React from 'react'
import AnimatedButton from '../ui/AnimatedButton';
import useBottomOrderStore from '@/app/store/bottomOrderStore';
import { IconArrowRight, IconArrowsRight } from '@tabler/icons-react';

const BottomOrderInfo = () => {
  const { infoTitle, infoSubtitle, buttonText, handleCreateItinerary } = useBottomOrderStore();

  return (
    <div className='flex flex-col items-center justify-center rounded-lg overflow-hidden bg-gray-800 w-full max-w-screen-xl mx-auto'>
    <div className='flex flex-row items-center justify-between w-full px-3 py-2'>
      <div className='flex flex-col items-start justify-start w-[60%] pl-4'>
      <h2 className='text-md' style={{ fontFamily: 'var(--font-nohemi)' }}>
        {infoSubtitle}
      </h2>
      <span className='text-white text-xs font-normal tracking-tight'>
    {infoTitle}
            </span>
      </div>
            <AnimatedButton
            onClick={handleCreateItinerary} 
            size='sm' 
            icon={<IconArrowRight size={20} stroke={1.5} />}
            className='flex flex-row items-center justify-start font-normal text-white bg-gray-800 w-[40%] p-0'
            >
                {buttonText}
            </AnimatedButton>
    </div>
</div>
  )
}

export default BottomOrderInfo