"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvidence = exports.getEvidenceById = exports.createEvidence = exports.getEvidence = void 0;
const Evidence_1 = require("../models/Evidence");
const Case_1 = require("../models/Case");
const errorHandler_1 = require("../middleware/errorHandler");
const fs_1 = __importDefault(require("fs"));
const getEvidence = async (req, res, next) => {
    try {
        const { caseId, type } = req.query;
        const filter = {};
        if (caseId)
            filter.caseId = caseId;
        if (type)
            filter.type = type;
        const evidence = await Evidence_1.Evidence.find(filter).populate('uploadedBy', 'name').sort({ createdAt: -1 });
        res.json({ success: true, data: evidence });
    }
    catch (err) {
        next(err);
    }
};
exports.getEvidence = getEvidence;
const createEvidence = async (req, res, next) => {
    try {
        const { caseId, title, description, type, content, tags } = req.body;
        const file = req.file;
        if (!caseId || !title || !type)
            return next((0, errorHandler_1.createError)('caseId, title and type are required', 400));
        const ev = await Evidence_1.Evidence.create({
            caseId, title, description, type, content, tags: tags || [],
            ...(file ? { fileName: file.originalname, filePath: file.path, fileSize: file.size, mimeType: file.mimetype } : {}),
            uploadedBy: req.user.id,
        });
        await Case_1.Case.findByIdAndUpdate(caseId, { $inc: { evidenceCount: 1 }, lastActivityAt: new Date() });
        res.status(201).json({ success: true, data: ev });
    }
    catch (err) {
        next(err);
    }
};
exports.createEvidence = createEvidence;
const getEvidenceById = async (req, res, next) => {
    try {
        const ev = await Evidence_1.Evidence.findById(req.params.id).populate('uploadedBy', 'name email');
        if (!ev)
            return next((0, errorHandler_1.createError)('Evidence not found', 404));
        res.json({ success: true, data: ev });
    }
    catch (err) {
        next(err);
    }
};
exports.getEvidenceById = getEvidenceById;
const deleteEvidence = async (req, res, next) => {
    try {
        const ev = await Evidence_1.Evidence.findById(req.params.id);
        if (!ev)
            return next((0, errorHandler_1.createError)('Evidence not found', 404));
        if (ev.filePath) {
            try {
                fs_1.default.unlinkSync(ev.filePath);
            }
            catch { }
        }
        await ev.deleteOne();
        await Case_1.Case.findByIdAndUpdate(ev.caseId, { $inc: { evidenceCount: -1 } });
        res.json({ success: true, message: 'Evidence deleted' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteEvidence = deleteEvidence;
//# sourceMappingURL=evidence.controller.js.map