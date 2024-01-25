import '../../shim.js';
import _crypto from 'crypto';

// In mobile use the polyfill
// import 'react-native-webview-crypto' wherever you want to use .subtle()
window.crypto = window.crypto || _crypto;

// Using PBKDF2 for key derivation
export async function deriveKey(password, salt = new Uint8Array([1])) {
  const keyLength = 256; // Choose the desired key length (in bits)

  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  const key = await window.crypto.subtle.importKey(
    'raw',
    passwordData,
    {name: 'PBKDF2'},
    false,
    ['deriveBits', 'deriveKey'],
  );

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000, // Adjust the number of iterations as needed for your security requirements
      hash: 'SHA-256',
    },
    key,
    {name: 'AES-GCM', length: keyLength},
    true,
    ['encrypt', 'decrypt'],
  );

  return derivedKey;
}

export async function encryptText(key: CryptoKey, text, test = false) {
  const encoder = new TextEncoder();
  const byteArr = encoder.encode(text);
  const iv = test
    ? new Uint8Array([165, 156, 16, 86, 74, 65, 157, 255, 140, 103, 173, 12])
    : window.crypto.getRandomValues(new Uint8Array(12)); // Generate a random 12-byte IV

  const cipherText = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    byteArr,
  );

  // Combine IV and encrypted data into a single array
  const cipherAsByteArr = new Uint8Array(cipherText);
  const combined = new Uint8Array(iv.length + cipherAsByteArr.length);
  combined.set(iv);
  combined.set(cipherAsByteArr, iv.length);

  // Convert the result to a hexadecimal string
  const result = _byteToHex(combined);

  return result;
}

function _byteToHex(byteArr: Uint8Array) {
  const result = Array.from(byteArr)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');

  return result;
}

export async function decryptText(key: CryptoKey, ciphertext) {
  const combined = new Uint8Array(
    ciphertext.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)),
  );

  // Extract the IV from the combined array (first 16 bytes)
  const iv = combined.slice(0, 12);

  // Extract the encrypted data (remaining bytes after the IV)
  const encryptedData = combined.slice(12);

  try {
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encryptedData,
    );

    const decoder = new TextDecoder();
    const plaintext = decoder.decode(decryptedData);
    return plaintext;
  } catch (error) {
    console.error('Error decrypting ciphertext:', error);
    throw error;
  }
}
