import { ShortenerSettings } from "../types";

const APP_SALT = "utm_builder_secure_salt_2026_@!";

// Simple but effective synchronous encryption using a key-based cipher
export function encrypt(text: string, secretKey: string = ""): string {
  if (!text) return "";
  // If text is already encrypted (starts with ENC:), do not re-encrypt
  if (text.startsWith("ENC:")) return text;

  const key = secretKey ? secretKey + APP_SALT : APP_SALT;
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    const encryptedChar = charCode ^ keyChar;
    result += String.fromCharCode(encryptedChar);
  }
  // Convert to Base64 to make it safe for JSON storage and prefix with ENC:
  try {
    return "ENC:" + btoa(unescape(encodeURIComponent(result)));
  } catch (e) {
    console.error("Base64 encryption encoding failed:", e);
    return text;
  }
}

export function decrypt(encodedText: string, secretKey: string = ""): string {
  if (!encodedText) return "";
  if (!encodedText.startsWith("ENC:")) {
    // If not prefixed with ENC:, it is stored as plain-text (e.g. legacy/before encryption)
    return encodedText;
  }

  const rawEncoded = encodedText.substring(4); // Remove "ENC:"
  try {
    const key = secretKey ? secretKey + APP_SALT : APP_SALT;
    const text = decodeURIComponent(escape(atob(rawEncoded)));
    let result = "";
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      const decryptedChar = charCode ^ keyChar;
      result += String.fromCharCode(decryptedChar);
    }
    return result;
  } catch (e) {
    console.error("Decryption failed:", e);
    return ""; // Return empty string if decryption fails
  }
}

/**
 * Encrypt the sensitive fields of ShortenerSettings
 */
export function encryptSettings(settings: ShortenerSettings, userId: string = ""): ShortenerSettings {
  return {
    ...settings,
    bitlyToken: encrypt(settings.bitlyToken, userId),
    rebrandlyKey: encrypt(settings.rebrandlyKey, userId),
    tinyurlToken: encrypt(settings.tinyurlToken, userId),
    dubToken: encrypt(settings.dubToken, userId),
  };
}

/**
 * Decrypt the sensitive fields of ShortenerSettings
 */
export function decryptSettings(settings: ShortenerSettings, userId: string = ""): ShortenerSettings {
  return {
    ...settings,
    bitlyToken: decrypt(settings.bitlyToken, userId),
    rebrandlyKey: decrypt(settings.rebrandlyKey, userId),
    tinyurlToken: decrypt(settings.tinyurlToken, userId),
    dubToken: decrypt(settings.dubToken, userId),
  };
}
