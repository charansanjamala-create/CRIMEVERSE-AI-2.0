import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authenticate';
import { LocationRecord } from '../models/LocationRecord';
import { Case } from '../models/Case';
import { createError } from '../middleware/errorHandler';

// Helper to format location record for frontend compatibility
const formatLocationRecord = (l: any) => {
  const obj = typeof l.toObject === 'function' ? l.toObject() : { ...l };
  obj.title = obj.title || obj.name;
  obj.category = obj.category || obj.locationType;
  obj.recordedAt = obj.recordedAt || obj.discoveredDate || obj.createdAt;
  if (typeof obj.address === 'string') {
    obj.address = {
      street: obj.address,
      city: obj.city || 'Central City',
      state: obj.state || 'Delhi',
      postalCode: obj.pinCode || '110001',
      country: obj.country || 'India',
    };
  }
  return obj;
};

// Get all locations for a case or complaint
export const getCaseLocations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caseId } = req.params;
    const { type, status } = req.query;

    let resolvedCaseId = caseId;
    if (caseId && !mongoose.Types.ObjectId.isValid(caseId)) {
      const caseDoc = await Case.findOne({ caseId });
      if (caseDoc) resolvedCaseId = caseDoc._id.toString();
    }

    const filter: any = { caseId: resolvedCaseId };
    if (type && type !== 'ALL') filter.locationType = type;
    if (status && status !== 'ALL') filter.verificationStatus = status;

    const locations = await LocationRecord.find(filter)
      .populate('relatedEntities', 'name type riskLevel')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: locations.map(formatLocationRecord) });
  } catch (err) {
    next(err);
  }
};

// Create a new location record for a case
export const createLocation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      caseId,
      complaintId,
      name,
      title,
      locationType,
      category,
      address,
      city,
      district,
      state,
      country,
      pinCode,
      coordinates,
      verificationStatus,
      notes,
      relatedEntities,
    } = req.body;

    const finalName = name || title || 'Case Location';

    let finalAddressStr = '';
    let finalCity = city || 'Central City';
    let finalState = state || 'Delhi';
    let finalPin = pinCode || '110001';
    let finalCountry = country || 'India';

    if (typeof address === 'object' && address !== null) {
      finalAddressStr = address.street || address.fullAddress || `${address.city || ''} ${address.state || ''}`;
      if (address.city) finalCity = address.city;
      if (address.state) finalState = address.state;
      if (address.postalCode || address.pinCode) finalPin = address.postalCode || address.pinCode;
      if (address.country) finalCountry = address.country;
    } else if (typeof address === 'string') {
      finalAddressStr = address;
    } else {
      finalAddressStr = `${finalCity}, ${finalState}`;
    }

    const finalCoords = {
      lat: Number(coordinates?.lat || 28.6139),
      lng: Number(coordinates?.lng || 77.2090),
    };

    if (!caseId) {
      return next(createError('caseId is required', 400));
    }

    let resolvedCaseId = caseId;
    if (caseId && !mongoose.Types.ObjectId.isValid(caseId)) {
      const caseDoc = await Case.findOne({ caseId });
      if (caseDoc) resolvedCaseId = caseDoc._id;
    }

    const location = await LocationRecord.create({
      caseId: resolvedCaseId,
      complaintId,
      name: finalName,
      locationType: locationType || category || 'RELATED_LOCATION',
      address: finalAddressStr,
      city: finalCity,
      district: district || 'Central',
      state: finalState,
      country: finalCountry,
      pinCode: finalPin,
      coordinates: finalCoords,
      verificationStatus: verificationStatus || 'REPORTED',
      notes,
      relatedEntities: relatedEntities || [],
      createdBy: req.user!.id,
    });

    res.status(201).json({ success: true, data: formatLocationRecord(location) });
  } catch (err) {
    next(err);
  }
};

// Update location verification status or details
export const updateLocation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return next(createError('Invalid location ID', 400));

    const allowed = ['name', 'locationType', 'address', 'city', 'district', 'state', 'pinCode', 'coordinates', 'verificationStatus', 'notes', 'relatedEntities'];
    const updates: any = {};
    allowed.forEach(k => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    const location = await LocationRecord.findByIdAndUpdate(id, updates, { new: true });
    if (!location) return next(createError('Location not found', 404));

    res.json({ success: true, data: formatLocationRecord(location) });
  } catch (err) {
    next(err);
  }
};

// Delete a location
export const deleteLocation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return next(createError('Invalid location ID', 400));

    const location = await LocationRecord.findByIdAndDelete(id);
    if (!location) return next(createError('Location not found', 404));
    res.json({ success: true, message: 'Location deleted successfully' });
  } catch (err) {
    next(err);
  }
};
