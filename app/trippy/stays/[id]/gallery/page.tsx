"use client"
import HotelGallery from '@/app/components/stays/HotelGallery'
import { useHotelStore } from '@/app/store/hotelsSearchStore'
import { IconArrowBack, IconArrowLeft } from '@tabler/icons-react'
import React from 'react'

const Page = () => {
    const {hotel} = useHotelStore();
    
    //@ts-ignore mlmr
    const getXxlImageUrl = (imageObj) => {
        // Check if imageObj and imageObj.links exist and are valid
        if (!imageObj || !imageObj.links || !Array.isArray(imageObj.links)) {
            console.error('Invalid image object structure:', imageObj);
            return ''; // Return empty string or a placeholder image URL
        }
          //@ts-ignore mlmr
        const xxlLink = imageObj.links.find(link => link.size === "Xxl");
        return xxlLink ? xxlLink.url : (imageObj.links[0]?.url || '');
    };
    
    // Safely map images to their Xxl URLs
    const hotelImages = hotel?.images 
        ? hotel.images
          //@ts-ignore mlmr
            .filter(img => img) // Filter out any null/undefined entries
            .map(getXxlImageUrl)
              //@ts-ignore mlmr
            .filter(url => url) // Filter out any empty strings
        : [];
    
    // Safely add hero image
    let allImages = [...hotelImages];
    if (hotel?.heroImage) {
        const heroUrl = getXxlImageUrl(hotel.heroImage);
        if (heroUrl) {
            allImages.unshift(heroUrl);
        }
    }
    
    // For debugging
    console.log('Hotel images structure:', hotel?.images);
    console.log('Processed image URLs:', allImages);
    
    return (
        <div className='relative flex flex-col w-full items-start justify-start bg-gradient-to-b from-gray-50 to-gray-100 h-full'>
            <div className="w-full sticky top-0 z-10 bg-white shadow-sm px-4 py-3 flex items-center">
                <button 
                    onClick={() => window.history.back()} 
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors mr-3"
                >
                    <IconArrowLeft className='text-blue-950' size={20} />
                </button>
                <h1 className="text-lg text-blue-950 truncate w-[80%]" style={{ fontFamily: 'var(--font-nohemi)' }}>
                    {hotel?.name || 'Hotel Gallery'}
                </h1>
            </div>
            
            <div className="w-full flex-1 pb-8">
                <HotelGallery images={allImages} />
            </div>
        </div>
    )
}

export default Page