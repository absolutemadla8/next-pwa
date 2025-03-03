import React from 'react'
import HorizontalScroll from '../ui/HorizontalScroll'
import StarRating from '../ui/StarRating'
import { MapPin } from 'lucide-react'
import TagList from '../ui/TagList'
import { useChat } from 'ai/react'

export function HotelsList({ results, chatId }: { results?: any, chatId: string }) {
    const { append, error, reload } = useChat({
        id: chatId,
        body: { id: chatId },
        maxSteps: 5,
      });
      {error && (
        <>
          <div>An error occurred.</div>
          <button type="button" onClick={() => reload()}>
            Retry
          </button>
        </>
      )}
  return (
    <HorizontalScroll>
        {results?.map((result:any, index:number) => (
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