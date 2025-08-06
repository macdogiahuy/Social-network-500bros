import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Helper function to log errors
const logError = (message) => {
  console.error(`[${new Date().toISOString()}] ${message}`);
};

// Middleware to check and log image requests
app.use('/uploads', (req, res, next) => {
  const imagePath = path.join(__dirname, '../uploads', req.path);

  console.log(`Request for image: ${req.path}`);
  console.log(`Full path: ${imagePath}`);

  // Check if file exists
  if (fs.existsSync(imagePath)) {
    console.log(`File exists: ${imagePath}`);
    const stats = fs.statSync(imagePath);
    console.log(`File size: ${stats.size} bytes`);
  } else {
    logError(`File does not exist: ${imagePath}`);
  }

  next();
});

// Serve static files with detailed error handling
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res, filePath) => {
      // Set proper MIME type
      res.setHeader('Content-Type', `image/${path.extname(filePath).substring(1)}`);
      // Allow cross-origin requests
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
    fallthrough: false // Return 404 for missing files
  })
);

// Error handler for static files
app.use('/uploads', (err, req, res, next) => {
  logError(`Error serving image ${req.path}: ${err.message}`);
  res.status(404).send(`Image not found: ${req.path}`);
});

// Global error handler
app.use((err, req, res, next) => {
  logError(`Unhandled error: ${err.message}`);
  res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
  console.log(`Image debug server running at http://localhost:${port}`);
});
