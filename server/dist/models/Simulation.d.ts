import mongoose, { Document } from 'mongoose';
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
export declare const Simulation: mongoose.Model<ISimulation, {}, {}, {}, mongoose.Document<unknown, {}, ISimulation, {}, {}> & ISimulation & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Simulation.d.ts.map