import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { BlockchainAnalysis } from '../models/BlockchainAnalysis';
import { Case } from '../models/Case';
import { Evidence } from '../models/Evidence';
import { Alert } from '../models/Alert';
import { analyzeWallet } from '../ai/blockchainTrace';
import { createError } from '../middleware/errorHandler';

export const analyzeBlockchain = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { walletAddress, blockchain, caseId } = req.body;
    if (!walletAddress) return next(createError('Wallet address is required', 400));

    const result = await analyzeWallet(walletAddress, blockchain || 'ETH');

    const analysis = await BlockchainAnalysis.create({
      caseId: caseId || undefined,
      ...result,
      analyzedBy: req.user!.id,
    });

    if (caseId) {
      await Evidence.create({
        caseId, title: `Blockchain Analysis: ${walletAddress.slice(0, 10)}...`,
        type: 'BLOCKCHAIN', content: `Wallet: ${walletAddress}\nBlockchain: ${blockchain || 'ETH'}`,
        isProcessed: true, processingStatus: 'completed',
        uploadedBy: req.user!.id,
      });
      await Case.findByIdAndUpdate(caseId, { $inc: { evidenceCount: 1 }, lastActivityAt: new Date() });

      if (result.riskScore >= 65) {
        await Alert.create({
          caseId, title: 'High-Risk Wallet Activity Detected',
          message: `Blockchain analysis of ${walletAddress.slice(0, 10)}... returned risk score: ${result.riskScore}/100. ${result.suspiciousTransactions} suspicious transaction(s) identified.`,
          severity: result.riskScore >= 80 ? 'CRITICAL' : 'HIGH',
          category: 'blockchain', source: 'ChainTrace AI',
        });
        await Case.findByIdAndUpdate(caseId, { $inc: { alertCount: 1 } });
      }
    }

    res.status(201).json({ success: true, data: analysis, message: 'Blockchain analysis complete' });
  } catch (err) { next(err); }
};

export const getBlockchainHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caseId } = req.query;
    const filter: any = caseId ? { caseId } : {};
    const analyses = await BlockchainAnalysis.find(filter).populate('analyzedBy', 'name').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: analyses });
  } catch (err) { next(err); }
};

export const getBlockchainAnalysis = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const analysis = await BlockchainAnalysis.findById(req.params.id).populate('analyzedBy', 'name email');
    if (!analysis) return next(createError('Blockchain analysis not found', 404));
    res.json({ success: true, data: analysis });
  } catch (err) { next(err); }
};
