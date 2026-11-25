"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("../config/env");
const uploadDir = path_1.default.join(process.cwd(), env_1.config.uploadDir);
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
    },
});
const fileFilter = (req, file, cb) => {
    const allowed = [
        'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/webm',
        'application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'text/plain', 'message/rfc822', 'application/json', 'text/csv',
        'application/octet-stream',
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(eml|txt|csv|json|mp3|wav|pdf|jpg|jpeg|png)$/i)) {
        cb(null, true);
    }
    else {
        cb(new Error(`File type not supported: ${file.mimetype}`));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 },
});
//# sourceMappingURL=upload.js.map