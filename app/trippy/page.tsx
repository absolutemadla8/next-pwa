'use client'
import { Suspense } from 'react';
import SmallLogoWhite from '@/app/components/svg/SmallLogoWhite';
import VoiceComponent from "@/app/components/VoiceComponent";
import BottomContent from '../components/trippy/BottomContent';
import { useRouter } from 'next/navigation';

export default function TrippyPage() {
  const router = useRouter();
  return (
    <div className='flex flex-col w-full h-screen items-center justify-center overscroll-contain'>
      <div className="flex flex-col items-center justify-start h-screen w-full bg-white p-4">
        {/* <img src="https://aktt5yjwyc.ufs.sh/f/VfNn67L471NriyZEUVGTOah6yUfotzbSjNJ5LBrsDwqx1g7e" className='absolute h-full w-full object-cover'/> */}
        <SmallLogoWhite size={46} color='#030F57' />
        {/* <div className='flex flex-col items-center justify-center gap-y-6 py-14 z-10'>
          <div>
            <Suspense fallback={<div>Loading voice component...</div>}>
              <VoiceComponent />
            </Suspense>
          </div>
        </div> */}
         <div className="flex flex-col items-start justify-start w-full gap-y-4">
        <h1 style={{fontFamily: 'var(--font-domine)'}} className="text-2xl text-blue-950">
          Good <span className="bg-gradient-to-tr from-blue-700 to-purple-600 bg-clip-text text-transparent">Morning,</span>
        </h1>
        <div className="flex flex-row items-start justify-start gap-x-2 w-full">
         <div onClick={()=>router.push('/trippy/stays')} className="flex flex-col items-start justify-start rounded-lg overflow-hidden h-40 w-1/2">
          <img src="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/hotels-button.png" className="w-full h-full"/>
         </div>
         <div onClick={()=>router.push('/deals')} className="flex flex-col items-start justify-start rounded-lg overflow-hidden h-40 w-1/2">
          <img src="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/deals-button.png" className="w-full h-full"/>
         </div>
        </div>
        <div onClick={()=>router.push('/trippy/chat')} className="flex flex-row items-center p-4 rounded-lg bg-indigo-100 border border-indigo-500 w-full">
          <img src="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/trippy.png" className="w-12 h-12"/>
          <div className="flex flex-col items-start justify-start w-full pl-4">
            <h1 style={{fontFamily: 'var(--font-nohemi)'}} className="text-xl text-indigo-950">
              Talk to trippy
            </h1>
            <h1 className="text-sm font-normal tracking-tight text-indigo-800">
            Your AI travel genie with access to hotels, flights, events, deals and much more.
            </h1>
          </div>
        </div>
      </div>
        {/* <Suspense fallback={<div>Loading bottom sheet...</div>}>
          <BottomContent />
        </Suspense> */}
      </div>
    </div>
  );
}