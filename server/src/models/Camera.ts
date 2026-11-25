import mongoose, { Schema, Document } from 'mongoose';

export interface IDetection {
  id: string;
  type: 'PERSON' | 'WEAPON' | 'VEHICLE' | 'BAGGAGE' | 'ANOMALY';
  label: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, width, height] percentage
  threatSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: Date;
  suspectMatch?: {
    name: string;
    alias: string;
    similarity: number;
  };
}

export interface ICamera extends Document {
  _id: mongoose.Types.ObjectId;
  cameraId: string;
  name: string;
  sector: string;
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  streamUrl: string;
  status: 'ONLINE' | 'ALERT' | 'DEGRADED' | 'OFFLINE';
  resolution: string;
  fps: number;
  bitrateMbps: number;
  ptzCapable: boolean;
  currentPan: number;
  currentTilt: number;
  currentZoom: number;
  nightVision: boolean;
  thermalMode: boolean;
  caseId?: mongoose.Types.ObjectId;
  activeDetections: IDetection[];
  lastPingAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DetectionSchema = new Schema<IDetection>(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ['PERSON', 'WEAPON', 'VEHICLE', 'BAGGAGE', 'ANOMALY'], required: true },
    label: { type: String, required: true },
    confidence: { type: Number, required: true },
    bbox: [{ type: Number }],
    threatSeverity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
    timestamp: { type: Date, default: Date.now },
    suspectMatch: {
      name: { type: String },
      alias: { type: String },
      similarity: { type: Number },
    },
  },
  { _id: false }
);

const CameraSchema = new Schema<ICamera>(
  {
    cameraId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    sector: { type: String, required: true },
    locationName: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    streamUrl: { type: String, default: '' },
    status: { type: String, enum: ['ONLINE', 'ALERT', 'DEGRADED', 'OFFLINE'], default: 'ONLINE' },
    resolution: { type: String, default: '4K UHD (3840x2160)' },
    fps: { type: Number, default: 30 },
    bitrateMbps: { type: Number, default: 8.5 },
    ptzCapable: { type: Boolean, default: true },
    currentPan: { type: Number, default: 0 },
    currentTilt: { type: Number, default: 0 },
    currentZoom: { type: Number, default: 1 },
    nightVision: { type: Boolean, default: false },
    thermalMode: { type: Boolean, default: false },
    caseId: { type: Schema.Types.ObjectId, ref: 'Case' },
    activeDetections: [DetectionSchema],
    lastPingAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CameraSchema.index({ sector: 1, status: 1 });

export const Camera = mongoose.model<ICamera>('Camera', CameraSchema);
