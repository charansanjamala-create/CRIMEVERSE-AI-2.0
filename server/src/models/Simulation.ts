import mongoose, { Schema, Document } from 'mongoose';

export interface ISimulation extends Document {
  _id: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  simulationId: string;
  title: string;
  description: string;
  hypothesis: string;
  modifications: {
    excludedRelationshipIds: string[];
    excludedEntityIds: string[];
    addedHypotheticalEntities: Array<{
      id: string;
      name: string;
      type: string;
      riskLevel: string;
      role: string;
    }>;
    addedHypotheticalRelationships: Array<{
      id: string;
      source: string;
      target: string;
      relationshipType: string;
      strength: number;
    }>;
  };
  baselineRiskScore: number;
  simulatedRiskScore: number;
  riskScoreDelta: number;
  comparisonSummary: string;
  watermark: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SimulationSchema = new Schema<ISimulation>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
    simulationId: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    hypothesis: { type: String, required: true },
    modifications: {
      excludedRelationshipIds: [{ type: String }],
      excludedEntityIds: [{ type: String }],
      addedHypotheticalEntities: [
        {
          id: { type: String },
          name: { type: String },
          type: { type: String },
          riskLevel: { type: String },
          role: { type: String },
        },
      ],
      addedHypotheticalRelationships: [
        {
          id: { type: String },
          source: { type: String },
          target: { type: String },
          relationshipType: { type: String },
          strength: { type: Number },
        },
      ],
    },
    baselineRiskScore: { type: Number, required: true },
    simulatedRiskScore: { type: Number, required: true },
    riskScoreDelta: { type: Number, required: true },
    comparisonSummary: { type: String, required: true },
    watermark: { type: String, default: 'HYPOTHETICAL / SIMULATION' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

SimulationSchema.index({ caseId: 1, createdAt: -1 });

export const Simulation = mongoose.model<ISimulation>('Simulation', SimulationSchema);
