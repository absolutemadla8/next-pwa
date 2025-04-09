'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/app/lib/axios'
import StarRating from '@/app/components/ui/StarRating'
import { CheckCircle2Icon } from 'lucide-react'

const Page = () => {
  const params = useParams()
  const [order, setOrder] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/orders/${params.id}`)
        if (response.data) {
          //@ts-ignore mlmr
          setOrder(response.data.data)
        }
      } catch (err) {
        setError('Failed to fetch order details')
        console.error('Error fetching order:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Order not found</div>
      </div>
    )
  }

  return (
    <div className='flex flex-col w-full min-h-screen items-center justify-start bg-[#F1F2F4]'>
      <div className="flex flex-col items-center justify-start h-full w-full bg-[#F1F2F4]">
      <div className='relative flex flex-col items-start justify-start w-full h-64'>
            <img src={order.hotel_details.images[0].url} className='h-64 w-full transition-all delay-150 duration-300 ease-in-out' />
            <div className='absolute -bottom-1 h-48 w-full bg-gradient-to-t from-[#F1F2F4] to-[#F1F2F400]' />
            </div>
            <div className='flex flex-col items-center justify-center w-full gap-y-3 px-6 -mt-10 z-10'>
            <div className='flex flex-col items-start justify-start w-full bg-white rounded-xl gap-y-2 overflow-hidden'>
              <div className='flex flex-row items-center justify-start gap-x-2 bg-teal-500 p-2 w-full'>
                <CheckCircle2Icon color='#14b8a6' size={20} fill='white'/>
                {order.status === "paid" && order.booking_details[0]?.status === "confirmed" ? 
              <span className='text-white text-md font-normal tracking-tight'>
                            Order confirmed
                        </span>
                        :
                        <span className='text-white text-md font-normal tracking-tight'>
                        Order pending
                    </span>}
              </div>
            <div className='flex flex-col items-start justify-start px-4 pb-2'>
                        <span className='text-slate-600 text-sm font-normal tracking-tight'>
                            Order ID
                        </span>
                        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary text-lg' >
                        {order.razorpay_order_id}
                        </h2>
                        <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-slate-600 text-sm font-normal'>
                            {order.payments[0].razorpay_payment_id}
                        </span>
                        </div>
            </div>
            <div className='flex flex-col items-start justify-start w-full bg-white rounded-xl gap-y-2 overflow-hidden'>
            <div className='flex flex-col items-start justify-start p-4'>
                        <span className='text-slate-600 text-sm font-normal tracking-tight'>
                           Hotel Confirmation Number
                        </span>
                        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary text-lg' >
                        {JSON.parse(order.booking_details[0].other_details).providerConfirmationNumber}
                        </h2>
                        <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-slate-600 text-sm font-normal'>
                        {order.booking_details[0].booking_id}
                        </span>
                        </div>
            </div>
            <div className='flex flex-col items-start justify-start w-full bg-white p-4 rounded-xl gap-y-2'>
                    <div className='flex flex-row items-center justify-between w-full'>
                    <div className='flex flex-col gap-y-1'>
                        <div className='flex flex-row items-center justify-start gap-x-4 w-full'>
                           <img src='https://aktt5yjwyc.ufs.sh/f/VfNn67L471Nr09H0PGyN69PzLBI5kGd34SqJQVxpOwXWubog' className='w-14 h-6 object-contain' /> 
                        </div>
                        <div className='flex flex-col w-full'>
                        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary text-lg truncate w-full'>
                            {order.hotel_details.name ? order.hotel_details.name : ""}
                        </h1>
                        <span className='text-slate-600 text-sm font-normal tracking-tight w-full'>
                        {order.hotel_details.location ? order.hotel_details.location : ""}
                        </span>
                        </div>
                        </div>
                    </div>
                    <hr className='w-full' />
                    <div className='flex flex-row items-start justify-between w-full'>
                        <div className='flex flex-col items-start justify-start'>
                        <span className='text-gray-800 text-sm font-normal'>
                            Check-in
                        </span>
                        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary text-lg' >
                        {order.hotel_details.checkin ? new Date(order.hotel_details.checkin).toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
}).replace(/ /g, ' ') : ""}
                        </h2>
                        <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-gray-800 text-sm font-normal'>
                            From 2:00 PM
                        </span>
                        </div>
                        <div className='flex flex-col items-end justify-start'>
                        <span className='text-gray-800 text-sm font-normal'>
                            Check out
                        </span>
                        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary text-lg' >
                        {order.hotel_details.checkout ? new Date(order.hotel_details.checkout).toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
}).replace(/ /g, ' ') : ""}
                        </h2>
                        <span style={{ fontFamily: 'var(--font-nohemi)' }} className='text-gray-800 text-sm font-normal'>
                            Until 11:00 AM
                        </span>
                        </div>
                    </div>
                    <hr className='w-full' />
                    <div className='flex flex-row items-start justify-between w-full'>
                        <div className='flex flex-col items-start justify-start'>
                        <span className='text-gray-800 text-sm font-normal'>
                            Guests & Room
                        </span>
                        <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary text-lg' >
                        {order.common_details.adults} Adults
                        </h2>
                        </div>
                    </div>
                </div>
            </div>
      </div>
    </div>
  )
}

export default Page