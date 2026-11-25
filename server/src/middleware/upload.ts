import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config/env';

const uploadDir = path.join(process.cwd(), config.uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = [
    'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/webm',
    'application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'text/plain', 'message/rfc822', 'application/json', 'text/csv',
    'application/octet-stream',
  ];
  if (allowed.includes(file.mimetype) || file.originalname.match(/\.(eml|txt|csv|json|mp3|wav|pdf|jpg|jpeg|png)$/i)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not supported: ${file.mimetype}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});
