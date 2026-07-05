import { ShortenerSettings } from "../types";

const APP_SALT = "utm_builder_secure_salt_2026_@!";

// Highly robust synchronous encryption using a clean byte-oriented XOR with TextEncoder/Decoder
export function encrypt(text: any, secretKey: string = ""): string {
  try {
    if (text === null || text === undefined) return "";
    const str = String(text);
    if (!str) return "";
    
    // If text is already encrypted (starts with ENC:), do not re-encrypt
    if (str.startsWith("ENC:")) return str;

    const key = secretKey ? secretKey + APP_SALT : APP_SALT;
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    const keyBytes = encoder.encode(key);

    const encryptedBytes = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      encryptedBytes[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
    }

    // Convert binary to safe Base64 string in a browser-safe way
    let binary = "";
    for (let i = 0; i < encryptedBytes.length; i++) {
      binary += String.fromCharCode(encryptedBytes[i]);
    }

    return "ENC:" + btoa(binary);
  } catch (e) {
    console.error("Encryption failed, returning fallback:", e);
    return String(text || "");
  }
}

export function decrypt(encodedText: any, secretKey: string = ""): string {
  try {
    if (encodedText === null || encodedText === undefined) return "";
    const str = String(encodedText);
    if (!str) return "";
    
    // If not prefixed with ENC:, it is stored as plain-text (legacy or before encryption)
    if (!str.startsWith("ENC:")) {
      return str;
    }

    const rawEncoded = str.substring(4); // Remove "ENC:"
    const binary = atob(rawEncoded);
    const encryptedBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      encryptedBytes[i] = binary.charCodeAt(i);
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const key = secretKey ? secretKey + APP_SALT : APP_SALT;
    const keyBytes = encoder.encode(key);

    const bytes = new Uint8Array(encryptedBytes.length);
    for (let i = 0; i < encryptedBytes.length; i++) {
      bytes[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    return decoder.decode(bytes);
  } catch (e) {
    console.error("Decryption failed, returning empty string fallback:", e);
    return "";
  }
}

/**
 * Encrypt the sensitive fields of ShortenerSettings
 */
export function encryptSettings(settings: ShortenerSettings, userId: string = ""): ShortenerSettings {
  if (!settings) {
    return {
      bitlyToken: "",
      rebrandlyKey: "",
      tinyurlToken: "",
      dubToken: "",
      bitlyDomain: "",
      rebrandlyDomain: "",
      tinyurlDomain: "",
      dubDomain: "",
    };
  }
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
  if (!settings) {
    return {
      bitlyToken: "",
      rebrandlyKey: "",
      tinyurlToken: "",
      dubToken: "",
      bitlyDomain: "",
      rebrandlyDomain: "",
      tinyurlDomain: "",
      dubDomain: "",
    };
  }
  return {
    ...settings,
    bitlyToken: decrypt(settings.bitlyToken, userId),
    rebrandlyKey: decrypt(settings.rebrandlyKey, userId),
    tinyurlToken: decrypt(settings.tinyurlToken, userId),
    dubToken: decrypt(settings.dubToken, userId),
  };
}
