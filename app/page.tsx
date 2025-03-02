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

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2800);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12 bg-blue-600">
      {isClient && (
        <LottieWithNoSSR 
          loop={false}
          animationData={require("@/app/lottie/splashscreenblue.json")}
        />
      )}
    </main>
  );
}