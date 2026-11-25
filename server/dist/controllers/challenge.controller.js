"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitFindingReview = exports.generateHypotheses = exports.requestHumanReview = exports.generateAlternativeExplanation = exports.challengeFinding = exports.getCaseFindings = exports.formatFinding = exports.findFindingSafe = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const AIFinding_1 = require("../models/AIFinding");
const Escalation_1 = require("../models/Escalation");
const Case_1 = require("../models/Case");
const errorHandler_1 = require("../middleware/errorHandler");
const uuid_1 = require("uuid");
// Helper to look up finding safely by _id or findingId
const findFindingSafe = async (idOrCode) => {
    if (!idOrCode)
        return null;
    if (mongoose_1.default.Types.ObjectId.isValid(idOrCode)) {
        return await AIFinding_1.AIFinding.findOne({ $or: [{ _id: idOrCode }, { findingId: idOrCode }] });
    }
    return await AIFinding_1.AIFinding.findOne({ findingId: idOrCode });
};
exports.findFindingSafe = findFindingSafe;
// Helper to format finding for both original schema and frontend interface
const formatFinding = (f) => {
    const obj = typeof f.toObject === 'function' ? f.toObject() : { ...f };
    obj.description = obj.description || obj.finding;
    obj.confidenceScore = obj.confidenceScore ?? obj.confidence;
    obj.status = obj.status || obj.verificationStatus;
    obj.type = obj.type || obj.category || 'CONTRADICTION';
    obj.severity = obj.severity || (obj.confidenceScore > 85 ? 'HIGH' : obj.confidenceScore > 60 ? 'MEDIUM' : 'LOW');
    if (!obj.contradictoryEvidence && obj.contradictingEvidence?.length) {
        obj.contradictoryEvidence = obj.contradictingEvidence.map((ce, idx) => ({
            itemA: ce,
            itemB: (obj.supportingEvidence && obj.supportingEvidence[idx]) || 'Reported Primary Intelligence Assertion',
            explanation: 'Empirical counterpoint identified during autonomous audit.',
        }));
    }
    if (!obj.alternativeHypotheses && obj.alternativeExplanations?.length) {
        obj.alternativeHypotheses = obj.alternativeExplanations.map((ae) => ({
            title: ae.slice(0, 50) + (ae.length > 50 ? '...' : ''),
            plausibility: 'MEDIUM',
            description: ae,
            supportingEvidence: obj.supportingEvidence || [],
            counterEvidence: obj.contradictingEvidence || [],
        }));
    }
    return obj;
};
exports.formatFinding = formatFinding;
// Get all AI findings for a case
const getCaseFindings = async (req, res, next) => {
    try {
        const { caseId } = req.params;
        const { status } = req.query;
        let resolvedCaseId = caseId;
        if (caseId && !mongoose_1.default.Types.ObjectId.isValid(caseId)) {
            const caseDoc = await Case_1.Case.findOne({ caseId });
            if (caseDoc)
                resolvedCaseId = caseDoc._id.toString();
        }
        const filter = { caseId: resolvedCaseId };
        if (status && status !== 'ALL')
            filter.verificationStatus = status;
        const findings = await AIFinding_1.AIFinding.find(filter).sort({ confidence: -1, createdAt: -1 });
        res.json({ success: true, data: findings.map(exports.formatFinding) });
    }
    catch (err) {
        next(err);
    }
};
exports.getCaseFindings = getCaseFindings;
// Challenge an AI finding (Investigator submits critique/counter-evidence)
const challengeFinding = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { verdict, comment, contradictionNote, requestedQuestions } = req.body;
        const finding = await (0, exports.findFindingSafe)(id);
        if (!finding)
            return next((0, errorHandler_1.createError)('Finding not found', 404));
        if (contradictionNote) {
            finding.contradictingEvidence.push(contradictionNote);
        }
        if (requestedQuestions && Array.isArray(requestedQuestions)) {
            requestedQuestions.forEach((q) => {
                finding.criticalQuestions.push({
                    question: q,
                    category: 'CONTRADICTION',
                    status: 'FLAGGED',
                });
            });
        }
        finding.humanReviews.push({
            reviewerId: req.user.id,
            reviewerName: req.user.name,
            verdict: verdict || 'DISPUTED',
            comment: comment || 'Investigator disputed this AI conclusion upon evidentiary review.',
            timestamp: new Date(),
        });
        finding.verificationStatus = 'UNDER_CHALLENGE';
        finding.isUnderReview = true;
        // Lower AI confidence to reflect investigative dispute
        finding.confidence = Math.max(30, finding.confidence - 20);
        await finding.save();
        res.json({
            success: true,
            message: 'AI Finding disputed and queued for critical verification review.',
            data: finding,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.challengeFinding = challengeFinding;
// Generate alternative explanation for a finding
const generateAlternativeExplanation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const finding = await (0, exports.findFindingSafe)(id);
        if (!finding)
            return next((0, errorHandler_1.createError)('Finding not found', 404));
        // Intelligence heuristics to synthesize viable counter-explanations
        const counterHypotheses = [
            `The financial transactions may represent legitimate third-party escrow settlement rather than direct coordination.`,
            `Target entity credentials could have been compromised via remote infostealer malware without the entity's direct knowledge or complicity.`,
            `Geographic co-presence coincides with high-density transit hubs, indicating circumstantial proximity rather than tactical conspiracy.`,
            `Communication metadata volume matches standard automated API polling rather than human operator steering.`,
            `Document anomalies may originate from administrative scanning compression artifacts rather than deliberate forgery.`,
        ];
        const chosenAlternative = counterHypotheses[Math.floor(Math.random() * counterHypotheses.length)];
        if (!finding.alternativeExplanations.includes(chosenAlternative)) {
            finding.alternativeExplanations.push(chosenAlternative);
        }
        finding.potentialAssumptions.push('Assumed malicious intent from structural connectivity alone without corroborated Mens Rea.');
        finding.recommendedVerifications.push('Subpoena originating ISP session logs and request bank SWIFT MT103 authenticated telemetry.');
        await finding.save();
        res.json({
            success: true,
            message: 'Alternative explanation generated and recorded for investigative fairness.',
            data: finding,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.generateAlternativeExplanation = generateAlternativeExplanation;
// Request formal Human Review / Escalate finding
const requestHumanReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason, priority } = req.body;
        const finding = await (0, exports.findFindingSafe)(id);
        if (!finding)
            return next((0, errorHandler_1.createError)('Finding not found', 404));
        finding.verificationStatus = 'REQUIRES_HUMAN_REVIEW';
        finding.isUnderReview = true;
        await finding.save();
        // Auto-create escalation ticket
        const escalationId = `ESC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(0, uuid_1.v4)().slice(0, 5).toUpperCase()}`;
        const escalation = await Escalation_1.Escalation.create({
            escalationId,
            caseId: finding.caseId,
            reason: reason || `Challenge AI flagged severe uncertainty on conclusion: "${finding.title}". Human expert supervisor review mandatory.`,
            trigger: 'CHALLENGE_UNCERTAINTY',
            priority: priority || 'HIGH',
            status: 'PENDING',
            submittedBy: req.user.id,
            submittedByName: req.user.name,
            reviewNotes: [
                {
                    note: `Auto-escalated from Challenge AI audit for finding "${finding.title}" (Finding ID: ${finding.findingId}).`,
                    authorName: req.user.name,
                    authorRole: req.user.role,
                    authorId: req.user.id,
                    createdAt: new Date(),
                },
            ],
        });
        res.json({
            success: true,
            message: 'Formal human supervisor review requested and escalation created.',
            data: { finding: (0, exports.formatFinding)(finding), escalation },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.requestHumanReview = requestHumanReview;
// Generate alternative adversarial hypotheses for a finding or case
const generateHypotheses = async (req, res, next) => {
    try {
        const { caseId, findingId, context } = req.body;
        let finding = null;
        if (findingId) {
            finding = await (0, exports.findFindingSafe)(findingId);
        }
        const extraClause = context ? ` Specifically incorporating nuance: "${context}".` : '';
        const hypotheses = [
            {
                title: 'Proxy / Automated Infrastructure Relay',
                plausibility: 'HIGH',
                description: `Observed transactions and communications match automated botnet relay scripts rather than human operator steering.${extraClause}`,
                supportingEvidence: ['Burst transaction timing at non-standard hours', 'Low session dwell time'],
                counterEvidence: ['Occasional manual login headers'],
            },
            {
                title: 'Credential Impersonation via Infostealer Breach',
                plausibility: 'MEDIUM',
                description: `Target credentials may have been exfiltrated by secondary cybercrime actors operating independently without the subject's direct knowledge or complicity.${extraClause}`,
                supportingEvidence: ['Subject IP does not match origin CIDR subnet'],
                counterEvidence: ['Coordinated OTP SMS interception observed'],
            },
            {
                title: 'Circumstantial Transit Co-location',
                plausibility: 'MEDIUM',
                description: `Geospatial coordinates intersect major metropolitan transit interchanges, indicating incidental co-location rather than synchronized conspiracy.${extraClause}`,
                supportingEvidence: ['Interchange pedestrian volume exceeds 10,000/hr'],
                counterEvidence: ['Multiple repeat timestamps across three consecutive days'],
            },
            {
                title: 'Third-Party Escrow Settlement',
                plausibility: 'LOW',
                description: `Financial movements represent legitimate collateral dispute resolution rather than illicit laundering layering.${extraClause}`,
                supportingEvidence: ['Commercial contract records on file'],
                counterEvidence: ['Mixer address interaction detected downstream'],
            },
        ];
        if (finding) {
            finding.alternativeExplanations.push(hypotheses[0].description);
            await finding.save();
        }
        res.json({
            success: true,
            data: { hypotheses },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.generateHypotheses = generateHypotheses;
// Submit investigator audit review disposition
const submitFindingReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, notes, verdict, comment } = req.body;
        const finding = await (0, exports.findFindingSafe)(id);
        if (!finding)
            return next((0, errorHandler_1.createError)('Finding not found', 404));
        if (status) {
            finding.verificationStatus = status;
            if (status === 'DISMISSED' || status === 'REVIEWED') {
                finding.isUnderReview = false;
            }
        }
        finding.humanReviews.push({
            reviewerId: req.user.id,
            reviewerName: req.user.name,
            verdict: verdict || (status === 'DISMISSED' ? 'DISPUTED' : 'CONFIRMED'),
            comment: comment || notes || 'Audit disposition recorded by sworn investigator.',
            timestamp: new Date(),
        });
        await finding.save();
        res.json({
            success: true,
            message: 'Audit disposition recorded successfully.',
            data: (0, exports.formatFinding)(finding),
        });
    }
    catch (err) {
        next(err);
    }
};
exports.submitFindingReview = submitFindingReview;
//# sourceMappingURL=challenge.controller.js.map