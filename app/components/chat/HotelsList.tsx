import React from 'react'
import HorizontalScroll from '../ui/HorizontalScroll'
import StarRating from '../ui/StarRating'
import { MapPin } from 'lucide-react'
import TagList from '../ui/TagList'
import { useChat } from 'ai/react'

export function HotelsList({ results, chatId }: { results?: any, chatId: string }) {
    const { append } = useChat({
        id: chatId,
        body: { id: chatId },
        maxSteps: 5,
      });
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
        className='flex flex-col items-start justify-start w-60 bg-white rounded-lg overflow-hidden'>
            <img src={result.hero_image} alt={result.name} className='w-full h-24 object-cover' />
            <div className='flex flex-col items-start justify-start w-full p-2'>
            <div className='flex flex-row items-center justify-between w-full'>
            <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-md text-blue-950 w-[68%] truncate'>
                {result.name}
            </h1>
            <StarRating rating={+result.star_rating} size={3} />
            </div>
            <span className='text-xs text-slate-600 font-normal tracking-tight truncate'>
                {result.location}
            </span>
            <TagList tags={result.facilities} />
            <div className='flex flex-col items-start justify-start pt-2'>
            <span className='text-xs text-slate-600 font-normal tracking-tight truncate'>
                   Starting from
                </span>
                <div className='flex flex-row items-center justify-start gap-x-2'>
                <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-lg text-blue-950'>
                Rs.{result.rates.final_rate.toLocaleString()}
            </h1>
            <span className='text-xs text-slate-600 font-normal tracking-tight truncate'>
                   total
                </span>
            </div>
            <span className='text-xs text-teal-600 font-normal tracking-tight truncate'>
                   Inclusive of taxes and fee
                </span>
            </div>
            </div>
        </div>
                ))}
    </HorizontalScroll>
  )
}