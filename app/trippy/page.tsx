// app/trippy/page.tsx
import { Suspense } from 'react';
import SmallLogoWhite from '@/app/components/svg/SmallLogoWhite';
import VoiceComponent from "@/app/components/VoiceComponent";
import BottomContent from '../components/trippy/BottomContent';

export default function TrippyPage() {
  return (
    <div className='flex flex-col w-full h-screen items-center justify-center overscroll-contain'>
      <div className="flex flex-col items-center justify-start h-screen w-full bg-gradient-to-b from-[#0C66E4] to-[#5751FF] p-4">
        <img src="https://aktt5yjwyc.ufs.sh/f/VfNn67L471NriyZEUVGTOah6yUfotzbSjNJ5LBrsDwqx1g7e" className='absolute h-full w-full object-cover'/>
        <SmallLogoWhite />
        <div className='flex flex-col items-center justify-center gap-y-6 py-14 z-10'>
          <div>
            <Suspense fallback={<div>Loading voice component...</div>}>
              <VoiceComponent />
            </Suspense>
          </div>
        </div>
        <Suspense fallback={<div>Loading bottom sheet...</div>}>
          <BottomContent />
        </Suspense>
      </div>
    </div>
  );
}