import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Function to check if an image is valid
async function validateImage(imagePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return {
        valid: false,
        error: 'File does not exist',
        path: imagePath
      };
    }

    // Check file size
    const stats = fs.statSync(imagePath);
    if (stats.size === 0) {
      return {
        valid: false,
        error: 'File is empty',
        path: imagePath,
        size: stats.size
      };
    }

    // Try to process with Sharp to validate image
    const metadata = await sharp(imagePath).metadata();

    return {
      valid: true,
      path: imagePath,
      size: stats.size,
      format: metadata.format,
      width: metadata.width,
      height: metadata.height
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      path: imagePath
    };
  }
}

// Main function to check all images in the uploads directory
async function checkAllImages() {
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    console.log(`Found ${imageFiles.length} image files to validate`);

    const results = {
      valid: [],
      invalid: []
    };

    for (const file of imageFiles) {
      const imagePath = path.join(UPLOADS_DIR, file);
      const result = await validateImage(imagePath);

      if (result.valid) {
        results.valid.push(result);
      } else {
        results.invalid.push(result);
      }
    }

    console.log('\n===== VALIDATION RESULTS =====');
    console.log(`Total images: ${imageFiles.length}`);
    console.log(`Valid images: ${results.valid.length}`);
    console.log(`Invalid images: ${results.invalid.length}`);

    if (results.invalid.length > 0) {
      console.log('\n===== INVALID IMAGES =====');
      results.invalid.forEach((img) => {
        console.log(`- ${path.basename(img.path)}: ${img.error}`);
      });
    }

    // Check specifically for the problematic image
    const specificImage = '738123000000_281553601_1200625580678473_5285464895107595026_n.jpg';
    const specificImagePath = path.join(UPLOADS_DIR, specificImage);

    console.log('\n===== CHECKING SPECIFIC IMAGE =====');
    console.log(`Image: ${specificImage}`);

    const specificResult = await validateImage(specificImagePath);
    console.log(specificResult);

    return results;
  } catch (error) {
    console.error('Error checking images:', error);
    return {
      valid: [],
      invalid: [
        {
          valid: false,
          error: error.message,
          path: 'unknown'
        }
      ]
    };
  }
}

// Run the function
checkAllImages();
