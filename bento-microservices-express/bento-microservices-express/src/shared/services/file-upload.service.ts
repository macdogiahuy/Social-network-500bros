import crypto from 'crypto';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Allowed file types with proper type definition
const ALLOWED_FILE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/plain': '.txt',
  'application/zip': '.zip',
  'application/x-rar-compressed': '.rar'
} as const;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomUUID();
    const ext = ALLOWED_FILE_TYPES[file.mimetype] || path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file type is allowed
  if (file.mimetype in ALLOWED_FILE_TYPES) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Allowed types: ' + Object.keys(ALLOWED_FILE_TYPES).join(', ')));
  }
};

const SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB for images
  document: 10 * 1024 * 1024, // 10MB for documents
  archive: 50 * 1024 * 1024 // 50MB for archives
} as const;

function getFileSizeLimit(mimetype: string): number {
  if (mimetype.startsWith('image/')) return SIZE_LIMITS.image;
  if (mimetype.includes('zip') || mimetype.includes('rar')) return SIZE_LIMITS.archive;
  return SIZE_LIMITS.document;
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: SIZE_LIMITS.archive // Maximum overall limit
  }
});

// Helper function to get file size limit for client
export function getMaxFileSize(fileType: string): number {
  return getFileSizeLimit(fileType);
}
