// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (Indian format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  const cleaned = phone.replace(/\D/g, '');
  return phoneRegex.test(cleaned);
};

// Password validation
export const passwordValidation = {
  isValid: (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  },

  getStrength: (password: string): 'weak' | 'medium' | 'strong' => {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    if (strength <= 3) return 'weak';
    if (strength <= 5) return 'medium';
    return 'strong';
  },

  getValidationErrors: (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return errors;
  }
};

// OTP validation
export const isValidOTP = (otp: string, length: number = 6): boolean => {
  const otpRegex = new RegExp(`^\\d{${length}}$`);
  return otpRegex.test(otp);
};

// URL validation
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Credit card validation (basic Luhn algorithm)
export const creditCard = {
  isValid: (cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (!/^\d+$/.test(cleaned) || cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  },

  getType: (cardNumber: string): string | null => {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    const patterns: Record<string, RegExp> = {
      visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
      mastercard: /^5[1-5][0-9]{14}$/,
      amex: /^3[47][0-9]{13}$/,
      discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
      rupay: /^6[0-9]{15}$/
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cleaned)) {
        return type;
      }
    }
    
    return null;
  },

  format: (cardNumber: string): string => {
    const cleaned = cardNumber.replace(/\s/g, '');
    const parts = cleaned.match(/.{1,4}/g) || [];
    return parts.join(' ');
  }
};

// CVV validation
export const isValidCVV = (cvv: string, cardType?: string): boolean => {
  const cleaned = cvv.replace(/\D/g, '');
  
  if (cardType === 'amex') {
    return /^\d{4}$/.test(cleaned);
  }
  
  return /^\d{3}$/.test(cleaned);
};

// Expiry date validation
export const isValidExpiryDate = (month: string, year: string): boolean => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  const expMonth = parseInt(month, 10);
  const expYear = parseInt(year, 10);
  
  if (expMonth < 1 || expMonth > 12) {
    return false;
  }
  
  const fullYear = expYear < 100 ? 2000 + expYear : expYear;
  
  if (fullYear < currentYear) {
    return false;
  }
  
  if (fullYear === currentYear && expMonth < currentMonth) {
    return false;
  }
  
  return true;
};

// Pincode validation (Indian format)
export const isValidPincode = (pincode: string): boolean => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

// GST number validation (Indian format)
export const isValidGST = (gst: string): boolean => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst.toUpperCase());
};

// PAN card validation (Indian format)
export const isValidPAN = (pan: string): boolean => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
};

// Aadhaar validation (basic check - just format, not actual validation)
export const isValidAadhaar = (aadhaar: string): boolean => {
  const cleaned = aadhaar.replace(/\s/g, '');
  const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
  return aadhaarRegex.test(cleaned);
};

// Name validation
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  return nameRegex.test(name) && name.trim().length >= 2;
};

// Username validation
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

// Age validation
export const isValidAge = (age: number, min: number = 0, max: number = 120): boolean => {
  return Number.isInteger(age) && age >= min && age <= max;
};

// Date validation
export const isValidDate = (date: string | Date): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

// File validation
export const file = {
  isValidSize: (sizeInBytes: number, maxSizeInMB: number): boolean => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return sizeInBytes <= maxSizeInBytes;
  },

  isValidType: (fileName: string, allowedTypes: string[]): boolean => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return allowedTypes.map(type => type.toLowerCase()).includes(extension);
  },

  isImage: (fileName: string): boolean => {
    return file.isValidType(fileName, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']);
  },

  isDocument: (fileName: string): boolean => {
    return file.isValidType(fileName, ['pdf', 'doc', 'docx', 'txt', 'rtf']);
  }
};

// Price validation
export const isValidPrice = (price: number | string): boolean => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return !isNaN(numPrice) && numPrice >= 0 && isFinite(numPrice);
};

// Quantity validation
export const isValidQuantity = (quantity: number, min: number = 1, max?: number): boolean => {
  return Number.isInteger(quantity) && quantity >= min && (max === undefined || quantity <= max);
};

// Discount validation
export const isValidDiscount = (discount: number, isPercentage: boolean = true): boolean => {
  if (isPercentage) {
    return discount >= 0 && discount <= 100;
  }
  return discount >= 0;
};