import CryptoJS from 'crypto-js';

// Secret key for encryption/decryption (should match server)
const SECRET_KEY = process.env.REACT_APP_ENCRYPTION_SECRET || 'projectflow-secret-key-2025';

/**
 * Encrypt a message using AES encryption
 * @param {string} message - The message to encrypt
 * @returns {string|null} The encrypted message or null if encryption fails
 */
export const encryptMessage = (message) => {
  try {
    const ciphertext = CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
    return ciphertext;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

/**
 * Decrypt a message using AES decryption
 * @param {string} ciphertext - The encrypted message
 * @returns {string|null} The decrypted message or null if decryption fails
 */
export const decryptMessage = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

export default {
  encryptMessage,
  decryptMessage
};