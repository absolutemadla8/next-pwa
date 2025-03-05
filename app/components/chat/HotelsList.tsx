import React, { useState, useEffect } from 'react'
import HorizontalScroll from '../ui/HorizontalScroll'
import StarRating from '../ui/StarRating'
import { MapPin } from 'lucide-react'
import TagList from '../ui/TagList'
import { useChat } from 'ai/react'
import StepLoader from './StepLoader'

export function HotelsList({ results, chatId }: { results?: any, chatId: string }) {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { append, error, reload } = useChat({
        id: chatId,
        body: { id: chatId },
        maxSteps: 5,
    });

    // Define steps for the loading animation
    const hotelSearchSteps = [
        {
            title: '@Stan (Accommodation specialist) Please recommend hotels',
            description: `
            •⁠ Fetch hotel recommendations for selected areas from online blogs, creators and recommendations by destination experts
            •⁠ Fetch online rates from wholesale supply
            •⁠ Fetch online rates from API supply
            •⁠ Fetch offline deals
            •⁠ Fetch packages and offers
            `,
            percentage: 40
        },
        {
            title: '@Aria (Destination Expert) What activities do you recommend?',
            description: '•⁠ Fetch online rates from wholesale supply',
            percentage: 30
        },
        {
            title: '@Eva (Events Specialist) Any cool events or experiences?',
            description: '•⁠ Searcing for events and experiences online',
            percentage: 30
        },
    ];

    // If we have results, stop loading after a delay for smoother UX
    useEffect(() => {
        if (results && results.length > 0) {
            // Small delay to ensure smooth transition
            const timeout = setTimeout(() => {
                setIsLoading(false);
            }, 500);
            
            return () => clearTimeout(timeout);
        }
    }, [results]);

    if (error) {
        return (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-red-600 mb-2">An error occurred while fetching hotels.</div>
                <button 
                    type="button" 
                    onClick={() => reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <StepLoader
                steps={hotelSearchSteps}
                totalTimeMs={6000}
                onComplete={() => setIsLoading(false)}
            />
        );
    }

    if (!results || results.length === 0) {
        return (
            <div className="p-4 bg-slate-50 rounded-lg text-slate-600">
                No hotels found for this location.
            </div>
        );
    }

    return (
        <HorizontalScroll>
            {results.map((result:any, index:number) => (
                <div
                    key={index}
                    onClick={() => {
                        append({
                            role: "user",
                            content: `Give me the room rates for ${result.name}!`,
                        });
                    }}
                    className='flex flex-col items-start justify-start w-64 bg-white rounded-lg overflow-hidden'>
                    <img src={result?.hero_image?.url || "https://often-public-assets.blr1.cdn.digitaloceanspaces.com/altimagehotels.png"} alt={result.name} className='w-full h-36 object-cover' />
                    <div className='flex flex-col items-start justify-start w-full p-2'>
                        <div className='flex flex-row items-center justify-between w-full'>
                            <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-lg text-blue-950 w-[68%] truncate'>
                                {result.name}
                            </h1>
                            {result.star_rating && 
                                <StarRating rating={+result.star_rating} size={3} />
                            }
                        </div>
                        <span className='text-xs text-slate-600 font-normal tracking-tight truncate w-full '>
                            {result.location}
                        </span>
                    </div>
                </div>
            ))}
        </HorizontalScroll>
    )
}