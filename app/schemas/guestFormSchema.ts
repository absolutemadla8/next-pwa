import { z } from 'zod';

// Valid ISD codes that we support
const validIsdCodes = ['1', '44', '91'];

// Helper function to separate country code from phone number
export const separatePhoneNumber = (phoneNumber: string): { isdCode: string; contactNumber: string; isValid: boolean } => {
  // Check if phone number starts with + followed by digits (country code)
  const match = phoneNumber.match(/^\+(\d+)(.*)$/);
  if (match) {
    const extractedIsdCode = match[1];
    // Validate if the extracted ISD code is in our list of valid codes
    if (validIsdCodes.includes(extractedIsdCode)) {
      return {
        isdCode: extractedIsdCode, // Country code without +
        contactNumber: match[2].trim(), // Rest of the number
        isValid: true
      };
    } else {
      // Invalid ISD code
      return {
        isdCode: extractedIsdCode,
        contactNumber: match[2].trim(),
        isValid: false
      };
    }
  }
  
  // If no country code is detected, return the phone as is with default isdCode
  return {
    isdCode: '91', // Default to India country code
    contactNumber: phoneNumber.trim(),
    isValid: true // Consider valid as we're using the default code
  };
};

// Define validation schema for PAN card (5 capital alphabets, 4 numerical digits, 1 capital alphabet)
export const panCardSchema = z
  .string()
  .toUpperCase()
  .refine((val) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val), {
    message: 'PAN Card must be in format: AAAAA1111A (5 letters, 4 digits, 1 letter)',
  });

// Passport Number validation - at least 4 characters
export const passportSchema = z
  .string()
  .min(4, 'Passport number must be at least 4 characters long');

// Passport Expiry Date validation
export const passportExpirySchema = z
  .string()
  .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
    message: 'Passport expiry must be in YYYY-MM-DD format',
  });

// Phone number validation
export const phoneNumberSchema = z
  .string()
  .min(4, 'Phone number must be at least 4 digits')
  .refine((val) => /^\+?\d[\d\s-]*$/.test(val), {
    message: 'Phone number can only contain digits, spaces or hyphens',
  });

// Main Guest form validation schema
export const guestFormSchema = z.object({
  title: z.enum(['Mr', 'Mrs', 'Ms']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  isdCode: z.string().min(1, 'Country code is required'),
  contactNumber: z.string().min(4, 'Phone number is required'),
  // Optional fields that might be required conditionally
  panCardNumber: z.union([
    panCardSchema,
    z.string().length(0),
    z.null()
  ]).optional().nullable(),
  passportNumber: z.union([
    passportSchema,
    z.string().length(0),
    z.null()
  ]).optional().nullable(),
  passportExpiry: z.union([
    passportExpirySchema,
    z.string().length(0),
    z.null()
  ]).optional().nullable(),
});

// Type for form validation errors
export type GuestFormErrors = {
  [K in keyof z.infer<typeof guestFormSchema>]?: string;
};

// Type for validation result
export type ValidationResult = {
  success: boolean;
  data?: z.infer<typeof guestFormSchema>;
  errors?: GuestFormErrors;
};

// Function to validate guest form data
export const validateGuestForm = (
  guestData: z.infer<typeof guestFormSchema>,
  isPanCardRequired: boolean = false,
  isPassportRequired: boolean = false
): ValidationResult => {
  try {
    // Create a schema with conditional requirements based on flags
    const customSchema = guestFormSchema.extend({
      panCardNumber: isPanCardRequired
        ? panCardSchema.nullable().refine((val) => val !== null && val !== '', {
            message: 'PAN Card is required',
          })
        : guestFormSchema.shape.panCardNumber,
      passportNumber: isPassportRequired
        ? passportSchema.nullable().refine((val) => val !== null && val !== '', {
            message: 'Passport number is required',
          })
        : guestFormSchema.shape.passportNumber,
      passportExpiry: isPassportRequired
        ? passportExpirySchema.nullable().refine((val) => val !== null && val !== '', {
            message: 'Passport expiry date is required',
          })
        : guestFormSchema.shape.passportExpiry,
    });

    // Validate the data
    const validatedData = customSchema.parse(guestData);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: GuestFormErrors = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        fieldErrors[path as keyof z.infer<typeof guestFormSchema>] = err.message;
      });
      return { success: false, errors: fieldErrors };
    }
    
    // Generic error
    return { 
      success: false, 
      errors: { 
        firstName: 'An unexpected error occurred during validation.' 
      } 
    };
  }
};