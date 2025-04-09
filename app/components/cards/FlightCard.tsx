import React from 'react';
import { Circle, CircleDashed } from 'lucide-react';
import { FlightCardProps } from './types';

const FlightCard: React.FC<FlightCardProps> = ({
  airlineLogo,
  flightNumber,
  departureAirport,
  departureCity,
  departureTime,
  arrivalAirport,
  arrivalCity,
  arrivalTime,
  isDirect,
  isConnecting = false,
  className = '',
}) => {
  return (
    <div className={`flex flex-col rounded-lg bg-neutral-100 p-4 w-64 h-40 ${className}`}>
      <div className='flex flex-row items-center justify-between w-full'>
        <img className='w-20' src={airlineLogo} />
        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-sm font-medium text-gray-800'>
          {flightNumber}
        </h1>
      </div>
      <div className='flex flex-row items-center justify-between w-full mt-4'>
        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-lg font-medium text-gray-800 text-left'>
          {departureAirport}
        </h1>
        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-lg font-medium text-gray-800 text-right'>
          {arrivalAirport}
        </h1>
      </div>
      <div className='flex flex-row items-center justify-between w-full'>
        <h1 className='text-sm font-normal text-slate-600 text-left tracking-tight'>
          {departureCity}
        </h1>
        <h1 className='text-sm font-normal text-slate-600 text-right tracking-tight'>
          {arrivalCity}
        </h1>
      </div>
      <div className='flex flex-row items-center justify-between w-full'>
        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-sm font-medium text-gray-800 text-left'>
          {departureTime}
        </h1>
        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-sm font-medium text-gray-800 text-right'>
          {arrivalTime}
        </h1>
      </div>
      {isDirect && (
        <div className='flex flex-row items-center justify-start w-full mt-2'>
          <Circle size={12} className='text-green-700' />
          <h1 className='text-sm font-normal text-gray-800 ml-1'>
            Direct
          </h1>
        </div>
      )}
      {isConnecting && (
        <div className='flex flex-row items-center justify-start w-full mt-2'>
          <CircleDashed size={12} className='text-yellow-600' />
          <h1 className='text-sm font-normal text-gray-800 ml-1'>
            Connecting
          </h1>
        </div>
      )}
    </div>
  );
};

export default FlightCard;
