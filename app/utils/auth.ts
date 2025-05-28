import crypto from 'crypto';

// JWT secret key (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';
const OTP_EXPIRES_IN = 10 * 60 * 1000; // 10 minutes

interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
}

interface DecodedToken extends JWTPayload {
  iat: number;
  exp: number;
}

// Simple JWT implementation (for production, consider using jsonwebtoken library)
export const jwt = {
  sign: (payload: JWTPayload): string => {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = now + (24 * 60 * 60); // 24 hours

    const fullPayload = {
      ...payload,
      iat: now,
      exp: expiresIn
    };

    const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
    const base64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${base64Header}.${base64Payload}`)
      .digest('base64url');

    return `${base64Header}.${base64Payload}.${signature}`;
  },

  verify: (token: string): DecodedToken | null => {
    try {
      const [header, payload, signature] = token.split('.');
      
      const expectedSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${header}.${payload}`)
        .digest('base64url');

      if (signature !== expectedSignature) {
        return null;
      }

      const decodedPayload = JSON.parse(
        Buffer.from(payload, 'base64url').toString()
      ) as DecodedToken;

      const now = Math.floor(Date.now() / 1000);
      if (decodedPayload.exp < now) {
        return null;
      }

      return decodedPayload;
    } catch {
      return null;
    }
  },

  decode: (token: string): DecodedToken | null => {
    try {
      const [, payload] = token.split('.');
      return JSON.parse(Buffer.from(payload, 'base64url').toString()) as DecodedToken;
    } catch {
      return null;
    }
  }
};

// OTP generation and verification
export const otp = {
  generate: (length: number = 6): string => {
    const digits = '0123456789';
    let code = '';
    
    for (let i = 0; i < length; i++) {
      code += digits[Math.floor(Math.random() * digits.length)];
    }
    
    return code;
  },

  hash: (code: string): string => {
    return crypto
      .createHash('sha256')
      .update(code + JWT_SECRET)
      .digest('hex');
  },

  verify: (code: string, hashedCode: string): boolean => {
    const hashedInput = crypto
      .createHash('sha256')
      .update(code + JWT_SECRET)
      .digest('hex');
    
    return hashedInput === hashedCode;
  },

  createWithExpiry: (length: number = 6) => {
    const code = otp.generate(length);
    const hashedCode = otp.hash(code);
    const expiresAt = new Date(Date.now() + OTP_EXPIRES_IN);
    
    return {
      code,
      hashedCode,
      expiresAt
    };
  }
};

// Password hashing utilities
export const password = {
  hash: async (password: string): Promise<string> => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex');
    
    return `${salt}:${hash}`;
  },

  verify: async (password: string, hashedPassword: string): Promise<boolean> => {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex');
    
    return hash === verifyHash;
  }
};

// Session token generation
export const generateSessionToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// CSRF token generation
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};