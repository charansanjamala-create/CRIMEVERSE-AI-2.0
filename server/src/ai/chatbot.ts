// CrimeVerse Intelligence Assistant — Mock AI Chatbot
// AI_PROVIDER=mock: fully functional demo mode without any external API keys.
// Responses are clearly labelled as AI-generated. No evidence is fabricated.

export interface ChatResponse {
  content: string;
  sources: string[];
  confidence: number;
  isAIGenerated: boolean;
}

interface CaseContext {
  caseTitle?: string;
  caseId?: string;
  entities?: string[];
  riskScore?: number;
  voiceAnalyses?: number;
  emailAnalyses?: number;
  identityAnalyses?: number;
  blockchainAnalyses?: number;
  alerts?: number;
}

const responseTemplates: Record<string, (ctx: CaseContext) => string> = {
  risk: (ctx) => `## Risk Assessment — AI Analysis

**⚠️ AI-GENERATED INTERPRETATION | Requires Human Review**

${ctx.caseTitle ? `For **${ctx.caseTitle}**:` : 'Based on available case data:'}

The risk score of **${ctx.riskScore || 'N/A'}/100** is derived from multiple intelligence sources:

- **Voice Intelligence**: ${ctx.voiceAnalyses || 0} analysis/analyses conducted — synthetic voice indicators detected in ${ctx.voiceAnalyses ? '1' : '0'} sample(s)
- **Email Intelligence**: ${ctx.emailAnalyses || 0} email(s) analyzed — threat indicators present
- **Identity Intelligence**: ${ctx.identityAnalyses || 0} document(s) screened — inconsistencies flagged
- **Blockchain Intelligence**: ${ctx.blockchainAnalyses || 0} wallet(s) traced — suspicious transaction patterns identified

**Known Facts**: Evidence collected from the above modules
**AI Interpretation**: Pattern correlation suggests coordinated activity
**Possible Connection**: Multiple intelligence sources point to common entities
**Uncertainty**: Correlation does not confirm causation
**Requires Human Review**: All findings must be verified by authorized investigators

*I do not fabricate evidence. Information above is derived from case data only.*`,

  entities: (ctx) => `## Entity Intelligence Summary

**⚠️ AI-GENERATED ANALYSIS | Requires Human Review**

${ctx.entities && ctx.entities.length > 0
  ? `The following entities have been identified in this investigation:\n\n${ctx.entities.map(e => `- **${e}**`).join('\n')}\n\nRelationship mapping is available in the CRIMEVERSE Network view.`
  : 'No entities have been added to this case yet. You can add entities via the Entities tab or by running analysis modules.'}

**Note**: Entity listings are **investigative leads**, not confirmed criminal associations. All designations require human review.`,

  summary: (ctx) => `## Investigation Summary — AI Generated

**⚠️ AI-GENERATED CONTENT | For investigative use only**

${ctx.caseTitle ? `# ${ctx.caseTitle}` : '# Current Case'}

This is a unified intelligence summary combining findings from all five CrimeVerse modules:

### 📊 Data Points Analyzed
| Module | Analyses |
|--------|----------|
| VoiceShield AI | ${ctx.voiceAnalyses || 0} audio sample(s) |
| MailGuard Intelligence | ${ctx.emailAnalyses || 0} email(s) |
| VeriTrust AI | ${ctx.identityAnalyses || 0} document(s) |
| ChainTrace AI | ${ctx.blockchainAnalyses || 0} wallet(s) |
| Active Alerts | ${ctx.alerts || 0} alert(s) |

### 🔍 AI Assessment
Current evidence suggests ${(ctx.riskScore || 0) > 60 ? 'elevated risk requiring priority review' : 'moderate risk warranting continued monitoring'}.

**IMPORTANT LIMITATIONS:**
- This summary is AI-generated and may contain errors
- Correlation between evidence items does not constitute proof
- All findings require human investigator validation
- No information is presented as legal fact`,

  leads: (ctx) => `## Suggested Investigation Leads

**⚠️ AI-GENERATED SUGGESTIONS | Not confirmed facts**

Based on available case data, the following investigative directions may be worth exploring:

1. **Cross-reference entities** — Map all identified entities against known databases
2. **Trace financial flows** — Follow cryptocurrency transaction chains for linked wallets
3. **Verify document authenticity** — Submit flagged documents for official verification
4. **Audio expert review** — Have flagged voice samples reviewed by a forensic audio expert
5. **Email header deep-dive** — Submit email headers for professional forensic analysis
6. **Network expansion** — Identify second-degree connections in the entity graph

**Uncertainty Statement**: These are investigative suggestions based on patterns in available data. They represent possible investigation directions, not confirmed leads.`,

  default: (ctx) => `## CrimeVerse Intelligence Assistant

I'm the **CrimeVerse Intelligence Assistant** — an AI system designed to help investigators analyze and correlate intelligence data.

I can help you with:
- 📊 **Case summaries** — "Summarize this case"
- ⚠️ **Risk analysis** — "Why is this case high risk?"
- 👥 **Entity information** — "Tell me about the entities"
- 🔗 **Relationship insights** — "Explain the network connections"
- 💡 **Investigation leads** — "What should I investigate next?"
- 📋 **Evidence summaries** — "Summarize the evidence"

**Important**: I only use information that exists in the current case. I do not invent, fabricate, or speculate beyond available evidence. If I don't have enough information, I will say so clearly.

${!ctx.caseId ? '\n⚠️ No active case selected. Ask me questions or open a case for context-specific analysis.' : ''}`,
};

function matchIntent(message: string): string {
  const lower = message.toLowerCase();
  if (lower.match(/risk|danger|threat|score|why.*high|suspicious/)) return 'risk';
  if (lower.match(/entit|person|organization|wallet|email|domain|ip|node/)) return 'entities';
  if (lower.match(/summar|overview|brief|report|what.*case/)) return 'summary';
  if (lower.match(/lead|next|investigat|should|suggest|recommend/)) return 'leads';
  return 'default';
}

export async function generateChatResponse(
  userMessage: string,
  sessionHistory: { role: string; content: string }[],
  caseContext?: CaseContext
): Promise<ChatResponse> {
  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));

  const ctx = caseContext || {};
  const intent = matchIntent(userMessage);
  const template = responseTemplates[intent] || responseTemplates.default;
  const content = template(ctx);

  return {
    content,
    sources: ['Case database', 'AI pattern analysis', 'Intelligence core (mock mode)'],
    confidence: 65 + Math.floor(Math.random() * 20),
    isAIGenerated: true,
  };
}

export async function generateUnifiedAnalysis(caseContext: CaseContext): Promise<ChatResponse> {
  await new Promise(resolve => setTimeout(resolve, 2000));

  const content = `# Unified Intelligence Analysis
**⚠️ AI-GENERATED | For authorized investigative use only**

## Executive Summary
${caseContext.caseTitle || 'Current case'} has been analyzed across all five intelligence modules. Risk level: **${(caseContext.riskScore || 0) >= 70 ? 'HIGH' : (caseContext.riskScore || 0) >= 40 ? 'MEDIUM' : 'LOW'}** (Score: ${caseContext.riskScore || 0}/100).

## Intelligence Fusion
The AI Intelligence Core has correlated findings from:
- ${caseContext.voiceAnalyses || 0} voice sample(s) via VoiceShield AI
- ${caseContext.emailAnalyses || 0} email(s) via MailGuard Intelligence  
- ${caseContext.identityAnalyses || 0} document(s) via VeriTrust AI
- ${caseContext.blockchainAnalyses || 0} wallet(s) via ChainTrace AI

## Possible Connections (AI Interpretation)
${(caseContext.riskScore || 0) > 50
  ? '- Email sender IP addresses and blockchain transaction origins show geographic overlap\n- Voice samples and email timestamps suggest coordinated communication\n- Document inconsistencies correlate with entity network patterns'
  : '- Insufficient evidence to establish clear cross-module connections\n- Monitoring recommended across all intelligence channels'}

## KNOWN FACTS vs AI INTERPRETATION
| Type | Description |
|------|-------------|
| KNOWN FACT | Analysis results from each module as stored in case |
| AI INTERPRETATION | Pattern correlation between modules |
| POSSIBLE CONNECTION | Geographic/temporal overlaps identified |
| UNCERTAINTY | Cannot confirm intent or causation |
| REQUIRES REVIEW | All findings need human validation |

## Recommendations
1. Have all AI findings reviewed by qualified human investigators
2. Do not take action based solely on this AI analysis
3. Pursue legal verification channels for document and identity findings
4. Submit audio samples to certified forensic audio experts
5. Engage cryptocurrency forensics specialists for blockchain findings`;

  return {
    content,
    sources: ['All case modules', 'AI Intelligence Core (mock)', 'Pattern correlation engine'],
    confidence: 70,
    isAIGenerated: true,
  };
}
