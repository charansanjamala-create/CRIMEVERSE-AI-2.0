import mongoose, { Schema, Document } from 'mongoose';

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

const SuspectWaypointSchema = new Schema<ISuspectWaypoint>(
  {
    timestamp: { type: Date, required: true },
    locationName: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    activity: { type: String, required: true },
    confirmedBy: { type: String, default: 'CCTV AI' },
  },
  { _id: false }
);

const GeoIncidentSchema = new Schema<IGeoIncident>(
  {
    incidentId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    crimeType: {
      type: String,
      enum: ['FINANCIAL_FRAUD', 'CYBER_HEIST', 'IDENTITY_THEFT', 'EXTORTION', 'NARCOTICS', 'ARMED_ROBBERY', 'SURVEILLANCE_FLAG'],
      required: true,
    },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'HIGH' },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    address: { type: String, required: true },
    sector: { type: String, required: true },
    status: { type: String, enum: ['ACTIVE', 'INVESTIGATING', 'CONTAINED', 'RESOLVED'], default: 'ACTIVE' },
    caseId: { type: Schema.Types.ObjectId, ref: 'Case' },
    radiusMeters: { type: Number, default: 350 },
    threatScore: { type: Number, default: 75 },
    suspectTrail: [SuspectWaypointSchema],
    assignedUnits: [{ type: String }],
    reportedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const PatrolUnitSchema = new Schema<IPatrolUnit>(
  {
    unitId: { type: String, required: true, unique: true },
    callSign: { type: String, required: true },
    vehicleType: {
      type: String,
      enum: ['INTERCEPTOR_CAR', 'TACTICAL_SWAT_VAN', 'SURVEILLANCE_DRONE', 'MOTOR_PATROL'],
      default: 'INTERCEPTOR_CAR',
    },
    officerInCharge: { type: String, required: true },
    badgeNumber: { type: String, required: true },
    contactRadio: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    heading: { type: Number, default: 0 },
    speedKmH: { type: Number, default: 45 },
    status: {
      type: String,
      enum: ['ON_PATROL', 'RESPONDING', 'PURSUIT', 'STANDBY', 'OFFLINE'],
      default: 'ON_PATROL',
    },
    assignedIncidentId: { type: String },
    sector: { type: String, required: true },
    batteryOrFuelPercent: { type: Number, default: 85 },
    lastPingAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

GeoIncidentSchema.index({ severity: 1, status: 1 });
PatrolUnitSchema.index({ status: 1, sector: 1 });

export const GeoIncident = mongoose.model<IGeoIncident>('GeoIncident', GeoIncidentSchema);
export const PatrolUnit = mongoose.model<IPatrolUnit>('PatrolUnit', PatrolUnitSchema);
