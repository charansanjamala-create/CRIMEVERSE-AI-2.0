"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReport = exports.getReportsByCase = exports.generateReport = void 0;
const InvestigationReport_1 = require("../models/InvestigationReport");
const Case_1 = require("../models/Case");
const VoiceAnalysis_1 = require("../models/VoiceAnalysis");
const EmailAnalysis_1 = require("../models/EmailAnalysis");
const IdentityAnalysis_1 = require("../models/IdentityAnalysis");
const BlockchainAnalysis_1 = require("../models/BlockchainAnalysis");
const Entity_1 = require("../models/Entity");
const Alert_1 = require("../models/Alert");
const TimelineEvent_1 = require("../models/TimelineEvent");
const errorHandler_1 = require("../middleware/errorHandler");
const generateReport = async (req, res, next) => {
    try {
        const { caseId } = req.body;
        if (!caseId)
            return next((0, errorHandler_1.createError)('caseId is required', 400));
        const [caseDoc, voices, emails, identities, blockchains, entities, alerts, timeline] = await Promise.all([
            Case_1.Case.findById(caseId).populate('assignedTo', 'name').populate('createdBy', 'name'),
            VoiceAnalysis_1.VoiceAnalysis.find({ caseId }),
            EmailAnalysis_1.EmailAnalysis.find({ caseId }),
            IdentityAnalysis_1.IdentityAnalysis.find({ caseId }),
            BlockchainAnalysis_1.BlockchainAnalysis.find({ caseId }),
            Entity_1.Entity.find({ caseId }),
            Alert_1.Alert.find({ caseId }),
            TimelineEvent_1.TimelineEvent.find({ caseId }).sort({ eventDate: 1 }),
        ]);
        if (!caseDoc)
            return next((0, errorHandler_1.createError)('Case not found', 404));
        const avgVoiceScore = voices.length ? Math.round(voices.reduce((a, v) => a + v.suspicionScore, 0) / voices.length) : 0;
        const avgEmailScore = emails.length ? Math.round(emails.reduce((a, e) => a + e.threatScore, 0) / emails.length) : 0;
        const avgIdScore = identities.length ? Math.round(identities.reduce((a, i) => a + i.riskScore, 0) / identities.length) : 0;
        const avgBcScore = blockchains.length ? Math.round(blockchains.reduce((a, b) => a + b.riskScore, 0) / blockchains.length) : 0;
        const overallRisk = Math.round((avgVoiceScore + avgEmailScore + avgIdScore + avgBcScore) / 4) || caseDoc.riskScore;
        const sections = [
            { sectionId: 'case_summary', title: 'Case Summary', isAIGenerated: false, confidence: 100,
                content: `Case: ${caseDoc.title} (${caseDoc.caseId})\nStatus: ${caseDoc.status} | Priority: ${caseDoc.priority}\nDescription: ${caseDoc.description}\nEntities identified: ${entities.length}\nEvidence items: ${caseDoc.evidenceCount}\nActive alerts: ${alerts.filter(a => !a.isRead).length}` },
            { sectionId: 'risk_overview', title: 'Risk Overview', isAIGenerated: true, confidence: 72,
                content: `Overall Risk Score: ${overallRisk}/100\n\nModule Risk Scores:\n- Voice Intelligence: ${avgVoiceScore}/100 (${voices.length} sample(s))\n- Email Intelligence: ${avgEmailScore}/100 (${emails.length} email(s))\n- Identity Intelligence: ${avgIdScore}/100 (${identities.length} document(s))\n- Blockchain Intelligence: ${avgBcScore}/100 (${blockchains.length} wallet(s))\n\nNote: Risk scores are AI-generated indicators and require human validation.` },
            { sectionId: 'voice_intelligence', title: 'Voice Intelligence (VoiceShield AI)', isAIGenerated: true, confidence: 68,
                content: voices.length > 0
                    ? voices.map(v => `File: ${v.fileName}\nSuspicion Score: ${v.suspicionScore}/100\nVerdict: ${v.verdict}\nIndicators: ${v.indicators.map(i => i.name).join(', ')}`).join('\n\n')
                    : 'No voice analyses conducted for this case.' },
            { sectionId: 'email_intelligence', title: 'Email Intelligence (MailGuard)', isAIGenerated: true, confidence: 74,
                content: emails.length > 0
                    ? emails.map(e => `Subject: ${e.subject || 'N/A'}\nThreat Score: ${e.threatScore}/100\nThreat Categories: ${e.threatCategories.join(', ')}\nExtracted IPs: ${e.extractedIPs.length} | URLs: ${e.extractedURLs.length} | Wallets: ${e.extractedWallets.length}`).join('\n\n')
                    : 'No email analyses conducted for this case.' },
            { sectionId: 'identity_intelligence', title: 'Identity Intelligence (VeriTrust AI)', isAIGenerated: true, confidence: 70,
                content: identities.length > 0
                    ? identities.map(i => `Document: ${i.documentType}\nSubject: ${i.subjectName || 'N/A'}\nRisk Score: ${i.riskScore}/100\nStatus: ${i.verificationStatus}\nInconsistencies: ${i.inconsistencies.length}`).join('\n\n')
                    : 'No identity analyses conducted for this case.' },
            { sectionId: 'blockchain_intelligence', title: 'Blockchain Intelligence (ChainTrace AI)', isAIGenerated: true, confidence: 71,
                content: blockchains.length > 0
                    ? blockchains.map(b => `Wallet: ${b.walletAddress}\nBlockchain: ${b.blockchain}\nRisk Score: ${b.riskScore}/100\nTransactions: ${b.transactionCount} (${b.suspiciousTransactions} suspicious)\nTotal Value: $${b.totalValueUSD.toLocaleString()}`).join('\n\n')
                    : 'No blockchain analyses conducted for this case.' },
            { sectionId: 'timeline', title: 'Investigation Timeline', isAIGenerated: false, confidence: 100,
                content: timeline.length > 0
                    ? timeline.map(t => `[${new Date(t.eventDate).toISOString().split('T')[0]}] ${t.title}: ${t.description}`).join('\n')
                    : 'No timeline events recorded for this case.' },
            { sectionId: 'limitations', title: 'Limitations & Disclaimers', isAIGenerated: false, confidence: 100,
                content: 'This report contains AI-generated analysis and must not be used as sole basis for legal action.\nAll AI findings are investigative indicators requiring human expert validation.\nThe AI system may produce false positives and false negatives.\nBlockchain and identity analyses use synthetic/demo data for demonstration purposes.' },
        ];
        const report = await InvestigationReport_1.InvestigationReport.create({
            caseId,
            title: `Intelligence Report — ${caseDoc.title}`,
            reportType: 'UNIFIED_INTELLIGENCE',
            status: 'DRAFT',
            sections,
            riskSummary: {
                overallRisk: overallRisk >= 70 ? 'HIGH' : overallRisk >= 40 ? 'MEDIUM' : 'LOW',
                riskScore: overallRisk,
                keyIndicators: alerts.slice(0, 5).map(a => a.title),
            },
            findings: [
                `${voices.filter(v => v.suspicionScore >= 70).length} high-suspicion voice sample(s) detected`,
                `${emails.filter(e => e.threatScore >= 60).length} high-threat email(s) identified`,
                `${identities.filter(i => i.riskScore >= 60).length} document(s) with significant inconsistencies`,
                `${blockchains.filter(b => b.riskScore >= 65).length} high-risk wallet(s) traced`,
                `${entities.length} entities mapped in criminal network`,
            ],
            recommendations: [
                'Engage certified forensic audio expert for voice sample review',
                'Submit flagged documents to official verification authorities',
                'Engage cryptocurrency forensics specialists for blockchain analysis',
                'Pursue legal channels for email header and IP geolocation verification',
                'Expand entity network analysis to second-degree connections',
            ],
            limitations: [
                'AI analysis is probabilistic and not deterministic',
                'Demo/synthetic data used for some modules',
                'Real-time blockchain data requires external API integration',
            ],
            uncertainties: [
                'Voice cloning detection may have false positive rate in demo mode',
                'Entity connections inferred from correlation, not confirmed',
                'Geolocation accuracy depends on IP database currency',
            ],
            requiresHumanReview: true,
            generatedBy: req.user.id,
            aiProvider: 'mock',
        });
        await Case_1.Case.findByIdAndUpdate(caseId, { riskScore: overallRisk, lastActivityAt: new Date() });
        res.status(201).json({ success: true, data: report, message: 'Investigation report generated' });
    }
    catch (err) {
        next(err);
    }
};
exports.generateReport = generateReport;
const getReportsByCase = async (req, res, next) => {
    try {
        const reports = await InvestigationReport_1.InvestigationReport.find({ caseId: req.params.caseId }).populate('generatedBy', 'name').sort({ createdAt: -1 });
        res.json({ success: true, data: reports });
    }
    catch (err) {
        next(err);
    }
};
exports.getReportsByCase = getReportsByCase;
const getReport = async (req, res, next) => {
    try {
        const report = await InvestigationReport_1.InvestigationReport.findById(req.params.id).populate('generatedBy', 'name email');
        if (!report)
            return next((0, errorHandler_1.createError)('Report not found', 404));
        res.json({ success: true, data: report });
    }
    catch (err) {
        next(err);
    }
};
exports.getReport = getReport;
//# sourceMappingURL=reports.controller.js.map