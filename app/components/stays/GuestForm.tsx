import React from 'react';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption, RadioGroup, Field, Radio, Label } from '@headlessui/react';
import { AlertCircle } from 'lucide-react';

// Type definitions
interface Guest {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  isdCode: string;
  contactNumber: string;
  panCardNumber?: string | null;
  passportNumber?: string | null;
  passportExpiry?: string | null;
}

interface GuestFormProps {
  guest: Guest | undefined;
  index: number;
  isPanCardRequired: boolean;
  isPassportRequired: boolean;
  updateGuest: (index: number, updatedGuest: Partial<Guest>) => void;
}

const countryCodeOptions = [
  { id: '1', label: '+1', value: '1' },
  { id: '44', label: '+44', value: '44' },
  { id: '91', label: '+91', value: '91' },
];

const GuestForm: React.FC<GuestFormProps> = ({ 
  guest, 
  index, 
  isPanCardRequired, 
  isPassportRequired, 
  updateGuest 
}) => {
  const titleOptions = ['Mr', 'Mrs', 'Ms'];
  
  // Initialize default guest if undefined
  const safeGuest: Guest = guest || {
    title: 'Mr',
    firstName: '',
    lastName: '',
    email: '',
    isdCode: '91', // Default to India
    contactNumber: '',
    panCardNumber: null,
    passportNumber: null,
    passportExpiry: null
  };

  return (
    <div className="bg-white rounded-lg mb-4">
      <div className="flex flex-col items-start justify-start mb-4 gap-y-2">
        <h3 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-blue-600 font-normal text-sm">
          Room {index + 1}
        </h3>
        
        {/* Title Selection as Radio Group */}
        <RadioGroup 
          value={safeGuest.title || 'Mr'} 
          onChange={(title) => updateGuest(index, { title })} 
          aria-label="Title"
          className="flex space-x-4"
        >
          {titleOptions.map((title) => (
            <Field key={title} className="flex items-center gap-2">
              <Radio 
                value={title} 
                className="group flex size-5 items-center justify-center rounded-full border bg-white data-[checked]:bg-blue-500"
              >
                <span className="invisible size-2 rounded-full bg-white group-data-[checked]:visible" />
              </Radio>
              <Label className="text-sm font-normal text-blue-950">{title}</Label>
            </Field>
          ))}
        </RadioGroup>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <input
            style={{ fontFamily: 'var(--font-nohemi)' }}
            type="text"
            placeholder="First Name"
            value={safeGuest.firstName || ''}
            onChange={(e) => updateGuest(index, { firstName: e.target.value })}
            className="w-full text-md font-normal px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <input
            style={{ fontFamily: 'var(--font-nohemi)' }}
            type="text"
            placeholder="Last Name"
            value={safeGuest.lastName || ''}
            onChange={(e) => updateGuest(index, { lastName: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="mb-4">
        <input
        style={{ fontFamily: 'var(--font-nohemi)' }}
          type="email"
          placeholder="Email Address"
          value={safeGuest.email || ''}
          onChange={(e) => updateGuest(index, { email: e.target.value })}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Phone Fields */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <Listbox value={safeGuest.isdCode || '91'} onChange={(value) => updateGuest(index, { isdCode: value })}>
            <div className="relative">
              <ListboxButton style={{ fontFamily: 'var(--font-nohemi)' }} className="relative w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-left">
                {safeGuest.isdCode ? `+${safeGuest.isdCode}` : '+91'}
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
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>
        
        <div className="col-span-2">
          <input
          style={{ fontFamily: 'var(--font-nohemi)' }}
            type="tel"
            placeholder="Phone Number"
            value={safeGuest.contactNumber || ''}
            onChange={(e) => updateGuest(index, { contactNumber: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* PAN Card Field - Conditional Rendering */}
      {isPanCardRequired && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-4 h-4 text-amber-500 mr-2" />
            <span className="text-amber-600 text-xs font-semibold">
              PAN Card is required for this booking
            </span>
          </div>
          <input
          style={{ fontFamily: 'var(--font-nohemi)' }}
            type="text"
            placeholder="PAN Number"
            value={safeGuest.panCardNumber || ''}
            onChange={(e) => updateGuest(index, { panCardNumber: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Passport Fields - Conditional Rendering */}
      {isPassportRequired && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-4 h-4 text-amber-500 mr-2" />
            <span className="text-amber-600 text-xs font-semibold">
              Passport is required for this booking
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <input
              style={{ fontFamily: 'var(--font-nohemi)' }}
                type="text"
                placeholder="Passport Number"
                value={safeGuest.passportNumber || ''}
                onChange={(e) => updateGuest(index, { passportNumber: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <input
              style={{ fontFamily: 'var(--font-nohemi)' }}
                type="text"
                placeholder="Expiry Date (YYYY-MM-DD)"
                value={safeGuest.passportExpiry || ''}
                onChange={(e) => updateGuest(index, { passportExpiry: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestForm;