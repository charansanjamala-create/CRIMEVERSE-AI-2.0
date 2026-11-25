"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSimulation = exports.getSimulationComparison = exports.createSimulation = exports.getSimulations = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Simulation_1 = require("../models/Simulation");
const Case_1 = require("../models/Case");
const Entity_1 = require("../models/Entity");
const Relationship_1 = require("../models/Relationship");
const errorHandler_1 = require("../middleware/errorHandler");
const uuid_1 = require("uuid");
// Helper to format simulation document with frontend aliases
const formatSimulation = (s) => {
    const obj = typeof s.toObject === 'function' ? s.toObject() : { ...s };
    obj.name = obj.name || obj.title;
    obj.baselineRisk = obj.baselineRisk ?? obj.baselineRiskScore;
    obj.simulatedRisk = obj.simulatedRisk ?? obj.simulatedRiskScore;
    obj.hypotheticalNodes = obj.hypotheticalNodes || (obj.modifications?.addedHypotheticalEntities || []).map((e) => ({
        id: e.id,
        label: e.name || e.label || 'Hypothetical',
        type: e.type || 'PERSON',
        riskScore: 65,
    }));
    obj.hypotheticalEdges = obj.hypotheticalEdges || (obj.modifications?.addedHypotheticalRelationships || []).map((r) => ({
        source: r.source,
        target: r.target,
        type: r.relationshipType || 'ASSOCIATED_WITH',
    }));
    obj.removedEntityIds = obj.removedEntityIds || obj.modifications?.excludedEntityIds || [];
    return obj;
};
// Get simulations for a case
const getSimulations = async (req, res, next) => {
    try {
        const { caseId } = req.params;
        let resolvedCaseId = caseId;
        if (caseId && !mongoose_1.default.Types.ObjectId.isValid(caseId)) {
            const caseDoc = await Case_1.Case.findOne({ caseId });
            if (caseDoc)
                resolvedCaseId = caseDoc._id.toString();
        }
        const simulations = await Simulation_1.Simulation.find({ caseId: resolvedCaseId }).sort({ createdAt: -1 });
        res.json({ success: true, data: simulations.map(formatSimulation) });
    }
    catch (err) {
        next(err);
    }
};
exports.getSimulations = getSimulations;
// Create a new What-If Simulation
const createSimulation = async (req, res, next) => {
    try {
        const { caseId, title, name, description, hypothesis, excludedRelationshipIds = [], excludedEntityIds = [], removedEntityIds = [], addedHypotheticalEntities = [], hypotheticalNodes = [], addedHypotheticalRelationships = [], hypotheticalEdges = [], } = req.body;
        const finalTitle = title || name || 'Hypothetical Scenario Branch';
        const finalHypothesis = hypothesis || description || `Simulating counterfactual adjustments for ${finalTitle}`;
        if (!caseId) {
            return next((0, errorHandler_1.createError)('caseId is required', 400));
        }
        const caseDoc = mongoose_1.default.Types.ObjectId.isValid(caseId)
            ? await Case_1.Case.findById(caseId)
            : await Case_1.Case.findOne({ caseId });
        if (!caseDoc)
            return next((0, errorHandler_1.createError)('Case not found', 404));
        const finalExcludedRelationships = Array.isArray(excludedRelationshipIds) ? excludedRelationshipIds : [];
        const finalExcludedEntities = excludedEntityIds.length > 0
            ? excludedEntityIds
            : (Array.isArray(removedEntityIds) ? removedEntityIds : []);
        const finalAddedEntities = addedHypotheticalEntities.length > 0
            ? addedHypotheticalEntities
            : (Array.isArray(hypotheticalNodes)
                ? hypotheticalNodes.map((hn) => ({
                    id: hn.id || (0, uuid_1.v4)(),
                    name: hn.label || hn.name || 'Hypothetical Node',
                    type: hn.type || 'PERSON',
                    riskLevel: hn.riskScore >= 70 ? 'HIGH' : hn.riskScore >= 40 ? 'MEDIUM' : 'LOW',
                    role: hn.label || 'Hypothetical',
                }))
                : []);
        const finalAddedRelationships = addedHypotheticalRelationships.length > 0
            ? addedHypotheticalRelationships
            : (Array.isArray(hypotheticalEdges)
                ? hypotheticalEdges.map((he) => ({
                    id: he.id || (0, uuid_1.v4)(),
                    source: he.source,
                    target: he.target,
                    relationshipType: he.type || he.relationshipType || 'ASSOCIATED_WITH',
                    strength: he.strength || 50,
                }))
                : []);
        const baselineRiskScore = caseDoc.riskScore || 75;
        // Recalculate hypothetical risk score based on what links/entities are excluded or added
        let simulatedRiskScore = baselineRiskScore;
        // Excluding suspicious links drops risk score
        const linkImpact = finalExcludedRelationships.length * 12;
        const entityImpact = finalExcludedEntities.length * 15;
        simulatedRiskScore = Math.max(15, simulatedRiskScore - linkImpact - entityImpact);
        // Adding hypothetical entities/relationships might increase or decrease depending on context
        const addedImpact = finalAddedEntities.length * 8;
        simulatedRiskScore = Math.min(99, simulatedRiskScore + addedImpact);
        const riskScoreDelta = simulatedRiskScore - baselineRiskScore;
        const comparisonSummary = riskScoreDelta < 0
            ? `Hypothesis reduces case complexity by ${Math.abs(riskScoreDelta)} points. Excluding ${finalExcludedRelationships.length} relationship(s) and ${finalExcludedEntities.length} entity/entities uncouples the central cluster.`
            : `Hypothesis introduces ${finalAddedEntities.length} new entity connection(s), increasing risk footprint by +${riskScoreDelta} points.`;
        const simulationId = `SIM-${Date.now().toString().slice(-6)}-${(0, uuid_1.v4)().slice(0, 4).toUpperCase()}`;
        const simulation = await Simulation_1.Simulation.create({
            caseId: caseDoc._id,
            simulationId,
            title: finalTitle,
            description: description || `Hypothetical investigation branch: ${finalTitle}`,
            hypothesis: finalHypothesis,
            modifications: {
                excludedRelationshipIds: finalExcludedRelationships,
                excludedEntityIds: finalExcludedEntities,
                addedHypotheticalEntities: finalAddedEntities,
                addedHypotheticalRelationships: finalAddedRelationships,
            },
            baselineRiskScore,
            simulatedRiskScore,
            riskScoreDelta,
            comparisonSummary,
            watermark: 'HYPOTHETICAL / SIMULATION',
            createdBy: req.user.id,
        });
        res.status(201).json({ success: true, data: formatSimulation(simulation) });
    }
    catch (err) {
        next(err);
    }
};
exports.createSimulation = createSimulation;
// Compare original vs simulated graph payload
const getSimulationComparison = async (req, res, next) => {
    try {
        const { id } = req.params;
        const simulation = mongoose_1.default.Types.ObjectId.isValid(id)
            ? await Simulation_1.Simulation.findById(id)
            : await Simulation_1.Simulation.findOne({ simulationId: id });
        if (!simulation)
            return next((0, errorHandler_1.createError)('Simulation not found', 404));
        const [realEntities, realRelationships] = await Promise.all([
            Entity_1.Entity.find({ caseId: simulation.caseId }),
            Relationship_1.Relationship.find({ caseId: simulation.caseId }).populate('sourceEntity', 'name type').populate('targetEntity', 'name type'),
        ]);
        // Construct original nodes & edges
        const originalNodes = realEntities.map(e => ({
            id: e._id.toString(),
            label: e.name,
            type: e.type,
            riskLevel: e.riskLevel,
            riskScore: e.riskScore,
            isHypothetical: false,
        }));
        const originalEdges = realRelationships.map(r => ({
            id: r._id.toString(),
            source: r.sourceEntity._id.toString(),
            target: r.targetEntity._id.toString(),
            label: r.relationshipType,
            strength: r.strength,
            isHypothetical: false,
        }));
        // Construct simulated nodes (filter out excluded, add hypothetical)
        const simulatedNodes = originalNodes
            .filter(n => !simulation.modifications.excludedEntityIds.includes(n.id))
            .concat(simulation.modifications.addedHypotheticalEntities.map(he => ({
            id: he.id || `hypo-${(0, uuid_1.v4)().slice(0, 6)}`,
            label: `[HYPO] ${he.name}`,
            type: (he.type || 'PERSON'),
            riskLevel: (he.riskLevel || 'MEDIUM'),
            riskScore: 50,
            isHypothetical: true,
        })));
        // Construct simulated edges (filter out excluded, add hypothetical)
        const simulatedEdges = originalEdges
            .filter(e => !simulation.modifications.excludedRelationshipIds.includes(e.id))
            .concat(simulation.modifications.addedHypotheticalRelationships.map(hr => ({
            id: hr.id || `hypo-edge-${(0, uuid_1.v4)().slice(0, 6)}`,
            source: hr.source,
            target: hr.target,
            label: `[HYPO] ${hr.relationshipType}`,
            strength: hr.strength || 50,
            isHypothetical: true,
        })));
        res.json({
            success: true,
            data: {
                simulation,
                original: { nodes: originalNodes, edges: originalEdges, riskScore: simulation.baselineRiskScore },
                simulated: { nodes: simulatedNodes, edges: simulatedEdges, riskScore: simulation.simulatedRiskScore },
                delta: simulation.riskScoreDelta,
                watermark: 'HYPOTHETICAL / SIMULATION',
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getSimulationComparison = getSimulationComparison;
// Delete simulation
const deleteSimulation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sim = mongoose_1.default.Types.ObjectId.isValid(id)
            ? await Simulation_1.Simulation.findByIdAndDelete(id)
            : await Simulation_1.Simulation.findOneAndDelete({ simulationId: id });
        if (!sim)
            return next((0, errorHandler_1.createError)('Simulation not found', 404));
        res.json({ success: true, message: 'Simulation deleted' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteSimulation = deleteSimulation;
//# sourceMappingURL=simulation.controller.js.map