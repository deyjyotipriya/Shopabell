// Quick helper for common price formatting
export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Alias for formatPrice for backward compatibility
export const formatCurrency = formatPrice;

// Currency formatting utilities
export const currency = {
  format: (
    amount: number,
    currencyCode: string = 'INR',
    locale: string = 'en-IN'
  ): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  },

  formatCompact: (
    amount: number,
    currencyCode: string = 'INR',
    locale: string = 'en-IN'
  ): string => {
    if (amount >= 10000000) {
      return `${currency.format(amount / 10000000, currencyCode, locale).replace(/\.00$/, '')} Cr`;
    } else if (amount >= 100000) {
      return `${currency.format(amount / 100000, currencyCode, locale).replace(/\.00$/, '')} L`;
    } else if (amount >= 1000) {
      return `${currency.format(amount / 1000, currencyCode, locale).replace(/\.00$/, '')} K`;
    }
    return currency.format(amount, currencyCode, locale);
  },

  parse: (value: string): number => {
    // Remove currency symbols and spaces
    const cleanValue = value.replace(/[^0-9.-]/g, '');
    return parseFloat(cleanValue) || 0;
  }
};

// Date formatting utilities
export const date = {
  format: (
    date: Date | string | number,
    format: 'short' | 'medium' | 'long' | 'full' = 'medium',
    locale: string = 'en-IN'
  ): string => {
    const dateObj = new Date(date);
    
    const options: Intl.DateTimeFormatOptions = {
      short: { day: 'numeric', month: 'numeric', year: '2-digit' } as Intl.DateTimeFormatOptions,
      medium: { day: 'numeric', month: 'short', year: 'numeric' } as Intl.DateTimeFormatOptions,
      long: { day: 'numeric', month: 'long', year: 'numeric' } as Intl.DateTimeFormatOptions,
      full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' } as Intl.DateTimeFormatOptions
    }[format];

    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  },

  formatTime: (
    date: Date | string | number,
    includeSeconds: boolean = false,
    locale: string = 'en-IN'
  ): string => {
    const dateObj = new Date(date);
    
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      ...(includeSeconds && { second: '2-digit' })
    };

    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  },

  formatDateTime: (
    date: Date | string | number,
    dateFormat: 'short' | 'medium' | 'long' = 'medium',
    includeSeconds: boolean = false,
    locale: string = 'en-IN'
  ): string => {
    const dateObj = new Date(date);
    const dateStr = exports.date.format(dateObj, dateFormat, locale);
    const timeStr = exports.date.formatTime(dateObj, includeSeconds, locale);
    return `${dateStr} at ${timeStr}`;
  },

  relative: (date: Date | string | number): string => {
    const dateObj = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffWeeks < 4) {
      return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    } else if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    } else {
      return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    }
  },

  isToday: (date: Date | string | number): boolean => {
    const dateObj = new Date(date);
    const today = new Date();
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  },

  isYesterday: (date: Date | string | number): boolean => {
    const dateObj = new Date(date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      dateObj.getDate() === yesterday.getDate() &&
      dateObj.getMonth() === yesterday.getMonth() &&
      dateObj.getFullYear() === yesterday.getFullYear()
    );
  },

  addDays: (date: Date | string | number, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  addMonths: (date: Date | string | number, months: number): Date => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }
};

// Number formatting utilities
export const number = {
  format: (
    value: number,
    decimals: number = 0,
    locale: string = 'en-IN'
  ): string => {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  },

  formatCompact: (
    value: number,
    locale: string = 'en-IN'
  ): string => {
    if (value >= 10000000) {
      return `${(value / 10000000).toFixed(1)} Cr`;
    } else if (value >= 100000) {
      return `${(value / 100000).toFixed(1)} L`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} K`;
    }
    return number.format(value, 0, locale);
  },

  percentage: (
    value: number,
    decimals: number = 0,
    locale: string = 'en-IN'
  ): string => {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100);
  },

  ordinal: (value: number): string => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = value % 100;
    return value + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  }
};

// Phone number formatting
export const phone = {
  format: (phoneNumber: string, countryCode: string = '+91'): string => {
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Indian phone number format
    if (countryCode === '+91' && cleaned.length === 10) {
      return `${countryCode} ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    
    // Generic format for other countries
    if (cleaned.length === 10) {
      return `${countryCode} ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    
    return phoneNumber;
  },

  clean: (phoneNumber: string): string => {
    return phoneNumber.replace(/\D/g, '');
  }
};

// String formatting utilities
export const string = {
  truncate: (str: string, maxLength: number, suffix: string = '...'): string => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - suffix.length) + suffix;
  },

  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  titleCase: (str: string): string => {
    return str
      .split(' ')
      .map(word => string.capitalize(word))
      .join(' ');
  },

  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  initials: (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
};