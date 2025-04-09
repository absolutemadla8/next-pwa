// app/verify/VerifyContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import LoadingButton from '../ui/LoadingButton';
import SmallLogoWhite from '../svg/SmallLogoWhite';
import OftenGradientLogo from '../svg/OftenGradientLogo';
import { ArrowRight } from 'iconsax-react';
import OftenLogo from '../svg/OftenLogo';

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
    <div className="flex min-h-screen bg-white pt-8 px-6 relative overflow-hidden">
      <img src="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/oftenlogobg.png" alt="trippy" className='absolute -top-5 left-0 right-0 bottom-0 w-full h-64 object-cover p-4 opacity-40' />

      <form onSubmit={handleSubmit} className="w-full z-10">
        <OftenLogo height={30} />
        <h1 className="text-xl font-normal mt-4 text-primary">Verify Phone Number</h1>
        <h1 className="text-md font-normal mb-6 text-primary/60">Enter the verification code below</h1>

        {phoneNumber && (
          <div className="text-primary mb-6">
            <p className="font-normal">Code sent to <span style={{ fontFamily: 'var(--font-nohemi)' }} className="font-normal">{phoneNumber}</span></p>
          </div>
        )}

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="mb-4">
          <label className="block mb-2 font-normal text-primary">Verification Code</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            style={{ fontFamily: 'var(--font-nohemi)' }}
            className="w-full p-3 bg-transparent rounded-lg text-primary border border-primary/20 placeholder-primary/70 tracking-widest text-center text-xl"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="• • • • • •"
            maxLength={6}
            required
          />
        </div>

        <LoadingButton
          type="submit"
          loading={loading}
          text="Verify Code"
          loadingText="Verifying..."
          icon={<ArrowRight size={20} className='text-white' />}
          className="w-full p-3 bg-[#1999F5] text-white rounded-lg mt-4 font-semibold mb-3"
        />

        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0}
          className="w-full p-3 text-primary/80 rounded-lg bg-transparent font-normal text-sm"
        >
          {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
        </button>
      </form>
      
      {/* Video with gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-96 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white z-10"></div>
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-50"
        >
          <source src="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/travel.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}