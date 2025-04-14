import { SignJWT, jwtVerify } from 'jose';
import { createSecretKey } from 'crypto';

/**
 * Result of JWT verification
 */
export interface JWTVerificationResult {
  valid: boolean;
  pubkey?: string;
  claims?: Record<string, any>;
  error?: string;
}

/**
 * Issues a JWT token for a given pubkey
 * 
 * @param pubkey The Nostr public key to issue a token for
 * @param customClaims Optional additional claims to include in the token
 * @returns A JWT token string
 */
export async function issueJWT(
  pubkey: string,
  customClaims?: Record<string, any>
): Promise<string> {
  const jwtSecret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  
  const secretKey = createSecretKey(Buffer.from(jwtSecret, 'utf-8'));
  
  // Calculate expiration time based on expiresIn
  const expirationTime = parseExpirationTime(expiresIn);
  
  // Create and sign the JWT
  const token = await new SignJWT({
    sub: pubkey,
    ...customClaims
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(secretKey);
  
  return token;
}

/**
 * Verifies a JWT token and extracts the pubkey and claims
 * 
 * @param token The JWT token to verify
 * @returns A verification result with pubkey and claims if valid
 */
export async function verifyJWT(token: string): Promise<JWTVerificationResult> {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    
    const secretKey = createSecretKey(Buffer.from(jwtSecret, 'utf-8'));
    
    const { payload } = await jwtVerify(token, secretKey);
    
    if (!payload.sub) {
      return {
        valid: false,
        error: 'Token missing subject (pubkey)'
      };
    }
    
    return {
      valid: true,
      pubkey: payload.sub,
      claims: { ...payload }
    };
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'JWTExpired') {
        return {
          valid: false,
          error: 'Token expired'
        };
      }
      
      return {
        valid: false,
        error: `Invalid token: ${error.message}`
      };
    }
    
    return {
      valid: false,
      error: 'Invalid token'
    };
  }
}

/**
 * Parses an expiration time string (e.g., '1h', '7d') into a timestamp
 * 
 * @param expiresIn Expiration time string
 * @returns Timestamp or string representation for JWT
 */
function parseExpirationTime(expiresIn: string): number | string {
  const now = Math.floor(Date.now() / 1000);
  
  // Parse the expiration time
  const match = expiresIn.match(/^(\d+)([smhdw])$/);
  if (!match) {
    return expiresIn; // Return as is if not in expected format
  }
  
  const [, valueStr, unit] = match;
  const value = parseInt(valueStr, 10);
  
  // Calculate seconds based on unit
  let seconds = 0;
  switch (unit) {
    case 's': // seconds
      seconds = value;
      break;
    case 'm': // minutes
      seconds = value * 60;
      break;
    case 'h': // hours
      seconds = value * 60 * 60;
      break;
    case 'd': // days
      seconds = value * 24 * 60 * 60;
      break;
    case 'w': // weeks
      seconds = value * 7 * 24 * 60 * 60;
      break;
    default:
      return expiresIn; // Return as is for unknown units
  }
  
  return now + seconds;
}