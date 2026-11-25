import mongoose, { Document } from 'mongoose';
export interface IDetection {
    id: string;
    type: 'PERSON' | 'WEAPON' | 'VEHICLE' | 'BAGGAGE' | 'ANOMALY';
    label: string;
    confidence: number;
    bbox: [number, number, number, number];
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
export declare const Camera: mongoose.Model<ICamera, {}, {}, {}, mongoose.Document<unknown, {}, ICamera, {}, {}> & ICamera & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Camera.d.ts.map