// app/verify/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import LoadingButton from '../components/ui/LoadingButton';
import SmallLogoWhite from '../components/svg/SmallLogoWhite';

export default function VerifyPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  
  const router = useRouter();
  //@ts-ignore my life my rules
  const { verifyOtp, resendOtp, phoneNumber } = useAuth();

  // Redirect if no phone number in state
  useEffect(() => {
    if (!phoneNumber) {
      router.replace('/login');
    }
  }, [phoneNumber, router]);

  // Countdown timer for resend
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
      <img src="https://aktt5yjwyc.ufs.sh/f/VfNn67L471NriyZEUVGTOah6yUfotzbSjNJ5LBrsDwqx1g7e" className='absolute h-full w-full object-cover'/>
      <form onSubmit={handleSubmit} className="w-full max-w-md p-6 z-10">
        <SmallLogoWhite />
        <h1 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-2xl mb-6">Verify Phone Number</h1>
        
        {phoneNumber && (
          <div>
          <p className="font-normal">Enter the verification code sent to</p>
          <p style={{ fontFamily: 'var(--font-nohemi)' }} className="mb-6 font-normal">{phoneNumber}</p>
          </div>
        )}
        
        {error && <div className="text-red-500 mb-4">{error}</div>}
        
        <div className="mb-4">
          <label className="block mb-2 font-normal">Verification Code</label>
          <input
            type="text"
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
          className="w-full p-3 text-blue-500 rounded text-white border border-white"
        >
          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
        </button>
      </form>
    </div>
  );
}