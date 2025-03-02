'use client'
import Image from "next/image";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SmallLogoWhite from "./components/svg/SmallLogoWhite";
import dynamic from 'next/dynamic';

// Dynamically import Lottie with no SSR
const LottieWithNoSSR = dynamic(() => import('lottie-react'), { 
  ssr: false,
  loading: () => <div className="w-64 h-64 bg-blue-500 rounded-full animate-pulse"></div>
});

export default function Home() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     router.replace('/login');
  //   }, 2800);

  //   return () => clearTimeout(timer);
  // }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-start justify-start p-6 bg-[#FFF]">
      <div className="flex flex-col w-full items-center justify-center pb-6">
        <SmallLogoWhite size={46} color="#030F57" />
      </div>
      {/* {isClient && (
        <LottieWithNoSSR 
          loop={false}
          animationData={require("@/app/lottie/splashscreenblue.json")}
        />
      )} */}
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
        <div onClick={()=>router.push('/chat')} className="flex flex-row items-center p-4 rounded-lg bg-indigo-100 border border-indigo-500 w-full">
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
    </main>
  );
}