// encryptImage.ts

import crypto from 'crypto';
import { promises as fs } from 'fs';

const readImageAsArrayBuffer = async (filePath: string): Promise<ArrayBuffer> => {
  const fileBuffer = await fs.readFile(filePath);
  return fileBuffer.buffer.slice(
    fileBuffer.byteOffset,
    fileBuffer.byteOffset + fileBuffer.byteLength
  );
};

const generateKey = async (): Promise<CryptoKey> => {
  return crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
};

const encryptArrayBuffer = async (key: CryptoKey, data: ArrayBuffer): Promise<ArrayBuffer> => {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data
  );
  const ivAndEncryptedData = new Uint8Array(iv.byteLength + encrypted.byteLength);
  ivAndEncryptedData.set(iv, 0);
  ivAndEncryptedData.set(new Uint8Array(encrypted), iv.byteLength);
  return ivAndEncryptedData.buffer;
};

const encryptImage = async (filePath: string): Promise<ArrayBuffer> => {
  const imageArrayBuffer = await readImageAsArrayBuffer(filePath);
  const key = await generateKey();
  return await encryptArrayBuffer(key, imageArrayBuffer);
};

export default encryptImage;
