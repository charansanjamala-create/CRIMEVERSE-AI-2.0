import mongoose, { Schema, Document } from 'mongoose';

export interface IBlockchainAnalysis extends Document {
  _id: mongoose.Types.ObjectId;
  caseId?: mongoose.Types.ObjectId;
  walletAddress: string;
  blockchain: string;
  riskScore: number;
  riskLevel: string;
  transactionCount: number;
  totalValueUSD: number;
  suspiciousTransactions: number;
  indicators: { name: string; description: string; severity: string }[];
  transactions: {
    txHash: string;
    from: string;
    to: string;
    value: number;
    timestamp: Date;
    isSuspicious: boolean;
    suspicionReason?: string;
  }[];
  relatedWallets: { address: string; relationship: string; riskScore: number }[];
  exchangeConnections: { name: string; type: string; flagged: boolean }[];
  patternAnalysis: Record<string, any>;
  investigationTimeline: { date: Date; event: string; details: string }[];
  requiresHumanReview: boolean;
  disclaimer: string;
  analyzedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BlockchainAnalysisSchema = new Schema<IBlockchainAnalysis>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case' },
    walletAddress: { type: String, required: true },
    blockchain: { type: String, default: 'ETH' },
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    riskLevel: { type: String, default: 'UNKNOWN' },
    transactionCount: { type: Number, default: 0 },
    totalValueUSD: { type: Number, default: 0 },
    suspiciousTransactions: { type: Number, default: 0 },
    indicators: [{ name: String, description: String, severity: String }],
    transactions: [
      {
        txHash: String,
        from: String,
        to: String,
        value: Number,
        timestamp: Date,
        isSuspicious: Boolean,
        suspicionReason: String,
      },
    ],
    relatedWallets: [{ address: String, relationship: String, riskScore: Number }],
    exchangeConnections: [
      {
        name: { type: String },
        type: { type: String },
        flagged: { type: Boolean },
      },
    ],
    patternAnalysis: { type: Schema.Types.Mixed, default: {} },
    investigationTimeline: [{ date: Date, event: String, details: String }],
    requiresHumanReview: { type: Boolean, default: true },
    disclaimer: { type: String, default: 'This analysis is based on synthetic/demo data. Blockchain analysis requires human review and does not constitute legal evidence.' },
    analyzedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

BlockchainAnalysisSchema.index({ caseId: 1 });
BlockchainAnalysisSchema.index({ walletAddress: 1 });
BlockchainAnalysisSchema.index({ riskScore: -1 });

export const BlockchainAnalysis = mongoose.model<IBlockchainAnalysis>('BlockchainAnalysis', BlockchainAnalysisSchema);
