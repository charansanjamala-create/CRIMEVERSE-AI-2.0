import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authenticate';
import { SmsDispatch } from '../models/SmsDispatch';
import { Alert } from '../models/Alert';
import { Case } from '../models/Case';
import { createError } from '../middleware/errorHandler';

// Pre-configured law enforcement SMS templates
const SMS_TEMPLATES = [
  {
    id: 'TPL-APB-01',
    category: 'TACTICAL_LOOKOUT',
    title: 'Armed Suspect Sighting (APB Lookout)',
    priority: 'CRITICAL_SOS',
    recipientGroup: 'ALL_UNITS',
    text: '🚨 [CRIMEVERSE ALERT] ALL UNITS APB: High-risk suspect Viktor Lazarov sighted near Sector 4 Transit Hub. Suspect is armed and dangerous. Intercept with caution. Coordinate via Channel Bravo.',
  },
  {
    id: 'TPL-EVAC-02',
    category: 'PUBLIC_SAFETY',
    title: 'Emergency Sector Evacuation Advisory',
    priority: 'HIGH',
    recipientGroup: 'CITIZEN_ALERT',
    text: '⚠️ [POLICE ADVISORY] Precautionary security perimeter established in Sector 7 between 4th & 8th Avenue. Please avoid the area and follow field officer directives. Emergency SOS dial 112.',
  },
  {
    id: 'TPL-CYBER-03',
    category: 'FRAUD_WARNING',
    title: 'Banking Cyber Voice Phishing Wave',
    priority: 'HIGH',
    recipientGroup: 'CYBER_CELL',
    text: '🛡️ [CYBER FRAUD ALERT] Active AI voice cloning attack targeting regional bank account holders. Impersonation of fraud department executives detected. Place freeze on unverified RTGS transfers.',
  },
  {
    id: 'TPL-SWAT-04',
    category: 'RAPID_RESPONSE',
    title: 'SWAT Tactical Unit Mobilization',
    priority: 'CRITICAL_SOS',
    recipientGroup: 'TACTICAL_SWAT',
    text: '🔴 [CODE RED TACTICAL] SWAT Units Alpha & Bravo mobilize immediately to Grid Reference N-28.641 / E-77.228 (Warehouse 14). Active hostage / data-destruction threat confirmed.',
  },
];

const EMERGENCY_RECIPIENT_GROUPS = [
  {
    key: 'TACTICAL_SWAT',
    label: 'Tactical SWAT Response Teams',
    description: 'High-readiness tactical counter-terror and armed assault personnel',
    activeCount: 16,
    avgResponseMinutes: 4.2,
  },
  {
    key: 'FIELD_PATROL',
    label: 'Field Beat & Highway Patrol Units',
    description: 'Active police patrol interceptors and traffic enforcement officers',
    activeCount: 48,
    avgResponseMinutes: 3.5,
  },
  {
    key: 'CYBER_CELL',
    label: 'Special Cyber & Financial Crimes Wing',
    description: 'Cryptocurrency analysts, forensics engineers, and fraud officers',
    activeCount: 12,
    avgResponseMinutes: 6.0,
  },
  {
    key: 'CITIZEN_ALERT',
    label: 'Geo-Fenced Citizen Safety Network',
    description: 'Registered verified neighborhood watch and emergency cell broadcast',
    activeCount: 2450,
    avgResponseMinutes: 1.0,
  },
  {
    key: 'ALL_UNITS',
    label: 'All Active Tactical & Field Units',
    description: 'Combined dispatch to SWAT, Patrol, and Specialized task forces',
    activeCount: 76,
    avgResponseMinutes: 3.0,
  },
];

