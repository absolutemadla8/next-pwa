'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import LoadingButton from '../components/ui/LoadingButton';
import SmallLogoWhite from '../components/svg/SmallLogoWhite';
import dynamic from 'next/dynamic';

// Create a client-only version of the page
const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  //@ts-ignore mlmr
  const { login } = useAuth();

  // Handle hydration issues by ensuring component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(phoneNumber);
      
      if (result.error) {
        setError(result.msg);
      } else {
        router.push('/verify');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-blue-600 relative">
      <img 
        src="https://aktt5yjwyc.ufs.sh/f/VfNn67L471NriyZEUVGTOah6yUfotzbSjNJ5LBrsDwqx1g7e" 
        className="absolute h-full w-full object-cover"
        alt="Background"
      />
      <form onSubmit={handleSubmit} className="w-full max-w-md p-6 relative z-10">
        <div className="flex flex-col items-start justify-start w-full">
          <SmallLogoWhite />
          <h1 
            style={{ fontFamily: 'var(--font-nohemi)' }}  
            className="text-2xl font-[--font-nohemi] mb-6 text-white"
          >
            Enter your phone number
          </h1>
          
          {error && (
            <div className="text-red-500 mb-4 bg-white/90 p-2 rounded">
              {error}
            </div>
          )}
          
          <div className="mb-2 w-full">
            <label className="block mb-2 font-normal text-white">
              Phone Number
            </label>
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
            className="w-full p-3 bg-blue-950 text-white rounded hover:bg-blue-900 transition-colors"
          />
        </div>
      </form>
    </div>
  );
};

// Export a client-only version of the component
export default dynamic(() => Promise.resolve(LoginPage), {
  ssr: false
});