import React, { useState, useEffect } from 'react';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption, RadioGroup, Field, Radio, Label } from '@headlessui/react';
import { AlertCircle, Calendar, AlertTriangle } from 'lucide-react';
import useBottomSheetStore from '@/app/store/bottomSheetStore';
import { 
  validateGuestForm, 
  separatePhoneNumber, 
  GuestFormErrors 
} from '@/app/schemas/guestFormSchema';

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
  onValidationChange?: (index: number, isValid: boolean) => void;
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
  updateGuest,
  onValidationChange
}) => {
  const titleOptions = ['Mr', 'Mrs', 'Ms'];
  const { openSheet } = useBottomSheetStore();
  const [errors, setErrors] = useState<GuestFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValid, setIsValid] = useState<boolean>(false);
  
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
  
  // Validate the form whenever the guest data changes
  useEffect(() => {
    //@ts-ignore mlmr
    const result = validateGuestForm(safeGuest, isPanCardRequired, isPassportRequired);
    
    if (!result.success && result.errors) {
      setErrors(result.errors);
      setIsValid(false);
    } else {
      setErrors({});
      setIsValid(true);
    }
    
    // Report validation status to parent
    if (onValidationChange) {
      onValidationChange(index, result.success);
    }
    
  }, [safeGuest, isPanCardRequired, isPassportRequired, index, onValidationChange]);
  
  // Handle field blur for validation
  const handleBlur = (field: keyof Guest) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };
  
  // Handle phone number input with automatic country code separation
  const handlePhoneInput = (value: string) => {
    // If the value starts with +, attempt to separate country code
    if (value.startsWith('+')) {
      const { isdCode, contactNumber, isValid } = separatePhoneNumber(value);
      
      if (isValid) {
        // Valid ISD code, update both fields
        updateGuest(index, { 
          isdCode,
          contactNumber 
        });
      } else {
        // Invalid ISD code, just update the field but don't separate
        updateGuest(index, { contactNumber: value });
        
        // Show an error for invalid ISD code
        setErrors(prev => ({
          ...prev,
          contactNumber: 'Invalid country code. Please use +1, +44, or +91'
        }));
      }
    } else {
      // Regular update without separation
      updateGuest(index, { contactNumber: value });
    }
    
    setTouched(prev => ({ ...prev, contactNumber: true }));
  };
  
  // Function to open passport expiry date picker
  const openPassportExpiryPicker = () => {
    // Set up the date selection callback
    if (typeof window !== 'undefined' && (window as any).setupPassportExpirySelection) {
      (window as any).setupPassportExpirySelection(
        index,
        (date: string) => {
          updateGuest(index, { passportExpiry: date });
          setTouched(prev => ({ ...prev, passportExpiry: true }));
        }
      );
    }
    
    // Open the bottom sheet
    openSheet('passportExpiry', {
      title: 'Passport Expiry Date',
      minHeight: '70vh',
      maxHeight: '90vh',
      showPin: false
    });
  };
  
  // Helper to render error message
  const renderError = (field: keyof Guest) => {
    if (touched[field] && errors[field]) {
      return (
        <div className="text-red-500 text-xs mt-1 flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {errors[field]}
        </div>
      );
    }
    return null;
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
              <Label className="text-sm font-normal text-primary">{title}</Label>
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
            onBlur={() => handleBlur('firstName')}
            className={`w-full text-md font-normal px-4 py-3 bg-gray-50 border ${
              touched.firstName && errors.firstName ? 'border-red-500' : 'border-gray-200'
            } rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          {renderError('firstName')}
        </div>
        
        <div>
          <input
            style={{ fontFamily: 'var(--font-nohemi)' }}
            type="text"
            placeholder="Last Name"
            value={safeGuest.lastName || ''}
            onChange={(e) => updateGuest(index, { lastName: e.target.value })}
            onBlur={() => handleBlur('lastName')}
            className={`w-full px-4 py-3 bg-gray-50 border ${
              touched.lastName && errors.lastName ? 'border-red-500' : 'border-gray-200'
            } rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          {renderError('lastName')}
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
          onBlur={() => handleBlur('email')}
          className={`w-full px-4 py-3 bg-gray-50 border ${
            touched.email && errors.email ? 'border-red-500' : 'border-gray-200'
          } rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        />
        {renderError('email')}
      </div>

      {/* Phone Fields */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <Listbox 
            value={safeGuest.isdCode || '91'} 
            onChange={(value) => {
              updateGuest(index, { isdCode: value });
              setTouched(prev => ({ ...prev, isdCode: true }));
            }}
          >
            <div className="relative">
              <ListboxButton 
                style={{ fontFamily: 'var(--font-nohemi)' }} 
                className={`relative w-full px-4 py-3 bg-gray-50 border ${
                  touched.isdCode && errors.isdCode ? 'border-red-500' : 'border-gray-200'
                } rounded-lg text-gray-800 text-left`}
              >
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
          {renderError('isdCode')}
        </div>
        
        <div className="col-span-2">
          <input
            style={{ fontFamily: 'var(--font-nohemi)' }}
            type="tel"
            placeholder="Phone Number (e.g. +91 98765 43210)"
            value={safeGuest.contactNumber || ''}
            onChange={(e) => handlePhoneInput(e.target.value)}
            onBlur={() => handleBlur('contactNumber')}
            className={`w-full px-4 py-3 bg-gray-50 border ${
              touched.contactNumber && errors.contactNumber ? 'border-red-500' : 'border-gray-200'
            } rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          {renderError('contactNumber')}
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
          <div>
            <input
              style={{ fontFamily: 'var(--font-nohemi)' }}
              type="text"
              placeholder="PAN Number (e.g. ABCDE1234F)"
              value={safeGuest.panCardNumber || ''}
              onChange={(e) => updateGuest(index, { panCardNumber: e.target.value.toUpperCase() })}
              onBlur={() => handleBlur('panCardNumber')}
              className={`w-full px-4 py-3 bg-gray-50 border ${
                touched.panCardNumber && errors.panCardNumber ? 'border-red-500' : 'border-gray-200'
              } rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {renderError('panCardNumber')}
            <span className="text-gray-500 text-xs mt-1">
              Format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)
            </span>
          </div>
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
                placeholder="Passport Number (min 4 characters)"
                value={safeGuest.passportNumber || ''}
                onChange={(e) => updateGuest(index, { passportNumber: e.target.value })}
                onBlur={() => handleBlur('passportNumber')}
                className={`w-full px-4 py-3 bg-gray-50 border ${
                  touched.passportNumber && errors.passportNumber ? 'border-red-500' : 'border-gray-200'
                } rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {renderError('passportNumber')}
            </div>
            
            <div>
              <div className="relative">
                <input
                  style={{ fontFamily: 'var(--font-nohemi)' }}
                  type="text"
                  placeholder="Expiry Date (YYYY-MM-DD)"
                  value={safeGuest.passportExpiry || ''}
                  onChange={(e) => updateGuest(index, { passportExpiry: e.target.value })}
                  onBlur={() => handleBlur('passportExpiry')}
                  className={`w-full px-4 py-3 bg-gray-50 border ${
                    touched.passportExpiry && errors.passportExpiry ? 'border-red-500' : 'border-gray-200'
                  } rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10`}
                  readOnly
                  onClick={openPassportExpiryPicker}
                />
                <button 
                  type="button"
                  onClick={openPassportExpiryPicker}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-blue-600"
                >
                  <Calendar className="h-5 w-5" />
                </button>
                {renderError('passportExpiry')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestForm;