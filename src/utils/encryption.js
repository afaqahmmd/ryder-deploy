import CryptoJS from "crypto-js";
import { Buffer } from "buffer";

// Get encryption key from environment variables
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || "django-xjbdv7n+qvdk=#og*-p8rslel%k57_mk-ryder-partner-cortech-social-799125848091";

/**
 * Derives key and IV from password and salt using MD5 (OpenSSL compatible)
 * @param {string} password - The password/key to derive from
 * @param {Array} salt - Salt array
 * @param {number} keySize - Key size in bytes (default: 32)
 * @param {number} ivSize - IV size in bytes (default: 16)
 * @returns {Object} Object containing key and iv as WordArrays
 */
function deriveKeyAndIV(password, salt, keySize = 32, ivSize = 16) {
  const totalLength = keySize + ivSize;
  let derived = Buffer.alloc(0);
  let prev = Buffer.alloc(0);
  
  while (derived.length < totalLength) {
    const hash = CryptoJS.algo.MD5.create();
    hash.update(CryptoJS.lib.WordArray.create(prev));
    hash.update(CryptoJS.enc.Utf8.parse(password));
    hash.update(CryptoJS.lib.WordArray.create(salt));
    const digest = hash.finalize();
    const digestBytes = Buffer.from(digest.toString(CryptoJS.enc.Hex), 'hex');
    derived = Buffer.concat([derived, digestBytes]);
    prev = digestBytes;
  }
  
  const key = derived.slice(0, keySize);
  const iv = derived.slice(keySize, keySize + ivSize);
  
  return {
    key: CryptoJS.lib.WordArray.create(key),
    iv: CryptoJS.lib.WordArray.create(iv)
  };
}

/**
 * Encrypts data using OpenSSL-style AES encryption
 * @param {Object} data - Data object to encrypt
 * @param {string} password - Password/key for encryption (optional, uses env key if not provided)
 * @returns {string} Base64 encoded encrypted string
 */
export function encryptData(data, password = ENCRYPTION_KEY) {
  try {
    // Generate random salt
    const salt = CryptoJS.lib.WordArray.random(8);
    
    // Derive key and IV
    const { key, iv } = deriveKeyAndIV(password, salt.words);
    
    // Encrypt data
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // Create OpenSSL format: "Salted__" + salt + ciphertext
    const saltedPrefix = CryptoJS.enc.Utf8.parse("Salted__");
    const combined = saltedPrefix.concat(salt).concat(encrypted.ciphertext);
    
    return CryptoJS.enc.Base64.stringify(combined);
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypts OpenSSL-style AES encrypted data
 * @param {string} encryptedData - Base64 encoded encrypted string
 * @param {string} password - Password/key for decryption (optional, uses env key if not provided)
 * @returns {Object} Decrypted data object
 */
export function decryptData(encryptedData, password = ENCRYPTION_KEY) {
  try {
    // Decode base64
    const encrypted = CryptoJS.enc.Base64.parse(encryptedData);
    
    // Extract salt (skip "Salted__" prefix, take next 8 bytes)
    const salt = CryptoJS.lib.WordArray.create(encrypted.words.slice(2, 4));
    
    // Extract ciphertext (skip "Salted__" + salt)
    const ciphertext = CryptoJS.lib.WordArray.create(encrypted.words.slice(4));
    
    // Derive key and IV
    const { key, iv } = deriveKeyAndIV(password, salt.words);
    
    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext },
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    
    // Convert to string and parse JSON
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Gets the current encryption key being used
 * @returns {string} The encryption key
 */
export function getEncryptionKey() {
  return ENCRYPTION_KEY;
}

/**
 * Checks if encryption key is set from environment
 * @returns {boolean} True if using environment key, false if using fallback
 */
export function isUsingEnvKey() {
  return !!import.meta.env.VITE_ENCRYPTION_KEY;
} 