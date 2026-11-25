"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuspectTrail = exports.updatePatrolStatus = exports.getPatrolUnits = exports.createIncident = exports.getIncidentById = exports.getIncidents = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const GeoIncident_1 = require("../models/GeoIncident");
const Case_1 = require("../models/Case");
const errorHandler_1 = require("../middleware/errorHandler");
const getIncidents = async (req, res, next) => {
    try {
        const { crimeType, severity, status, sector } = req.query;
        const filter = {};
        if (crimeType)
            filter.crimeType = crimeType;
        if (severity)
            filter.severity = severity;
        if (status)
            filter.status = status;
        if (sector)
            filter.sector = sector;
        const incidents = await GeoIncident_1.GeoIncident.find(filter)
            .populate('caseId', 'caseId title priority riskScore')
            .sort({ reportedAt: -1 });
        // Generate heatmap density points
        const heatmapPoints = incidents.map(inc => ({
            lat: inc.coordinates.lat,
            lng: inc.coordinates.lng,
            weight: inc.severity === 'CRITICAL' ? 1.0 : inc.severity === 'HIGH' ? 0.75 : inc.severity === 'MEDIUM' ? 0.5 : 0.25,
            radius: inc.radiusMeters,
            label: inc.title,
        }));
        res.json({
            success: true,
            data: incidents,
            heatmap: heatmapPoints,
            meta: {
                total: incidents.length,
                criticalCount: incidents.filter(i => i.severity === 'CRITICAL').length,
                activeCount: incidents.filter(i => i.status === 'ACTIVE').length,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getIncidents = getIncidents;
const getIncidentById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const query = mongoose_1.default.Types.ObjectId.isValid(id)
            ? { $or: [{ _id: id }, { incidentId: id }] }
            : { incidentId: id };
        const incident = await GeoIncident_1.GeoIncident.findOne(query).populate('caseId', 'caseId title priority description tags');
        if (!incident)
            return next((0, errorHandler_1.createError)('Geospatial incident not found', 404));
        res.json({ success: true, data: incident });
    }
    catch (err) {
        next(err);
    }
};
exports.getIncidentById = getIncidentById;
const createIncident = async (req, res, next) => {
    try {
        const { title, description, crimeType, severity, coordinates, address, sector, caseId, radiusMeters } = req.body;
        if (!title || !crimeType || !coordinates?.lat || !coordinates?.lng) {
            return next((0, errorHandler_1.createError)('Title, crimeType, and coordinates (lat, lng) are required', 400));
        }
        let resolvedCaseId = undefined;
        if (caseId) {
            if (mongoose_1.default.Types.ObjectId.isValid(caseId)) {
                resolvedCaseId = caseId;
            }
            else {
                const c = await Case_1.Case.findOne({ caseId });
                if (c)
                    resolvedCaseId = c._id;
            }
        }
        const count = await GeoIncident_1.GeoIncident.countDocuments();
        const incidentId = `INC-GEO-${Date.now().toString().slice(-4)}-${count + 1}`;
        const incident = await GeoIncident_1.GeoIncident.create({
            incidentId,
            title,
            description: description || 'Flagged through CRIMEVERSE Tactical Geospatial Command Center',
            crimeType,
            severity: severity || 'HIGH',
            coordinates,
            address: address || `${sector || 'Sector 4'}, Central Metro District`,
            sector: sector || 'Central Sector',
            caseId: resolvedCaseId,
            radiusMeters: radiusMeters || 350,
            threatScore: severity === 'CRITICAL' ? 92 : severity === 'HIGH' ? 78 : 55,
            reportedAt: new Date(),
        });
        res.status(201).json({
            success: true,
            data: incident,
            message: 'New geospatial incident pinned successfully',
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createIncident = createIncident;
const getPatrolUnits = async (req, res, next) => {
    try {
        const { status, sector } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (sector)
            filter.sector = sector;
        const units = await GeoIncident_1.PatrolUnit.find(filter).sort({ unitId: 1 });
        res.json({
            success: true,
            data: units,
            meta: {
                totalUnits: units.length,
                activePatrols: units.filter(u => u.status === 'ON_PATROL' || u.status === 'RESPONDING').length,
                tacticalUnits: units.filter(u => u.vehicleType === 'TACTICAL_SWAT_VAN').length,
                airUnits: units.filter(u => u.vehicleType === 'SURVEILLANCE_DRONE').length,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getPatrolUnits = getPatrolUnits;
const updatePatrolStatus = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { status, assignedIncidentId, coordinates } = req.body;
        const query = mongoose_1.default.Types.ObjectId.isValid(id)
            ? { $or: [{ _id: id }, { unitId: id }] }
            : { unitId: id };
        const unit = await GeoIncident_1.PatrolUnit.findOne(query);
        if (!unit)
            return next((0, errorHandler_1.createError)('Patrol unit not found', 404));
        if (status)
            unit.status = status;
        if (assignedIncidentId !== undefined)
            unit.assignedIncidentId = assignedIncidentId;
        if (coordinates?.lat && coordinates?.lng) {
            unit.coordinates = coordinates;
            unit.lastPingAt = new Date();
        }
        await unit.save();
        res.json({ success: true, data: unit, message: 'Patrol unit status updated' });
    }
    catch (err) {
        next(err);
    }
};
exports.updatePatrolStatus = updatePatrolStatus;
const getSuspectTrail = async (req, res, next) => {
    try {
        const { caseId } = req.params;
        let incident = null;
        if (caseId && caseId !== 'undefined' && caseId !== 'all') {
            if (mongoose_1.default.Types.ObjectId.isValid(caseId)) {
                incident = await GeoIncident_1.GeoIncident.findOne({ caseId }).sort({ reportedAt: -1 });
            }
            if (!incident) {
                const caseDoc = await Case_1.Case.findOne({ caseId });
                if (caseDoc) {
                    incident = await GeoIncident_1.GeoIncident.findOne({ caseId: caseDoc._id }).sort({ reportedAt: -1 });
                }
            }
        }
        // If no specific incident with caseId found, look for any incident with a suspect trail
        if (!incident || !incident.suspectTrail || incident.suspectTrail.length === 0) {
            incident = await GeoIncident_1.GeoIncident.findOne({ 'suspectTrail.0': { $exists: true } });
        }
        const trail = incident?.suspectTrail || [
            {
                timestamp: new Date(Date.now() - 4 * 3600000),
                locationName: 'Sector 9 - Crypto Hub Server Farm',
                lat: 28.6139,
                lng: 77.2090,
                activity: 'Initial network breach and spoofed authentication request logged.',
                confirmedBy: 'IDS Sentinel AI',
            },
            {
                timestamp: new Date(Date.now() - 3 * 3600000),
                locationName: 'Bank ATM Terminal #104 - Concourse Plaza',
                lat: 28.6219,
                lng: 77.2185,
                activity: 'Physical mule withdrawal attempt. CCTV flagged Viktor Lazarov profile.',
                confirmedBy: 'CAM-FIN-01 (CCTV AI)',
            },
            {
                timestamp: new Date(Date.now() - 90 * 60000),
                locationName: 'Metro Transit Station - Gate 4',
                lat: 28.6304,
                lng: 77.2177,
                activity: 'Boarded rapid transit heading North-West. License plate recognized.',
                confirmedBy: 'ANPR Gate Camera',
            },
            {
                timestamp: new Date(Date.now() - 25 * 60000),
                locationName: 'Industrial Safehouse Warehouse 14',
                lat: 28.6410,
                lng: 77.2280,
                activity: 'Signal detected from cloned IMEI burner phone. Patrol Unit SWAT-Alpha dispatched.',
                confirmedBy: 'Cell Tower Triangulation',
            },
        ];
        res.json({ success: true, data: trail, incidentId: incident?.incidentId });
    }
    catch (err) {
        next(err);
    }
};
exports.getSuspectTrail = getSuspectTrail;
//# sourceMappingURL=geo.controller.js.map