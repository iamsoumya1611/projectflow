const CryptoJS = require('crypto-js');

// Secret key for encryption/decryption (in production, use environment variables)
const SECRET_KEY = process.env.ENCRYPTION_SECRET || 'projectflow-secret-key-2025';

const encryptMessage = (message) => {
  try {
    const ciphertext = CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
    return ciphertext;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

const decryptMessage = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

module.exports = {
  encryptMessage,
  decryptMessage
};