// src/middleware/uploadMiddleware.ts
import multer from 'multer';
import { Request } from 'express';

// Store the file in memory as a buffer
const storage = multer.memoryStorage();

// Check if the file is an image
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.') as any, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB file size limit
});

export default upload;