"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promoteComplaintToCase = exports.updateComplaintStatus = exports.getComplaints = exports.getComplaintByTrackingId = exports.createComplaint = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Complaint_1 = require("../models/Complaint");
const TimelineEvent_1 = require("../models/TimelineEvent");
const Notification_1 = require("../models/Notification");
const Case_1 = require("../models/Case");
const errorHandler_1 = require("../middleware/errorHandler");
const uuid_1 = require("uuid");
// Helper to generate unique complaint ID e.g. CMP-20240909-ABCD1
const generateComplaintId = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = (0, uuid_1.v4)().slice(0, 5).toUpperCase();
    return `CMP-${dateStr}-${randomSuffix}`;
};
// Create Complaint (Citizen or authenticated user or anonymous)
const createComplaint = async (req, res, next) => {
    try {
        const { category, title, description, incidentDateTime, complainant, suspectInfo, location, relatedPersons, relatedLocations, relatedVehiclesDevices, evidenceFiles, supportingDocuments, additionalNotes, } = req.body;
        const compName = complainant?.name || complainant?.fullName;
        const compPhone = complainant?.phone || complainant?.mobile;
        const locAddress = location?.fullAddress || location?.address || location?.street || (location?.city ? `${location.city}, ${location.state || ''}` : '');
        if (!title || !description || !compName || !compPhone || !locAddress) {
            return next((0, errorHandler_1.createError)('Title, description, complainant name, phone and incident address are required', 400));
        }
        const complaintId = generateComplaintId();
        const userId = req.user?.id;
        const newComplaint = await Complaint_1.Complaint.create({
            complaintId,
            category: category || 'OTHER',
            title,
            description,
            incidentDateTime: incidentDateTime ? new Date(incidentDateTime) : new Date(),
            complainant: {
                name: compName,
                phone: compPhone,
                email: complainant?.email,
                aadhaarOrIdHash: complainant?.aadhaarOrIdHash,
                address: complainant?.address,
                isAnonymous: Boolean(complainant?.isAnonymous),
            },
            suspectInfo: suspectInfo || {},
            location: {
                fullAddress: locAddress,
                city: location?.city || 'Unspecified',
                district: location?.district,
                state: location?.state || 'Telangana',
                country: location?.country || 'India',
                pinCode: location?.pinCode,
                coordinates: {
                    lat: location?.coordinates?.lat || location?.lat || 17.3850,
                    lng: location?.coordinates?.lng || location?.lng || 78.4867,
                },
            },
            relatedPersons: relatedPersons || [],
            relatedLocations: relatedLocations || [],
            relatedVehiclesDevices: relatedVehiclesDevices || [],
            evidenceFiles: evidenceFiles || [],
            supportingDocuments: supportingDocuments || [],
            additionalNotes,
            status: 'SUBMITTED',
            statusHistory: [
                {
                    status: 'SUBMITTED',
                    updatedBy: complainant?.isAnonymous ? 'Anonymous Citizen' : (compName || 'Citizen'),
                    notes: 'Citizen complaint officially registered into CRIMEVERSE AI Intake Portal.',
                    timestamp: new Date(),
                },
            ],
            assignedDepartment: 'Central Cyber & Financial Crime Cell',
            userId,
        });
        // Create system notification
        if (userId) {
            await Notification_1.Notification.create({
                userId,
                title: 'Complaint Registered',
                message: `Your complaint ${complaintId} has been successfully submitted and assigned for review.`,
                type: 'complaint',
                link: `/complaints/track/${complaintId}`,
            });
        }
        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            data: newComplaint,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createComplaint = createComplaint;
// Track Complaint by complaintId (Public or Authenticated)
const getComplaintByTrackingId = async (req, res, next) => {
    try {
        const { complaintId } = req.params;
        const complaint = await Complaint_1.Complaint.findOne({ complaintId }).populate('assignedOfficer', 'name email role');
        if (!complaint) {
            return next((0, errorHandler_1.createError)(`Complaint ${complaintId} not found`, 404));
        }
        res.json({ success: true, data: complaint });
    }
    catch (err) {
        next(err);
    }
};
exports.getComplaintByTrackingId = getComplaintByTrackingId;
// Get all complaints (with filters, pagination, role-aware)
const getComplaints = async (req, res, next) => {
    try {
        const { status, category, search, page = 1, limit = 20, myOnly } = req.query;
        const filter = {};
        // If citizen user or requested myOnly, filter by userId or complainant email
        if (req.user?.role === 'CITIZEN' || myOnly === 'true') {
            filter.$or = [{ userId: req.user?.id }, { 'complainant.email': req.user?.email }];
        }
        if (status && status !== 'ALL')
            filter.status = status;
        if (category && category !== 'ALL')
            filter.category = category;
        if (search) {
            filter.$or = [
                { complaintId: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'complainant.name': { $regex: search, $options: 'i' } },
                { 'location.city': { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [complaints, total] = await Promise.all([
            Complaint_1.Complaint.find(filter)
                .populate('assignedOfficer', 'name email role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Complaint_1.Complaint.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: complaints,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getComplaints = getComplaints;
// Update Complaint Status & Workflow
const updateComplaintStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, notes, assignedDepartment, assignedOfficer } = req.body;
        const complaint = mongoose_1.default.Types.ObjectId.isValid(id)
            ? await Complaint_1.Complaint.findById(id)
            : await Complaint_1.Complaint.findOne({ complaintId: id });
        if (!complaint)
            return next((0, errorHandler_1.createError)('Complaint not found', 404));
        if (status && status !== complaint.status) {
            complaint.status = status;
            complaint.statusHistory.push({
                status: status,
                updatedBy: req.user?.name || 'Investigating Officer',
                notes: notes || `Status transitioned to ${status}`,
                timestamp: new Date(),
            });
        }
        if (assignedDepartment)
            complaint.assignedDepartment = assignedDepartment;
        if (assignedOfficer)
            complaint.assignedOfficer = assignedOfficer;
        await complaint.save();
        // Notify complainant if userId exists
        if (complaint.userId) {
            await Notification_1.Notification.create({
                userId: complaint.userId,
                title: `Complaint Status Updated: ${complaint.status}`,
                message: `Complaint ${complaint.complaintId} is now ${complaint.status}. ${notes ? `Note: ${notes}` : ''}`,
                type: 'complaint',
                link: `/complaints/track/${complaint.complaintId}`,
            });
        }
        res.json({ success: true, message: 'Complaint updated successfully', data: complaint });
    }
    catch (err) {
        next(err);
    }
};
exports.updateComplaintStatus = updateComplaintStatus;
// Convert Complaint to Formal Case
const promoteComplaintToCase = async (req, res, next) => {
    try {
        const { id } = req.params;
        const complaint = mongoose_1.default.Types.ObjectId.isValid(id)
            ? await Complaint_1.Complaint.findById(id)
            : await Complaint_1.Complaint.findOne({ complaintId: id });
        if (!complaint)
            return next((0, errorHandler_1.createError)('Complaint not found', 404));
        if (complaint.linkedCaseId) {
            return next((0, errorHandler_1.createError)('Complaint is already linked to an existing case', 400));
        }
        const newCase = await Case_1.Case.create({
            caseId: `CV-${complaint.complaintId.replace('CMP-', '')}`,
            title: complaint.title,
            description: `Formalized Investigation originated from Citizen Complaint ${complaint.complaintId}.\n\nComplainant: ${complaint.complainant.name} (${complaint.complainant.phone})\nIncident Address: ${complaint.location.fullAddress}, ${complaint.location.city}\n\nIncident Details: ${complaint.description}`,
            status: 'ACTIVE',
            priority: complaint.category === 'FINANCIAL_FRAUD' || complaint.category === 'EXTORTION' ? 'HIGH' : 'MEDIUM',
            assignedTo: req.user?.id,
            createdBy: req.user?.id,
            complaintId: complaint._id,
            tags: [complaint.category.toLowerCase().replace(/_/g, '-'), 'citizen-complaint', 'formalized'],
            riskScore: 65,
        });
        complaint.linkedCaseId = newCase._id;
        complaint.status = 'INVESTIGATION_STARTED';
        complaint.statusHistory.push({
            status: 'INVESTIGATION_STARTED',
            updatedBy: req.user?.name || 'Investigating Officer',
            notes: `Formal investigation initiated under Case ID: ${newCase.caseId}`,
            timestamp: new Date(),
        });
        await complaint.save();
        // Create timeline event for case
        await TimelineEvent_1.TimelineEvent.create({
            caseId: newCase._id,
            eventType: 'CASE_ORIGIN',
            title: 'Citizen Complaint Formalized into Case',
            description: `Case initiated from Complaint ${complaint.complaintId}.`,
            eventDate: new Date(),
            source: 'Citizen Intake',
            significance: 'HIGH',
            isVerified: true,
            createdBy: req.user?.id,
        });
        res.status(201).json({
            success: true,
            message: 'Complaint successfully promoted to formal investigation case',
            data: { case: newCase, complaint },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.promoteComplaintToCase = promoteComplaintToCase;
//# sourceMappingURL=complaints.controller.js.map