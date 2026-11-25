import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authenticate';
import { Complaint, ComplaintStatus } from '../models/Complaint';
import { TimelineEvent } from '../models/TimelineEvent';
import { Notification } from '../models/Notification';
import { Case } from '../models/Case';
import { createError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

// Helper to generate unique complaint ID e.g. CMP-20240909-ABCD1
const generateComplaintId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = uuidv4().slice(0, 5).toUpperCase();
  return `CMP-${dateStr}-${randomSuffix}`;
};

// Create Complaint (Citizen or authenticated user or anonymous)
export const createComplaint = async (req: Request | AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      category,
      title,
      description,
      incidentDateTime,
      complainant,
      suspectInfo,
      location,
      relatedPersons,
      relatedLocations,
      relatedVehiclesDevices,
      evidenceFiles,
      supportingDocuments,
      additionalNotes,
    } = req.body;

    const compName = complainant?.name || complainant?.fullName;
    const compPhone = complainant?.phone || complainant?.mobile;
    const locAddress = location?.fullAddress || location?.address || location?.street || (location?.city ? `${location.city}, ${location.state || ''}` : '');

    if (!title || !description || !compName || !compPhone || !locAddress) {
      return next(createError('Title, description, complainant name, phone and incident address are required', 400));
    }

    const complaintId = generateComplaintId();
    const userId = (req as AuthRequest).user?.id;

    const newComplaint = await Complaint.create({
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
      await Notification.create({
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
  } catch (err) {
    next(err);
  }
};

// Track Complaint by complaintId (Public or Authenticated)
export const getComplaintByTrackingId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findOne({ complaintId }).populate('assignedOfficer', 'name email role');
    if (!complaint) {
      return next(createError(`Complaint ${complaintId} not found`, 404));
    }
    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

// Get all complaints (with filters, pagination, role-aware)
export const getComplaints = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, category, search, page = 1, limit = 20, myOnly } = req.query;
    const filter: any = {};

    // If citizen user or requested myOnly, filter by userId or complainant email
    if (req.user?.role === 'CITIZEN' || myOnly === 'true') {
      filter.$or = [{ userId: req.user?.id }, { 'complainant.email': req.user?.email }];
    }

    if (status && status !== 'ALL') filter.status = status;
    if (category && category !== 'ALL') filter.category = category;
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
      Complaint.find(filter)
        .populate('assignedOfficer', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Complaint.countDocuments(filter),
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
  } catch (err) {
    next(err);
  }
};

// Update Complaint Status & Workflow
export const updateComplaintStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, notes, assignedDepartment, assignedOfficer } = req.body;

    const complaint = mongoose.Types.ObjectId.isValid(id)
      ? await Complaint.findById(id)
      : await Complaint.findOne({ complaintId: id });
    if (!complaint) return next(createError('Complaint not found', 404));

    if (status && status !== complaint.status) {
      complaint.status = status as ComplaintStatus;
      complaint.statusHistory.push({
        status: status as ComplaintStatus,
        updatedBy: req.user?.name || 'Investigating Officer',
        notes: notes || `Status transitioned to ${status}`,
        timestamp: new Date(),
      });
    }

    if (assignedDepartment) complaint.assignedDepartment = assignedDepartment;
    if (assignedOfficer) complaint.assignedOfficer = assignedOfficer;

    await complaint.save();

    // Notify complainant if userId exists
    if (complaint.userId) {
      await Notification.create({
        userId: complaint.userId,
        title: `Complaint Status Updated: ${complaint.status}`,
        message: `Complaint ${complaint.complaintId} is now ${complaint.status}. ${notes ? `Note: ${notes}` : ''}`,
        type: 'complaint',
        link: `/complaints/track/${complaint.complaintId}`,
      });
    }

    res.json({ success: true, message: 'Complaint updated successfully', data: complaint });
  } catch (err) {
    next(err);
  }
};

// Convert Complaint to Formal Case
export const promoteComplaintToCase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const complaint = mongoose.Types.ObjectId.isValid(id)
      ? await Complaint.findById(id)
      : await Complaint.findOne({ complaintId: id });
    if (!complaint) return next(createError('Complaint not found', 404));

    if (complaint.linkedCaseId) {
      return next(createError('Complaint is already linked to an existing case', 400));
    }

    const newCase = await Case.create({
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
    await TimelineEvent.create({
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
  } catch (err) {
    next(err);
  }
};
