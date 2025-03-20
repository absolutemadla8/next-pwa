import { useChat } from 'ai/react';
import React from 'react'
import AnimatedButton from '../ui/AnimatedButton';
import { ListCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SessionCheckout({ results, chatId }: { results?: any, chatId: string }) {
    const router = useRouter();
    const { append, reload, error } = useChat({
        id: chatId,
        body: { id: chatId },
        maxSteps: 10,
      });
  return (
        <div className='flex flex-col items-start justify-start w-full bg-white p-4 rounded-xl gap-y-2'>
                {error && (
        <div className="p-4">
          <div className="text-red-500">An error occurred.</div>
          <button 
            type="button" 
            onClick={() => reload()}
            className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm"
          >
            Retry
          </button>
        </div>
      )}
      {!error && 
                    <div className='flex flex-row items-start justify-start gap-x-2'>
                        <div className='flex items-center justify-center p-2 rounded-md bg-teal-600'>
                            <ListCheck className='text-white size-4' />
                        </div>
                        <div className='flex flex-col mb-2'>
                        <span className='flex flex-row items-center justify-start gap-x-1 text-blue-950 text-sm font-normal tracking-tight'>
                            To Pay
                            <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-blue-950 text-sm'>
                            Rs. {results?.finalRate? (+results.finalRate).toFixed() : 0}
                        </span>
                        </span>
                        <span className='flex flex-row items-center justify-start gap-x-1 text-teal-600 text-xs font-semibold tracking-tight'>
                            We&apos;re happy to help you find the best deals
                        </span>
                        </div>
                    </div>
}
                <AnimatedButton
                    variant="secondary"
                    className="w-full"
                    onClick={() => router.push(`/trippy/stays/itinerary/session/${results.session_id}`)}
                >
                    Book Now
                </AnimatedButton>
                </div>
  )
}