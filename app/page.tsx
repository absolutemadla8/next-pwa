'use client'
import Image from "next/image";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SmallLogoWhite from "./components/svg/SmallLogoWhite";
import Lottie from "lottie-react";
import AnimationData from "@/app/lottie/splashscreenblue.json"

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2800);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12 bg-blue-600">
      <Lottie 
        loop={false}
        animationData={AnimationData}
      />
    </main>
  );
}
