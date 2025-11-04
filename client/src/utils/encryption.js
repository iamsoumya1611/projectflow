// Client-side encryption utility using crypto-js
import CryptoJS from 'crypto-js';

// Secret key for encryption/decryption (in production, this should be handled securely)
const SECRET_KEY = process.env.REACT_APP_ENCRYPTION_SECRET || 'projectflow-secret-key-2025';

export const encryptMessage = (message) => {
  try {
    const ciphertext = CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
    return ciphertext;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

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