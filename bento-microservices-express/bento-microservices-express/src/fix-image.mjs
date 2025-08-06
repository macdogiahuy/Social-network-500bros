import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Function to fix a corrupt image
async function fixImage(imagePath) {
  try {
    console.log(`Attempting to fix image: ${imagePath}`);

    // Create a backup of the original file
    const backupPath = `${imagePath}.backup`;
    fs.copyFileSync(imagePath, backupPath);
    console.log(`Created backup at: ${backupPath}`);

    // Process the image with Sharp to fix corruption
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    // Resize slightly to ensure proper encoding
    await image
      .resize({
        width: metadata.width,
        height: metadata.height,
        fit: 'fill'
      })
      .jpeg({ quality: 90 })
      .toFile(`${imagePath}.fixed`);

    // Replace the original file with the fixed version
    fs.unlinkSync(imagePath);
    fs.renameSync(`${imagePath}.fixed`, imagePath);

    console.log(`Successfully fixed image: ${imagePath}`);
    return true;
  } catch (error) {
    console.error(`Error fixing image ${imagePath}:`, error);
    return false;
  }
}

// Fix the problematic image
const specificImage = '738123000000_281553601_1200625580678473_5285464895107595026_n.jpg';
const specificImagePath = path.join(UPLOADS_DIR, specificImage);

console.log(`Fixing specific image: ${specificImage}`);
fixImage(specificImagePath)
  .then((success) => {
    if (success) {
      console.log('Image fixed successfully!');
    } else {
      console.log('Failed to fix image.');
    }
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
  });
