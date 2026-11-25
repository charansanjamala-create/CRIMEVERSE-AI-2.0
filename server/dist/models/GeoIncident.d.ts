import mongoose, { Document } from 'mongoose';
export interface ISuspectWaypoint {
    timestamp: Date;
    locationName: string;
    lat: number;
    lng: number;
    activity: string;
    confirmedBy: string;
}
export interface IGeoIncident extends Document {
    _id: mongoose.Types.ObjectId;
    incidentId: string;
    title: string;
    description: string;
    crimeType: 'FINANCIAL_FRAUD' | 'CYBER_HEIST' | 'IDENTITY_THEFT' | 'EXTORTION' | 'NARCOTICS' | 'ARMED_ROBBERY' | 'SURVEILLANCE_FLAG';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    coordinates: {
        lat: number;
        lng: number;
    };
    address: string;
    sector: string;
    status: 'ACTIVE' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED';
    caseId?: mongoose.Types.ObjectId;
    radiusMeters: number;
    threatScore: number;
    suspectTrail?: ISuspectWaypoint[];
    assignedUnits: string[];
    reportedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface IPatrolUnit extends Document {
    _id: mongoose.Types.ObjectId;
    unitId: string;
    callSign: string;
    vehicleType: 'INTERCEPTOR_CAR' | 'TACTICAL_SWAT_VAN' | 'SURVEILLANCE_DRONE' | 'MOTOR_PATROL';
    officerInCharge: string;
    badgeNumber: string;
    contactRadio: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    heading: number;
    speedKmH: number;
    status: 'ON_PATROL' | 'RESPONDING' | 'PURSUIT' | 'STANDBY' | 'OFFLINE';
    assignedIncidentId?: string;
    sector: string;
    batteryOrFuelPercent: number;
    lastPingAt: Date;
}
export declare const GeoIncident: mongoose.Model<IGeoIncident, {}, {}, {}, mongoose.Document<unknown, {}, IGeoIncident, {}, {}> & IGeoIncident & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const PatrolUnit: mongoose.Model<IPatrolUnit, {}, {}, {}, mongoose.Document<unknown, {}, IPatrolUnit, {}, {}> & IPatrolUnit & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=GeoIncident.d.ts.map