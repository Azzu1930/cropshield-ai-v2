// Client-side cryptographic password encryption using standard Web Crypto API (SHA-256 + Salt)

export function generateSalt(length = 16): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for non-browser or older environments
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const effectiveSalt = salt || generateSalt();
  const encoder = new TextEncoder();
  const data = encoder.encode(effectiveSalt + password);

  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return { hash, salt: effectiveSalt };
  }

  // Fallback pseudo-hash if SubtleCrypto unavailable in certain sandbox environments
  let simpleHash = 0;
  const combined = effectiveSalt + password;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    simpleHash = (simpleHash << 5) - simpleHash + char;
    simpleHash |= 0;
  }
  return { hash: Math.abs(simpleHash).toString(16).padStart(16, '0'), salt: effectiveSalt };
}

export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  if (!storedHash || !salt) return false;
  const { hash } = await hashPassword(password, salt);
  return hash === storedHash;
}
