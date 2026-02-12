import crypto from "crypto";
import { CONFIG } from "../config/index.js";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  let key = CONFIG.ENCRYPTION_KEY;
  if (key.length < KEY_LENGTH) {
    key = key.padEnd(KEY_LENGTH, "0");
  }
  return Buffer.from(key.substring(0, KEY_LENGTH), "utf-8");
}

export function encrypt(plaintext: string): string {
  try {
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, "utf-8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    const encryptedData = iv.toString("hex") + authTag.toString("hex") + encrypted;
    return Buffer.from(encryptedData, "hex").toString("base64");
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export function decrypt(encryptedBase64: string): string {
  try {
    const key = getKey();
    const encryptedData = Buffer.from(encryptedBase64, "base64").toString("hex");

    const iv = Buffer.from(encryptedData.substring(0, IV_LENGTH * 2), "hex");
    const authTag = Buffer.from(encryptedData.substring(IV_LENGTH * 2, IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2), "hex");
    const encrypted = encryptedData.substring(IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf-8");
    decrypted += decipher.final("utf-8");

    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export function isEncrypted(data: string): boolean {
  if (!data) return false;
  try {
    Buffer.from(data, "base64");
    return true;
  } catch {
    return false;
  }
}
