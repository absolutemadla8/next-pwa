"use client"
import HotelGallery from '@/app/components/stays/HotelGallery'
import { useHotelStore } from '@/app/store/hotelsSearchStore'
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
        <div className='relative flex flex-col w-full overflow-scroll items-start justify-start bg-[#F1F2F4]'>
            <HotelGallery images={allImages} />
        </div>
    )
}

export default Page