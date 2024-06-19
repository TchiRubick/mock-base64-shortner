import { createBlockchain } from './blockchain';
import encryptImage from './encryptImage';

import { readdir } from 'fs/promises';
import { join, resolve } from 'path';

const IMAGES_FOLDER_PATH = resolve('./src/images/');

// const iterateImagesInFolder = async () => {
//   try {
//     const files = await readdir(IMAGES_FOLDER_PATH);

//     for (const file of files) {
//       const filePath = join(IMAGES_FOLDER_PATH, file);
//       const fileStats = await stat(filePath);

//       if (fileStats.isFile()) {
//         // Process only files (skip directories)
//         console.log(`Found image: ${filePath}`);
//         // Here you can process each image file (e.g., read, manipulate, etc.)
//       }
//     }
//   } catch (error) {
//     console.error('Error iterating through images:', error);
//   }
// };

console.log(IMAGES_FOLDER_PATH);
const main = async () => {
  const files = await readdir(IMAGES_FOLDER_PATH);

  console.log(files);
  files.forEach(async (file) => {
    const filePath = join(IMAGES_FOLDER_PATH, file);
    try {
      const encryptedImage = await encryptImage(filePath);
      // const val = new Uint8Array(encryptedImage);
      // console.log('Encrypted Image ArrayBuffer:', val.length);
      const blockchain = await createBlockchain();
      await blockchain.addBlock(encryptedImage);

      console.log('Blockchain valid:', await blockchain.isValidChain());
      console.log('Blockchain:', await blockchain.getChain());
    } catch (error) {
      console.error('Error:', error);
    }
  });
};

main();
