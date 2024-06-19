// Block.ts
import { createHash } from 'crypto';

export interface Block {
  index: number;
  previousHash: string;
  timestamp: number;
  data: ArrayBuffer;
  hash: string;
}

export const createBlock = (
  index: number,
  previousHash: string,
  timestamp: number,
  data: ArrayBuffer
): Block => {
  const calculateHash = (
    index: number,
    previousHash: string,
    timestamp: number,
    data: ArrayBuffer
  ): string => {
    const hash = createHash('sha256');
    hash.update(
      index.toString() + previousHash + timestamp.toString() + Buffer.from(data).toString('hex')
    );
    return hash.digest('hex');
  };

  const hash = calculateHash(index, previousHash, timestamp, data);

  return {
    index,
    previousHash,
    timestamp,
    data,
    hash,
  };
};
