// app/login/LoginContent.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import LoadingButton from '../ui/LoadingButton';
import SmallLogoWhite from '../svg/SmallLogoWhite';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { separatePhoneNumber } from '@/app/schemas/guestFormSchema';
import OftenGradientLogo from '../svg/OftenGradientLogo';
import { ArrowRight } from 'iconsax-react';
import OftenLogo from '../svg/OftenLogo';

// Define the country codes
const countryCodeOptions = [
  { id: '1', label: '+1 🇺🇸', value: '1' },
  { id: '44', label: '+44 🇬🇧', value: '44' },
  { id: '91', label: '+91 🇮🇳', value: '91' },
];

export default function LoginContent() {
  const [isdCode, setIsdCode] = useState('91');
  const [contactNumber, setContactNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  //@ts-ignore mlmr
  const { login } = useAuth();

  // Handle phone input that might include country code
  const handlePhoneInput = (value: string) => {
    // If the value starts with +, attempt to separate country code
    if (value.startsWith('+')) {
      const { isdCode: extractedCode, contactNumber: extractedNumber, isValid } = separatePhoneNumber(value);

      if (isValid) {
        // Valid ISD code, update both fields
        setIsdCode(extractedCode);
        setContactNumber(extractedNumber);
      } else {
        // Invalid ISD code, just update the contact number field
        setContactNumber(value);
        setError('Invalid country code. Please use +1, +44, or +91');
      }
    } else {
      // Regular update without separation
      setContactNumber(value);
    }
  };

  // Combine ISD code and contact number for submission
  const getFullPhoneNumber = () => {
    return `+${isdCode}${contactNumber}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fullPhoneNumber = getFullPhoneNumber();
    const result = await login(fullPhoneNumber);

    if (result.error) {
      setError(result.msg);
    } else {
      router.push('/verify');
    }

    setLoading(false);
  };

  // Basic validation
  const isValidPhoneNumber = () => {
    return contactNumber.length >= 4 && /^\d[\d\s-]*$/.test(contactNumber);
  };

  return (
    <div className="flex h-screen bg-white pt-8 px-6 relative overflow-hidden">

      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col items-start justify-start w-full">
        <img src="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/oftenlogobg.png" alt="trippy" className='absolute -top-5 left-0 right-0 bottom-0 w-full h-64 object-cover p-4 opacity-40' />
          <OftenLogo height={30} />
          <h1  className="text-xl font-normal mt-4 text-primary">Enter your phone number</h1>
          <h1  className="text-md font-normal mb-6 text-primary/60">Enter your phone number</h1>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="mb-2 w-full">
            <label className="block mb-2 font-normal text-primary">Phone Number</label>
            <div className="grid grid-cols-3 gap-2">
              {/* Country code dropdown */}
              <div>
                <Listbox
                  value={isdCode}
                  onChange={setIsdCode}
                >
                  <div className="relative">
                    <ListboxButton
                      style={{ fontFamily: 'var(--font-nohemi)' }}
                      className="relative w-full px-4 py-3 bg-transparent rounded-md text-primary text-left"
                    >
                      {`+${isdCode}`} <span className='text-lg'>{isdCode === '91' ? '🇮🇳' : isdCode === '44' ? '🇬🇧' : '🇺🇸'}</span>
                    </ListboxButton>
                    <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#F4F2EB] py-1 shadow-lg ring-1 ring-white ring-opacity-5 focus:outline-none">
                      {countryCodeOptions.map((code) => (
                        <ListboxOption
                          key={code.id}
                          value={code.value}
                          className="cursor-default select-none relative py-2 pl-10 pr-4 text-primary"
                        >
                          {({ selected }) => (
                            <>
                              <span style={{ fontFamily: 'var(--font-nohemi)' }} className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                {code.label}
                              </span>
                              {selected && (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </span>
                              )}
                            </>
                          )}
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>

              {/* Phone number input */}
              <div className="col-span-2 z-10">
                <input
                  type="tel"
                  style={{ fontFamily: 'var(--font-nohemi)' }}
                  className="w-full p-3 rounded-lg tracking-wider text-primary bg-transparent placeholder-text-primary/40"
                  value={contactNumber}
                  onChange={(e) => handlePhoneInput(e.target.value)}
                  placeholder="9999999999"
                  required
                />
              </div>
            </div>
            {!isValidPhoneNumber() && contactNumber && (
              <div className="text-red-300 text-xs mt-1">
                Phone number must contain at least 4 digits
              </div>
            )}
          </div>

          <LoadingButton
            type="submit"
            loading={loading}
            text="Send Verification Code"
            loadingText="Sending..."
            icon={<ArrowRight size={20} className='text-white' />}
            className="w-full p-3 bg-transparent bg-[#1999F5] text-white rounded mt-4 font-semibold"
          />
        </div>
      </form>
      
      {/* Video with gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-96 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white z-10"></div>
        <video  
          loop 
          muted 
          autoPlay={true}
          playsInline
          className="w-full h-full object-cover opacity-50"
        >
          <source src="https://often-app-assets.s3.ap-southeast-1.amazonaws.com/loginvideobg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}