export const sendSmsDispatch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, recipientGroup, phoneNumbers, message, priority, caseId } = req.body;

    if (!title || !recipientGroup || !message) {
      return next(createError('Title, recipientGroup, and message are required', 400));
    }

    const groupMeta = EMERGENCY_RECIPIENT_GROUPS.find(g => g.key === recipientGroup);
    const count = phoneNumbers && phoneNumbers.length > 0 ? phoneNumbers.length : (groupMeta?.activeCount || 25);

    const deliveredCount = Math.floor(count * 0.98); // 98% simulated instant delivery
    const failedCount = count - deliveredCount;

    let resolvedCaseId = undefined;
    if (caseId) {
      if (mongoose.Types.ObjectId.isValid(caseId)) {
        resolvedCaseId = caseId;
      } else {
        const c = await Case.findOne({ caseId });
        if (c) resolvedCaseId = c._id;
      }
    }

    const dispatchId = `SMS-DSP-${Date.now().toString().slice(-6)}`;

    const dispatch = await SmsDispatch.create({
      dispatchId,
      title,
      recipientGroup,
      phoneNumbers: phoneNumbers || [],
      message,
      priority: priority || 'HIGH',
      status: failedCount > 0 && deliveredCount > 0 ? 'DELIVERED' : 'SENT',
      totalRecipients: count,
      deliveredCount,
      failedCount,
      caseId: resolvedCaseId,
      carrierResponse: {
        gateway: 'CRIMEVERSE-GOV-SMS-TELECOM-NODE-01',
        messageId: `MSG-TEL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        deliveryRatePercent: parseFloat(((deliveredCount / count) * 100).toFixed(1)),
        latencyMs: 95 + Math.floor(Math.random() * 45),
      },
      sentBy: req.user!.id,
      sentAt: new Date(),
    });

    // Create system alert
    await Alert.create({
      caseId: resolvedCaseId,
      title: `Tactical SMS Dispatched: ${title}`,
      message: `Emergency SMS transmitted to ${count} recipients in ${recipientGroup}. Delivered: ${deliveredCount}/${count}. Priority: ${priority || 'HIGH'}.`,
      severity: priority === 'CRITICAL_SOS' ? 'CRITICAL' : 'HIGH',
      category: 'TACTICAL_DISPATCH',
      source: `DISPATCH:${dispatchId}`,
      metadata: { dispatchId, recipientGroup, deliveredCount, count },
    });

    res.status(201).json({
      success: true,
      data: dispatch,
      message: `SMS Dispatch successfully delivered to ${deliveredCount} recipients`,
    });
  } catch (err) {
    next(err);
  }
};

export const triggerEmergencySos = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { reason, coordinates, sector } = req.body;

    const dispatchId = `SOS-CRITICAL-${Date.now().toString().slice(-6)}`;
    const locationText = sector ? `Sector: ${sector}` : coordinates ? `Lat: ${coordinates.lat}, Lng: ${coordinates.lng}` : 'Central Operations Zone';

    const message = `🚨🚨 [CRITICAL PRIORITY RED ALERT] CODE RED LOCKDOWN DECLARED BY COMMAND. Reason: ${reason || 'Immediate Officer Threat / Critical Suspect Containment'}. Location: ${locationText}. All field units initiate perimeter lockdown and hold position.`;

    const dispatch = await SmsDispatch.create({
      dispatchId,
      title: '🚨 EMERGENCY RED ALERT - CODE RED LOCKDOWN',
      recipientGroup: 'ALL_UNITS',
      message,
      priority: 'CRITICAL_SOS',
      status: 'DELIVERED',
      totalRecipients: 76,
      deliveredCount: 76,
      failedCount: 0,
      carrierResponse: {
        gateway: 'EMERGENCY-GOV-BROADCAST-GATEWAY-PRIORITY-0',
        messageId: `SOS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        deliveryRatePercent: 100,
        latencyMs: 65,
      },
      sentBy: req.user!.id,
      sentAt: new Date(),
    });

    await Alert.create({
      title: '🚨 EMERGENCY SOS / RED ALERT BROADCAST TRIGGERED',
      message: `High-command declared Code Red Lockdown. ${reason || 'Immediate threat containment'}. Multi-unit broadcast delivered across all sectors.`,
      severity: 'CRITICAL',
      category: 'EMERGENCY_SOS',
      source: 'COMMAND_CENTER',
      metadata: { dispatchId, coordinates, sector },
    });

    res.status(201).json({
      success: true,
      data: dispatch,
      message: 'Emergency SOS Broadcast transmitted with priority bypass to all tactical units',
    });
  } catch (err) {
    next(err);
  }
};

export const getDispatchHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { priority, recipientGroup } = req.query;
    const filter: any = {};
    if (priority) filter.priority = priority;
    if (recipientGroup) filter.recipientGroup = recipientGroup;

    const dispatches = await SmsDispatch.find(filter)
      .populate('sentBy', 'name email role')
      .populate('caseId', 'caseId title')
      .sort({ sentAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: dispatches,
      meta: {
        totalDispatches: dispatches.length,
        totalDelivered: dispatches.reduce((acc, curr) => acc + curr.deliveredCount, 0),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getTemplates = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: SMS_TEMPLATES });
  } catch (err) {
    next(err);
  }
};

export const getContacts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: EMERGENCY_RECIPIENT_GROUPS });
  } catch (err) {
    next(err);
  }
};
