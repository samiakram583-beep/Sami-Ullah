export interface ValidationErrors {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
  general?: string;
}

export function validateCustomerDetails(
  name: string,
  email: string,
  phone: string,
  notes?: string
): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

  const cleanName = (name || '').trim();
  if (!cleanName) {
    errors.customerName = 'First and last name are required.';
  } else if (cleanName.length < 2) {
    errors.customerName = 'Name must be at least 2 characters long.';
  } else if (cleanName.length > 80) {
    errors.customerName = 'Name must not exceed 80 characters.';
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail) {
    errors.customerEmail = 'Email address is required for confirmation.';
  } else if (!emailRegex.test(cleanEmail)) {
    errors.customerEmail = 'Please provide a valid email address.';
  }

  const cleanPhone = (phone || '').trim();
  // Strip non-digits to test minimum phone length
  const digitsOnly = cleanPhone.replace(/\D/g, '');
  if (!cleanPhone) {
    errors.customerPhone = 'Phone number is required for SMS and appointment updates.';
  } else if (digitsOnly.length < 10) {
    errors.customerPhone = 'Please provide a valid 10-digit phone number.';
  } else if (cleanPhone.length > 25) {
    errors.customerPhone = 'Phone number is too long.';
  }

  if (notes && notes.length > 500) {
    errors.notes = 'Notes cannot exceed 500 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
