import multer from 'multer';

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
  'application/x-rar-compressed': '.rar',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/ogg': '.ogg',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/ogg': '.ogg'
} as const;

const storage = multer.memoryStorage();

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file type is allowed
  if (file.mimetype in ALLOWED_FILE_TYPES) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Allowed types: ' + Object.keys(ALLOWED_FILE_TYPES).join(', ')));
  }
};

const SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB for images
  audio: 20 * 1024 * 1024, // 20MB for audio
  video: 100 * 1024 * 1024, // 100MB for video
  document: 20 * 1024 * 1024, // 20MB for documents
  archive: 100 * 1024 * 1024 // 100MB for archives
} as const;

function getFileSizeLimit(mimetype: string): number {
  if (mimetype.startsWith('image/')) return SIZE_LIMITS.image;
  if (mimetype.startsWith('audio/')) return SIZE_LIMITS.audio;
  if (mimetype.startsWith('video/')) return SIZE_LIMITS.video;
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

export const uploadImageOnly = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }

    cb(new Error('Only images are allowed'));
  },
  limits: {
    fileSize: SIZE_LIMITS.image
  }
});

// Helper function to get file size limit for client
export function getMaxFileSize(fileType: string): number {
  return getFileSizeLimit(fileType);
}
