// Blockchain.ts
import { readFile, writeFile } from 'fs/promises'; // Using Node.js fs/promises for file operations
import { Block, createBlock } from './block';

const BLOCKCHAIN_FILE_PATH = './blockchain.json';

export const createBlockchain = async () => {
  const loadLastBlockFromFile = async (): Promise<Block | null> => {
    try {
      const data = await readFile(BLOCKCHAIN_FILE_PATH, 'utf8');
      const parsedBlock = JSON.parse(data);

      // Convert base64 string back to ArrayBuffer during deserialization
      const block: Block = {
        ...parsedBlock,
        data: Buffer.from(parsedBlock.data, 'base64').buffer,
      };

      return block;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log('Blockchain file not found. Creating new chain.');
        return null;
      }
      console.error('Error loading last block from file:', error);
      return null;
    }
  };

  let lastBlock: Block | null = await loadLastBlockFromFile();

  const addBlock = async (data: ArrayBuffer) => {
    const index = lastBlock ? lastBlock.index + 1 : 0;
    const previousHash = lastBlock ? lastBlock.hash : '0';
    const timestamp = Date.now();

    const newBlock = createBlock(index, previousHash, timestamp, data);
    lastBlock = newBlock;

    await saveLastBlockToFile(lastBlock);
  };

  const isValidChain = async () => {
    let currentBlock: Block | null = lastBlock;

    while (currentBlock && currentBlock.index > 0) {
      const previousBlock = await getBlockByIndex(currentBlock.index - 1);

      if (!previousBlock || currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      const recalculatedHash = createBlock(
        currentBlock.index,
        currentBlock.previousHash,
        currentBlock.timestamp,
        currentBlock.data
      ).hash;

      if (currentBlock.hash !== recalculatedHash) {
        return false;
      }

      currentBlock = previousBlock;
    }

    return true;
  };

  const getBlockByIndex = async (
    index: number,
    currentBlock: Block | null = lastBlock
  ): Promise<Block | null> => {
    // Avoid recursive calls by managing a loop instead
    while (currentBlock && currentBlock.index !== index) {
      if (currentBlock.index < index) {
        return null; // Block not found
      }

      // Fetch previous block (assuming sequential fetch or from an archive)
      const previousBlockIndex = currentBlock.index - 1;
      currentBlock = previousBlockIndex >= 0 ? await loadBlockFromChain(previousBlockIndex) : null;
    }

    return currentBlock;
  };

  const loadBlockFromChain = async (index: number): Promise<Block | null> => {
    try {
      const data = await readFile(BLOCKCHAIN_FILE_PATH, 'utf8');
      const chain = JSON.parse(data);

      const blockData = chain.find((block: Block) => block.index === index);
      if (!blockData) {
        return null;
      }

      // Convert base64 string back to ArrayBuffer during deserialization
      const block: Block = {
        ...blockData,
        data: Buffer.from(blockData.data, 'base64').buffer,
      };

      return block;
    } catch (error: any) {
      console.error(`Error loading block ${index} from chain:`, error);
      return null;
    }
  };

  const getChain = async () => {
    const chain: Block[] = [];

    let currentBlock: Block | null = lastBlock;

    while (currentBlock) {
      chain.unshift(currentBlock); // Add to front of array for correct order
      currentBlock = await getBlockByIndex(currentBlock.index - 1);
    }

    return chain;
  };

  const saveLastBlockToFile = async (block: Block) => {
    try {
      const serializedBlock = {
        ...block,
        // Convert ArrayBuffer to base64 string for serialization
        data: Buffer.from(block.data).toString('base64'),
      };
      await writeFile(BLOCKCHAIN_FILE_PATH, JSON.stringify(serializedBlock));
    } catch (error) {
      console.error('Error saving last block to file:', error);
    }
  };

  return {
    addBlock,
    isValidChain,
    getChain,
  };
};
