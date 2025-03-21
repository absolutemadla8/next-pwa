'use client';

import dynamic from 'next/dynamic';
import type { LottieComponentProps } from 'lottie-react';
import loadingAnimation from '@/app/lottie/travelloader.json';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface LoadingButtonProps {
  loading: boolean;
  onClick?: () => void;
  text: string;
  loadingText?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function LoadingButton({
  loading,
  onClick,
  text,
  loadingText = 'Loading...',
  className = '',
  type = 'button'
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`relative ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <Lottie
            animationData={loadingAnimation}
            style={{ width: 24, height: 24, backgroundColor:"white", padding:"1px", borderRadius:"10%" }}
            loop={true}
          />
          <span className="ml-2">{loadingText}</span>
        </div>
      ) : (
        text
      )}
    </button>
  );
}