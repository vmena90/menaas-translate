/**
 * Secure AES-GCM Encryption Module using Web Crypto API
 */

const KEY_STORAGE_NAME = 'voiceclass_db_key';

// Obtain or generate a 256-bit AES-GCM key
export async function getEncryptionKey() {
  let jwk = localStorage.getItem(KEY_STORAGE_NAME);
  
  if (!jwk) {
    const key = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    const exportedJwk = await window.crypto.subtle.exportKey("jwk", key);
    localStorage.setItem(KEY_STORAGE_NAME, JSON.stringify(exportedJwk));
    return key;
  }
  
  return await window.crypto.subtle.importKey(
    "jwk",
    JSON.parse(jwk),
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
}

// Helper to convert string to ArrayBuffer
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export async function encryptText(text) {
  if (!text) return null;
  const key = await getEncryptionKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    textEncoder.encode(text)
  );

  // Return base64 for easy JSON storage
  const encryptedBytes = new Uint8Array(encrypted);
  const combined = new Uint8Array(iv.length + encryptedBytes.length);
  combined.set(iv);
  combined.set(encryptedBytes, iv.length);
  
  // Convert to base64
  let binary = '';
  combined.forEach((b) => binary += String.fromCharCode(b));
  return btoa(binary);
}

export async function decryptText(base64String) {
  if (!base64String) return null;
  
  try {
    const binary = atob(base64String);
    const combined = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      combined[i] = binary.charCodeAt(i);
    }
    
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const key = await getEncryptionKey();
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      data
    );
    
    return textDecoder.decode(decrypted);
  } catch (e) {
    console.warn("Failed to decrypt text, returning raw (possibly legacy unencrypted data)");
    return base64String;
  }
}

export async function encryptBlob(blob) {
  if (!blob) return null;
  const arrayBuffer = await blob.arrayBuffer();
  const key = await getEncryptionKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    arrayBuffer
  );
  
  return {
    encryptedBlob: new Blob([encrypted], { type: blob.type }),
    iv: Array.from(iv)
  };
}

export async function decryptBlob(encryptedBlob, ivArray) {
  if (!encryptedBlob || !ivArray) return encryptedBlob; // Legacy unencrypted
  
  try {
    const arrayBuffer = await encryptedBlob.arrayBuffer();
    const key = await getEncryptionKey();
    const iv = new Uint8Array(ivArray);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      arrayBuffer
    );
    
    return new Blob([decrypted], { type: encryptedBlob.type });
  } catch (e) {
    console.warn("Failed to decrypt blob, returning raw");
    return encryptedBlob;
  }
}
