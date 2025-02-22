'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import LoadingButton from '../components/ui/LoadingButton';
import SmallLogoWhite from '../components/svg/SmallLogoWhite';
import dynamic from 'next/dynamic';

const VerifyPage = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  //@ts-ignore mlmr
  const { verifyOtp, resendOtp, phoneNumber } = useAuth();

  // Handle hydration and mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if no phone number in state
  useEffect(() => {
    if (mounted && !phoneNumber) {
      router.replace('/login');
    }
  }, [phoneNumber, router, mounted]);

  // Countdown timer for resend
  useEffect(() => {
    if (!mounted || countdown <= 0) return;
    
    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await verifyOtp(otp);
      
      if (result.error) {
        setError(result.msg);
      } else {
        router.push('/trippy');
        return; // Exit early on successful verification
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    try {
      const result = await resendOtp();
      if (result.error) {
        setError(result.msg);
      } else {
        setCountdown(60);
        setError('');
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    }
  };

  // Don't render until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-600 relative">
      <img 
        src="https://aktt5yjwyc.ufs.sh/f/VfNn67L471NriyZEUVGTOah6yUfotzbSjNJ5LBrsDwqx1g7e" 
        className="absolute h-full w-full object-cover"
        alt="Background"
      />
      <form onSubmit={handleSubmit} className="w-full max-w-md p-6 relative z-10">
        <SmallLogoWhite />
        <h1 
          style={{ fontFamily: 'var(--font-nohemi)' }} 
          className="text-2xl mb-6 text-white"
        >
          Verify Phone Number
        </h1>
        
        {phoneNumber && (
          <div className="text-white">
            <p className="font-normal">Enter the verification code sent to</p>
            <p 
              style={{ fontFamily: 'var(--font-nohemi)' }} 
              className="mb-6 font-normal tracking-wider"
            >
              {phoneNumber}
            </p>
          </div>
        )}
        
        {error && (
          <div className="text-red-500 mb-4 bg-white/90 p-2 rounded">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block mb-2 font-normal text-white">
            Verification Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            style={{ fontFamily: 'var(--font-nohemi)' }}
            className="w-full p-3 border rounded text-blue-950 tracking-wider" 
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              if (value.length <= 6) setOtp(value);
            }}
            placeholder="Enter 6-digit code"
            maxLength={6}
            required
          />
        </div>
        
        <LoadingButton
          type="submit"
          loading={loading}
          text="Verify code"
          loadingText="Verifying..."
          className="w-full p-3 bg-blue-950 text-white rounded mb-2 hover:bg-blue-900 transition-colors"
          //@ts-ignore mlmr
          disabled={otp.length !== 6}
        />
        
        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0}
          className={`w-full p-3 rounded text-white border border-white transition-colors
            ${countdown > 0 
              ? 'opacity-70 cursor-not-allowed' 
              : 'hover:bg-white/10'
            }`}
        >
          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
        </button>
      </form>
    </div>
  );
};

// Export a client-only version of the component
export default dynamic(() => Promise.resolve(VerifyPage), {
  ssr: false
});