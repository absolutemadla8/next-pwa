// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import LoadingButton from '../components/ui/LoadingButton';
// import SmallLogoWhite from '../components/svg/SmallLogoWhite';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  //@ts-ignore my life my rules
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(phoneNumber);
    
    if (result.error) {
      setError(result.msg);
    } else {
      router.push('/verify');
    }
    
    setLoading(false);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-blue-600">
       <img src="https://aktt5yjwyc.ufs.sh/f/VfNn67L471NriyZEUVGTOah6yUfotzbSjNJ5LBrsDwqx1g7e" className='absolute h-full w-full object-cover'/>
      <form onSubmit={handleSubmit} className="w-full max-w-md p-6">
      <div className="flex flex-col items-start justify-start w-full">
        {/* <SmallLogoWhite /> */}
        <h1 style={{ fontFamily: 'var(--font-nohemi)' }}  className="text-2xl font-[--font-nohemi] mb-6">Enter your phone number</h1>
        
        {error && <div className="text-red-500 mb-4">{error}</div>}
        
        <div className="mb-2 w-full z-10">
          <label className="block mb-2 font-normal">Phone Number</label>
          <input
            type="tel"
            style={{ fontFamily: 'var(--font-nohemi)' }}
            className="w-full p-3 border rounded tracking-wider text-blue-950" 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
            required
          />
        </div>
        
        <LoadingButton
          type="submit"
          loading={loading}
          text="Send Verification Code"
          loadingText="Sending..."
          className="w-full p-3 bg-blue-950 text-white rounded"
        />
        </div>
      </form>
    </div>
  );
}