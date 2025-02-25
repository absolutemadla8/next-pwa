// app/verify/VerifyContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import LoadingButton from '../ui/LoadingButton';
import SmallLogoWhite from '../svg/SmallLogoWhite';

export default function VerifyContent() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  
  const router = useRouter();
  //@ts-ignore mlmr
  const { verifyOtp, resendOtp, phoneNumber } = useAuth();

  useEffect(() => {
    if (!phoneNumber) {
      router.replace('/login');
    }
  }, [phoneNumber, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await verifyOtp(otp);
    
    if (result.error) {
      setError(result.msg);
      setLoading(false);
    } else {
      router.push('/trippy');
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    const result = await resendOtp();
    if (result.error) {
      setError(result.msg);
    } else {
      setCountdown(60);
      setError('');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-600">
     
      <form onSubmit={handleSubmit} className="w-full max-w-md p-6 z-10">
        <SmallLogoWhite />
        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-2xl mb-6 text-white">Verify Phone Number</h1>
        
        {phoneNumber && (
          <div className="text-white">
            <p className="font-normal">Enter the verification code sent to</p>
            <p style={{ fontFamily: 'var(--font-nohemi)' }} className="mb-6 font-normal">{phoneNumber}</p>
          </div>
        )}
        
        {error && <div className="text-red-500 mb-4">{error}</div>}
        
        <div className="mb-4">
          <label className="block mb-2 font-normal text-white">Verification Code</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            style={{ fontFamily: 'var(--font-nohemi)' }}
            className="w-full p-3 border rounded text-blue-950" 
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
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
          className="w-full p-3 bg-blue-950 text-white rounded mb-2"
        />
        
        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0}
          className="w-full p-3 text-white rounded border border-white"
        >
          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
        </button>
      </form>
    </div>
  );
}