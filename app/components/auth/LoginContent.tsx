// app/login/LoginContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import LoadingButton from '../ui/LoadingButton';
import SmallLogoWhite from '../svg/SmallLogoWhite';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { separatePhoneNumber } from '@/app/schemas/guestFormSchema';

// Define the country codes
const countryCodeOptions = [
  { id: '1', label: '+1', value: '1' },
  { id: '44', label: '+44', value: '44' },
  { id: '91', label: '+91', value: '91' },
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
    <div className="flex h-screen items-center justify-center bg-blue-600">
      
      <form onSubmit={handleSubmit} className="w-full max-w-md p-6">
        <div className="flex flex-col items-start justify-start w-full">
          <SmallLogoWhite />
          <h1 style={{ fontFamily: 'var(--font-nohemi)' }}  className="text-2xl font-[--font-nohemi] mb-6">Enter your phone number</h1>
          
          {error && <div className="text-red-500 mb-4">{error}</div>}
          
          <div className="mb-2 w-full">
            <label className="block mb-2 font-normal text-white">Phone Number</label>
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
                      className="relative w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-blue-950 text-left"
                    >
                      {`+${isdCode}`}
                    </ListboxButton>
                    <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {countryCodeOptions.map((code) => (
                        <ListboxOption 
                          key={code.id} 
                          value={code.value} 
                          className="cursor-default select-none relative py-2 pl-10 pr-4 text-gray-900 hover:bg-blue-100"
                        >
                          {({ selected, active }) => (
                            <>
                              <span style={{ fontFamily: 'var(--font-nohemi)' }} className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                {code.label}
                              </span>
                              {selected && (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
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
              <div className="col-span-2">
                <input
                  type="tel"
                  style={{ fontFamily: 'var(--font-nohemi)' }}
                  className="w-full p-3 border rounded-lg tracking-wider text-blue-950" 
                  value={contactNumber}
                  onChange={(e) => handlePhoneInput(e.target.value)}
                  placeholder="Phone Number"
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
            className="w-full p-3 bg-blue-950 text-white rounded mt-4"
          />
        </div>
      </form>
    </div>
  );
}