import mongoose from 'mongoose';
import { User } from '../models/User';
import { Case } from '../models/Case';
import { Entity } from '../models/Entity';
import { Evidence } from '../models/Evidence';
import { VoiceAnalysis } from '../models/VoiceAnalysis';
import { EmailAnalysis } from '../models/EmailAnalysis';
import { IdentityAnalysis } from '../models/IdentityAnalysis';
import { BlockchainAnalysis } from '../models/BlockchainAnalysis';
import { Relationship } from '../models/Relationship';
import { TimelineEvent } from '../models/TimelineEvent';
import { Alert } from '../models/Alert';
import { InvestigationReport } from '../models/InvestigationReport';
import { Camera } from '../models/Camera';
import { GeoIncident, PatrolUnit } from '../models/GeoIncident';
import { SmsDispatch } from '../models/SmsDispatch';
import { Complaint } from '../models/Complaint';
import { LocationRecord } from '../models/LocationRecord';
import { AIFinding } from '../models/AIFinding';
import { Simulation } from '../models/Simulation';
import { Escalation } from '../models/Escalation';
import { logger } from '../utils/logger';

export async function seedDatabase(): Promise<void> {
  const existingAdmin = await User.findOne({ email: 'admin@crimeverse.demo' });
  if (existingAdmin) {
    const cameraCount = await Camera.countDocuments();
    const phoenixCase = await Case.findOne({ caseId: 'CV-PHOENIX-2024-001' });
    if (cameraCount === 0) {
      await seedTacticalData(phoenixCase?._id, existingAdmin._id);
    }
    const complaintCount = await Complaint.countDocuments();
    if (complaintCount === 0) {
      await seedEnterpriseModules(phoenixCase?._id, existingAdmin._id);
    }
    logger.info('🌱 Database already seeded — enterprise modules checked');
    return;
  }

  logger.info('🌱 Seeding database with demo data...');

  // ─── USERS ───────────────────────────────────────────────────────────────
  const [admin, investigator, analyst] = await User.create([
    { name: 'Admin User', email: 'admin@crimeverse.demo', password: 'CrimeVerse@2024!', role: 'ADMIN' },
    { name: 'Agent Sarah Chen', email: 'investigator@crimeverse.demo', password: 'CrimeVerse@2024!', role: 'INVESTIGATOR' },
    { name: 'Dr. Raj Patel', email: 'analyst@crimeverse.demo', password: 'CrimeVerse@2024!', role: 'ANALYST' },
  ]);

  logger.info('✅ Users created');

  // ─── OPERATION PHOENIX CASE ───────────────────────────────────────────────
  const phoenixCase = await Case.create({
    caseId: 'CV-PHOENIX-2024-001',
    title: 'Operation Phoenix',
    description: 'Multi-jurisdiction investigation into a coordinated financial fraud and identity theft network operating across digital channels. Investigation spans voice cloning impersonation attacks, phishing email campaigns, forged documentation, and cryptocurrency money laundering through multiple exchange platforms.',
    status: 'ACTIVE',
    priority: 'CRITICAL',
    assignedTo: investigator._id,
    createdBy: admin._id,
    tags: ['financial-fraud', 'identity-theft', 'cryptocurrency', 'voice-cloning', 'phishing', 'sih2024'],
    riskScore: 87,
    entityCount: 0,
    evidenceCount: 0,
    alertCount: 0,
    lastActivityAt: new Date(),
  });

  const caseId = phoenixCase._id;
  logger.info('✅ Operation Phoenix case created');

  // ─── ENTITIES ─────────────────────────────────────────────────────────────
  const [
    entityViktor, entityMaria, entityJames, entityPriya, entityShadowOrg, entityPhantomEx,
    entityWallet1, entityWallet2, entityWallet3,
    entityEmail1, entityEmail2, entityIP1, entityIP2, entityDomain1,
  ] = await Entity.create([
    { caseId, type: 'PERSON', name: 'Viktor Lazarov', identifier: 'VL-SUSPECT-001', riskLevel: 'HIGH', riskScore: 85,
      description: 'Suspected primary operator. Known aliases: "Phoenix", "V.L.", "Victor L."', aliases: ['Phoenix', 'V.L.'], createdBy: investigator._id,
      attributes: { dob: '1979-03-15', nationality: 'Unknown', lastKnownLocation: 'Eastern Europe', communicationMethod: 'Encrypted messaging' } },
    { caseId, type: 'PERSON', name: 'Maria Cortez', identifier: 'MC-SUSPECT-002', riskLevel: 'HIGH', riskScore: 72,
      description: 'Suspected identity document specialist. Possible connection to Viktor Lazarov.', aliases: ['M.C.', 'MariaC'], createdBy: investigator._id,
      attributes: { dob: '1985-07-22', nationality: 'Unknown', role: 'Document Specialist' } },
    { caseId, type: 'PERSON', name: 'James Okafor', identifier: 'JO-PERSON-003', riskLevel: 'MEDIUM', riskScore: 45,
      description: 'Possible unwitting intermediary. Bank account used for fund transfers. REQUIRES REVIEW — may be a victim.', createdBy: investigator._id,
      requiresReview: true, attributes: { role: 'Possible intermediary or victim', status: 'Under review' } },
    { caseId, type: 'PERSON', name: 'Priya Sharma', identifier: 'PS-VICTIM-004', riskLevel: 'LOW', riskScore: 10,
      description: 'Confirmed victim of voice cloning impersonation attack. Identity used without consent.', createdBy: investigator._id,
      requiresReview: false, attributes: { role: 'Victim', consent: false } },
    { caseId, type: 'ORGANIZATION', name: 'ShadowTech Solutions Ltd.', identifier: 'STS-ORG-001', riskLevel: 'HIGH', riskScore: 82,
      description: 'Shell company suspected of providing technical infrastructure for the network. Registered in multiple jurisdictions.', createdBy: investigator._id,
      attributes: { registrationCountry: 'Offshore', businessType: 'Technology Services', suspectedRole: 'Infrastructure provider' } },
    { caseId, type: 'ORGANIZATION', name: 'PhantomEx Exchange', identifier: 'PEX-ORG-002', riskLevel: 'HIGH', riskScore: 79,
      description: 'Unregulated peer-to-peer cryptocurrency exchange suspected of facilitating money laundering.', createdBy: investigator._id,
      attributes: { exchangeType: 'P2P', regulatoryStatus: 'Unregulated', flaggedJurisdictions: ['Eastern Europe', 'Southeast Asia'] } },
    { caseId, type: 'WALLET', name: 'Wallet Alpha', identifier: '0x7a2f8e9b3c1d4a5f6e7b8c9d0e1f2a3b4c5d6e7f', riskLevel: 'HIGH', riskScore: 82,
      description: 'Primary suspected layering wallet. Multiple suspicious outbound transactions.', createdBy: investigator._id,
      attributes: { blockchain: 'ETH', estimatedBalance: '$45,200', firstSeen: '2024-01-15', lastActivity: '2024-06-30' } },
    { caseId, type: 'WALLET', name: 'Wallet Beta', identifier: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d', riskLevel: 'MEDIUM', riskScore: 58,
      description: 'Intermediate wallet. Receives from Wallet Alpha and distributes to multiple endpoints.', createdBy: investigator._id,
      attributes: { blockchain: 'ETH', estimatedBalance: '$12,800', linkedToAlpha: true } },
    { caseId, type: 'WALLET', name: 'Wallet Gamma (Exchange)', identifier: '0x9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', riskLevel: 'HIGH', riskScore: 71,
      description: 'Suspected PhantomEx exchange wallet. Final destination for laundered funds.', createdBy: investigator._id,
      attributes: { blockchain: 'ETH', linkedExchange: 'PhantomEx', estimatedBalance: '$89,000' } },
    { caseId, type: 'EMAIL', name: 'sender.phoenix@tempmail.io', identifier: 'sender.phoenix@tempmail.io', riskLevel: 'HIGH', riskScore: 88,
      description: 'Disposable email address used to send phishing emails to victims.', createdBy: investigator._id,
      attributes: { provider: 'TempMail', firstSeen: '2024-02-10', emailCount: 47 } },
    { caseId, type: 'EMAIL', name: 'shadowtech.contact@proton.me', identifier: 'shadowtech.contact@proton.me', riskLevel: 'MEDIUM', riskScore: 52,
      description: 'Email address associated with ShadowTech Solutions communications.', createdBy: investigator._id,
      attributes: { provider: 'ProtonMail', linkedOrg: 'ShadowTech Solutions Ltd.' } },
    { caseId, type: 'IP', name: 'IP 185.220.101.42', identifier: '185.220.101.42', riskLevel: 'HIGH', riskScore: 78,
      description: 'TOR exit node IP. Multiple phishing emails originated from this address.', createdBy: investigator._id,
      attributes: { country: 'Romania', isTorExitNode: true, abuseReports: 12 } },
    { caseId, type: 'IP', name: 'IP 91.108.4.18', identifier: '91.108.4.18', riskLevel: 'MEDIUM', riskScore: 55,
      description: 'VPN IP address associated with account login attempts.', createdBy: investigator._id,
      attributes: { country: 'Netherlands', isVPN: true, provider: 'Unknown VPN service' } },
    { caseId, type: 'DOMAIN', name: 'secure-bank-verify.com', identifier: 'secure-bank-verify.com', riskLevel: 'CRITICAL', riskScore: 94,
      description: 'Suspected phishing domain mimicking legitimate banking portals. Registered 3 days before phishing campaign launched.', createdBy: investigator._id,
      attributes: { registrar: 'Unknown', registrationDate: '2024-02-07', hostingIP: '185.220.101.42', mimedDomain: 'nationalbank.com' } },
  ]);

  // Update entity count
  await Case.findByIdAndUpdate(caseId, { entityCount: 14 });
  logger.info('✅ Entities created');

  // ─── RELATIONSHIPS ────────────────────────────────────────────────────────
  await Relationship.create([
    { caseId, sourceEntity: entityViktor._id, targetEntity: entityShadowOrg._id, relationshipType: 'Associated With', strength: 75, confidence: 68, description: 'Financial records suggest Viktor controls ShadowTech through nominees', isConfirmed: false, requiresReview: true, createdBy: investigator._id },
    { caseId, sourceEntity: entityViktor._id, targetEntity: entityWallet1._id, relationshipType: 'Controls', strength: 82, confidence: 74, description: 'Wallet Alpha transaction patterns consistent with Viktor\'s known activity periods', isConfirmed: false, requiresReview: true, createdBy: investigator._id },
    { caseId, sourceEntity: entityViktor._id, targetEntity: entityEmail1._id, relationshipType: 'Used', strength: 70, confidence: 65, description: 'Email creation timing and usage pattern matches Viktor profile', isConfirmed: false, requiresReview: true, createdBy: investigator._id },
    { caseId, sourceEntity: entityMaria._id, targetEntity: entityViktor._id, relationshipType: 'Communicated With', strength: 60, confidence: 55, description: 'Communication metadata shows contact between Maria and Viktor', isConfirmed: false, requiresReview: true, createdBy: investigator._id },
    { caseId, sourceEntity: entityWallet1._id, targetEntity: entityWallet2._id, relationshipType: 'Transferred To', strength: 95, confidence: 98, description: 'Direct on-chain transaction confirmed', isConfirmed: true, requiresReview: false, createdBy: investigator._id },
    { caseId, sourceEntity: entityWallet2._id, targetEntity: entityWallet3._id, relationshipType: 'Transferred To', strength: 90, confidence: 95, description: 'Direct on-chain transaction confirmed', isConfirmed: true, requiresReview: false, createdBy: investigator._id },
    { caseId, sourceEntity: entityWallet3._id, targetEntity: entityPhantomEx._id, relationshipType: 'Associated With', strength: 75, confidence: 70, description: 'Wallet Gamma linked to PhantomEx exchange address', isConfirmed: false, requiresReview: true, createdBy: investigator._id },
    { caseId, sourceEntity: entityShadowOrg._id, targetEntity: entityPhantomEx._id, relationshipType: 'Potentially Connected', strength: 45, confidence: 40, description: 'Shared technical infrastructure signature detected', isConfirmed: false, requiresReview: true, createdBy: investigator._id },
    { caseId, sourceEntity: entityEmail1._id, targetEntity: entityIP1._id, relationshipType: 'Originated From', strength: 88, confidence: 85, description: 'Email headers trace to this IP address', isConfirmed: true, requiresReview: false, createdBy: investigator._id },
    { caseId, sourceEntity: entityEmail1._id, targetEntity: entityDomain1._id, relationshipType: 'Referenced', strength: 92, confidence: 90, description: 'Phishing emails contain links to this domain', isConfirmed: true, requiresReview: false, createdBy: investigator._id },
    { caseId, sourceEntity: entityViktor._id, targetEntity: entityPriya._id, relationshipType: 'Targeted', strength: 65, confidence: 60, description: 'Priya identified as victim of voice cloning attack attributed to this network', isConfirmed: false, requiresReview: true, createdBy: investigator._id },
    { caseId, sourceEntity: entityJames._id, targetEntity: entityWallet1._id, relationshipType: 'Potentially Connected', strength: 35, confidence: 30, description: 'Bank account linked to wallet — James may be victim or intermediary', isConfirmed: false, requiresReview: true, createdBy: investigator._id },
    { caseId, sourceEntity: entityIP1._id, targetEntity: entityDomain1._id, relationshipType: 'Hosts', strength: 90, confidence: 88, description: 'IP address hosts the phishing domain', isConfirmed: true, requiresReview: false, createdBy: investigator._id },
    { caseId, sourceEntity: entityEmail2._id, targetEntity: entityShadowOrg._id, relationshipType: 'Associated With', strength: 55, confidence: 50, description: 'Email address registered with ShadowTech business details', isConfirmed: false, requiresReview: true, createdBy: investigator._id },
    { caseId, sourceEntity: entityIP2._id, targetEntity: entityViktor._id, relationshipType: 'Potentially Connected', strength: 42, confidence: 38, description: 'Login attempts from this VPN IP match Viktor\'s timezone patterns', isConfirmed: false, requiresReview: true, createdBy: investigator._id },
  ]);

  logger.info('✅ Relationships created');

  // ─── VOICE ANALYSES ───────────────────────────────────────────────────────
  await VoiceAnalysis.create([
    {
      caseId, fileName: 'victim_priya_voicemail.mp3', fileSize: 1245678, duration: 45,
      suspicionScore: 84, riskLevel: 'HIGH',
      verdict: 'POSSIBLE SYNTHETIC VOICE — Requires immediate human review',
      indicators: [
        { name: 'Spectral Inconsistency', description: 'Unusual frequency distribution in vocal range 2-4kHz', severity: 'HIGH', confidence: 81 },
        { name: 'Pitch Modulation Anomaly', description: 'Pitch variance pattern inconsistent with Priya\'s confirmed voice samples', severity: 'HIGH', confidence: 76 },
        { name: 'Formant Trajectory Deviation', description: 'Vowel formant transitions deviate from natural patterns', severity: 'HIGH', confidence: 82 },
        { name: 'Mel-Frequency Cepstral Anomaly', description: 'MFCC features show statistical outliers', severity: 'MEDIUM', confidence: 71 },
      ],
      spectralAnalysis: { fundamentalFrequency: { mean: 210, std: 8, unit: 'Hz' }, harmonicToNoiseRatio: { value: 6.2, unit: 'dB' }, spectralFlux: { value: 0.58, anomalous: true } },
      temporalFeatures: { speechRate: { value: 5.1, unit: 'syllables/sec', anomalous: true }, jitterLocal: { value: '4.2%', threshold: '2%', flagged: true } },
      modelFindings: [
        'VoiceClone Detector v2.3: Probability of synthetic origin — 84%',
        'GAN Artifact Scanner: Artifacts detected in 2-4kHz frequency band',
        'WaveNet Pattern Analysis: High similarity to known TTS generation patterns',
        'IMPORTANT: This is an AI-generated indicator requiring expert human review',
      ],
      disclaimer: 'AI analysis only — expert human review required before any action',
      requiresHumanReview: true, analyzedBy: investigator._id, analysisProvider: 'mock',
    },
    {
      caseId, fileName: 'unknown_caller_recording.wav', fileSize: 892340, duration: 28,
      suspicionScore: 61, riskLevel: 'MEDIUM',
      verdict: 'SUSPICIOUS INDICATORS DETECTED — Review recommended',
      indicators: [
        { name: 'Background Noise Discontinuity', description: 'Sudden ambient noise level changes suggest possible audio editing', severity: 'MEDIUM', confidence: 67 },
        { name: 'Temporal Jitter', description: 'Micro-timing irregularities in phoneme transitions', severity: 'LOW', confidence: 54 },
        { name: 'Pitch Modulation Anomaly', description: 'Some pitch patterns outside natural range', severity: 'MEDIUM', confidence: 62 },
      ],
      spectralAnalysis: { fundamentalFrequency: { mean: 148, std: 18, unit: 'Hz' }, harmonicToNoiseRatio: { value: 11.5, unit: 'dB' } },
      temporalFeatures: { speechRate: { value: 4.6, unit: 'syllables/sec', anomalous: false } },
      modelFindings: ['VoiceClone Detector v2.3: Probability of synthetic origin — 61%', 'Inconclusive — review recommended'],
      disclaimer: 'AI analysis only — expert human review required',
      requiresHumanReview: true, analyzedBy: analyst._id, analysisProvider: 'mock',
    },
  ]);

  logger.info('✅ Voice analyses created');

  // ─── EMAIL ANALYSES ───────────────────────────────────────────────────────
  await EmailAnalysis.create([
    {
      caseId,
      subject: 'URGENT: Your account has been suspended - Verify immediately',
      rawContent: `From: "National Bank Security" <sender.phoenix@tempmail.io>\nTo: victim@example.com\nReply-To: recovery.team@secure-bank-verify.com\nSubject: URGENT: Your account has been suspended\n\nDear Customer,\n\nYour account has been suspended due to suspicious activity. You must verify immediately by clicking the link below or your account will be permanently closed.\n\nVerify now: http://secure-bank-verify.com/verify?id=892hfj2\n\nSend $500 in Bitcoin to wallet 0x7a2f8e9b3c1d4a5f6e7b8c9d0e1f2a3b4c5d6e7f for account restoration fee.\n\nX-Originating-IP: 185.220.101.42\n\nBank Security Team`,
      senderEmail: 'sender.phoenix@tempmail.io',
      senderName: 'National Bank Security',
      recipientEmails: ['victim@example.com'],
      replyTo: 'recovery.team@secure-bank-verify.com',
      extractedIPs: [{ ip: '185.220.101.42', isSuspicious: true, geolocation: { country: 'Romania', city: 'Bucharest', lat: '44.4268', lng: '26.1025', isp: 'TOR Exit Node' } }],
      extractedURLs: [{ url: 'http://secure-bank-verify.com/verify?id=892hfj2', domain: 'secure-bank-verify.com', isSuspicious: true, threat: 'Phishing page mimicking bank portal' }],
      extractedDomains: ['secure-bank-verify.com', 'tempmail.io'],
      extractedWallets: ['0x7a2f8e9b3c1d4a5f6e7b8c9d0e1f2a3b4c5d6e7f'],
      headers: { spf: 'FAIL', dkim: 'FAIL', dmarc: 'NONE', receivedFrom: '185.220.101.42' },
      threatScore: 95, riskLevel: 'HIGH',
      threatCategories: ['PHISHING', 'FINANCIAL_FRAUD', 'CRYPTO_FRAUD'],
      indicators: [
        { name: 'Reply-To Mismatch', description: 'Reply-To differs from sender — classic phishing indicator', severity: 'HIGH' },
        { name: 'Suspicious Keywords', description: 'Contains: urgent, suspended, bitcoin, verify account', severity: 'HIGH' },
        { name: 'Cryptocurrency Address', description: 'Ethereum wallet address embedded in email body', severity: 'HIGH' },
        { name: 'SPF/DKIM Failure', description: 'Email authentication checks failed', severity: 'HIGH' },
        { name: 'TOR Exit Node Origin', description: 'Email originated from TOR network exit node', severity: 'HIGH' },
      ],
      spfStatus: 'FAIL', dkimStatus: 'FAIL', dmarcStatus: 'NONE',
      forensicSummary: 'HIGH CONFIDENCE phishing email with cryptocurrency fraud component. Email fails all authentication checks and originates from known TOR exit node. Wallet address extracted for ChainTrace analysis. Requires immediate human review.',
      requiresHumanReview: true, analyzedBy: investigator._id,
    },
    {
      caseId,
      subject: 'RE: Partnership Proposal — ShadowTech Solutions',
      rawContent: `From: shadowtech.contact@proton.me\nTo: business@targetcompany.com\nSubject: RE: Partnership Proposal\n\nDear Sir/Madam,\n\nThank you for your interest in our technical services. We offer cryptocurrency payment processing and identity verification bypass services.\n\nPlease transfer initial consultation fee to: 0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d\n\nX-Originating-IP: 91.108.4.18\n\nRegards,\nShadowTech Team`,
      senderEmail: 'shadowtech.contact@proton.me',
      senderName: 'ShadowTech Team',
      recipientEmails: ['business@targetcompany.com'],
      extractedIPs: [{ ip: '91.108.4.18', isSuspicious: true, geolocation: { country: 'Netherlands', city: 'Amsterdam', isVPN: true } }],
      extractedURLs: [],
      extractedDomains: ['proton.me'],
      extractedWallets: ['0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d'],
      headers: { spf: 'PASS', dkim: 'PASS', receivedFrom: '91.108.4.18' },
      threatScore: 72, riskLevel: 'HIGH',
      threatCategories: ['FINANCIAL_FRAUD', 'CRYPTO_FRAUD'],
      indicators: [
        { name: 'Cryptocurrency Address', description: 'ETH wallet address in business correspondence', severity: 'HIGH' },
        { name: 'VPN Origin', description: 'Email sent through VPN — identity obscured', severity: 'MEDIUM' },
        { name: 'Suspicious Service Offering', description: '"Identity verification bypass" services — potential criminal service', severity: 'HIGH' },
      ],
      spfStatus: 'PASS', dkimStatus: 'PASS', dmarcStatus: 'NONE',
      forensicSummary: 'Business email with cryptocurrency payment request and suspicious service offering. Wallet address matches ShadowTech entity. Requires human review.',
      requiresHumanReview: true, analyzedBy: analyst._id,
    },
    {
      caseId,
      subject: 'Spear Phishing: CEO Voice Message',
      rawContent: `From: ceo.message@secure-bank-verify.com\nTo: finance@targetcorp.com\nSubject: Urgent wire transfer required\n\nHi,\n\nThis is the CEO. I need you to initiate an urgent wire transfer of $50,000 to our new vendor. I've left a voicemail with details. Please do this before 3PM today.\n\nX-Originating-IP: 185.220.101.42\n\nThanks`,
      senderEmail: 'ceo.message@secure-bank-verify.com',
      recipientEmails: ['finance@targetcorp.com'],
      extractedIPs: [{ ip: '185.220.101.42', isSuspicious: true, geolocation: { country: 'Romania', isTorExitNode: true } }],
      extractedURLs: [],
      extractedDomains: ['secure-bank-verify.com'],
      extractedWallets: [],
      headers: { spf: 'FAIL', dkim: 'FAIL' },
      threatScore: 88, riskLevel: 'HIGH',
      threatCategories: ['PHISHING', 'FINANCIAL_FRAUD', 'BEC'],
      indicators: [
        { name: 'Business Email Compromise Pattern', description: 'CEO impersonation requesting urgent wire transfer — classic BEC indicator', severity: 'HIGH' },
        { name: 'Suspicious Domain', description: 'Sent from phishing domain secure-bank-verify.com', severity: 'HIGH' },
        { name: 'Urgency Manipulation', description: 'Artificial time pressure — social engineering tactic', severity: 'HIGH' },
        { name: 'Voice Reference', description: 'References voicemail — possible link to voice cloning module', severity: 'HIGH' },
      ],
      spfStatus: 'FAIL', dkimStatus: 'FAIL', dmarcStatus: 'NONE',
      forensicSummary: 'Spear phishing email with BEC pattern and possible voice cloning integration. Same TOR IP as primary phishing campaign. High confidence cross-module connection.',
      requiresHumanReview: true, analyzedBy: investigator._id,
    },
  ]);

  logger.info('✅ Email analyses created');

  // ─── IDENTITY ANALYSES ────────────────────────────────────────────────────
  await IdentityAnalysis.create([
    {
      caseId, documentType: 'PASSPORT', documentNumber: 'A12345678',
      subjectName: 'Viktor Lazarov', dateOfBirth: '1979-03-15', nationality: 'Unknown',
      issuingAuthority: 'Unknown Ministry of Interior', issueDate: '2020-01-01', expiryDate: '2030-01-01',
      fileName: 'passport_suspect1.pdf',
      extractedFields: { documentNumber: 'A12345678', surname: 'Lazarov', givenNames: 'Viktor', nationality: 'Unknown' },
      inconsistencies: [
        { field: 'metadata', description: 'PDF metadata creation date is 3 years before stated issue date', severity: 'HIGH' },
        { field: 'documentNumber', description: 'Document number format does not match stated issuing country standards', severity: 'HIGH' },
        { field: 'nationality', description: 'Nationality field contains "Unknown" — not a valid ISO country code', severity: 'MEDIUM' },
      ],
      riskScore: 78, verificationStatus: 'REQUIRES_VERIFICATION', riskLevel: 'HIGH',
      indicators: [
        { name: 'Multiple Field Inconsistencies', description: '3 inconsistencies detected across document fields', severity: 'HIGH' },
        { name: 'Metadata Anomaly', description: 'Document creation predates stated issue date', severity: 'HIGH' },
        { name: 'Format Violation', description: 'Document number does not comply with ICAO standards', severity: 'HIGH' },
      ],
      metadataFlags: ['PDF creation date predates issue date by 3 years', 'Low-resolution image DPI inconsistent with official documents'],
      disclaimer: 'Analysis does not constitute legal verification. Human expert review is mandatory.',
      requiresHumanReview: true, analyzedBy: investigator._id,
    },
    {
      caseId, documentType: 'NATIONAL_ID', documentNumber: 'ID-98765432',
      subjectName: 'Maria Cortez', dateOfBirth: '1985-07-22', nationality: 'Unknown',
      issuingAuthority: 'City Government Office', issueDate: '2023-06-15', expiryDate: '2028-06-15',
      fileName: 'national_id_suspect2.jpg',
      extractedFields: { idNumber: 'ID-98765432', fullName: 'Maria Cortez', dateOfBirth: '1985-07-22' },
      inconsistencies: [
        { field: 'idNumber', description: 'ID number format does not match official government standards for stated issuing authority', severity: 'HIGH' },
        { field: 'fonts', description: 'Visual analysis suggests inconsistent font weights across document fields', severity: 'MEDIUM' },
      ],
      riskScore: 62, verificationStatus: 'SUSPICIOUS — Review Recommended', riskLevel: 'HIGH',
      indicators: [
        { name: 'ID Number Format Violation', description: 'Number format inconsistent with issuing authority standards', severity: 'HIGH' },
        { name: 'Visual Consistency Issue', description: 'Possible inconsistent typography detected', severity: 'MEDIUM' },
      ],
      metadataFlags: ['Image compression artifacts around text fields'],
      disclaimer: 'Analysis does not constitute legal verification. Human expert review is mandatory.',
      requiresHumanReview: true, analyzedBy: analyst._id,
    },
  ]);

  logger.info('✅ Identity analyses created');

  // ─── BLOCKCHAIN ANALYSES ──────────────────────────────────────────────────
  const txTime = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000);

  await BlockchainAnalysis.create([
    {
      caseId, walletAddress: '0x7a2f8e9b3c1d4a5f6e7b8c9d0e1f2a3b4c5d6e7f', blockchain: 'ETH',
      riskScore: 82, riskLevel: 'HIGH', transactionCount: 124, totalValueUSD: 245000, suspiciousTransactions: 38,
      indicators: [
        { name: 'Rapid Fund Movement', description: 'Multiple outbound transfers within 2-hour windows — possible layering', severity: 'HIGH' },
        { name: 'Mixer Interaction', description: 'Two transactions route through suspected cryptocurrency mixer', severity: 'HIGH' },
        { name: 'High-Volume Low-Value Transactions', description: 'Pattern of many small transactions consistent with structuring', severity: 'MEDIUM' },
      ],
      transactions: [
        { txHash: '0xabc123def456789012345678901234567890abcdef1234567890abcdef123456', from: '0x7a2f8e9b3c1d4a5f6e7b8c9d0e1f2a3b4c5d6e7f', to: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d', value: 12500, timestamp: txTime(5), isSuspicious: true, suspicionReason: 'Rapid sequence transfer' },
        { txHash: '0xdef456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01', from: '0xexternal001', to: '0x7a2f8e9b3c1d4a5f6e7b8c9d0e1f2a3b4c5d6e7f', value: 50000, timestamp: txTime(12), isSuspicious: true, suspicionReason: 'Large round-number deposit' },
        { txHash: '0x789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456', from: '0x7a2f8e9b3c1d4a5f6e7b8c9d0e1f2a3b4c5d6e7f', to: '0xmixer001', value: 9999, timestamp: txTime(20), isSuspicious: true, suspicionReason: 'Known mixer address interaction' },
        { txHash: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01', from: '0x7a2f8e9b3c1d4a5f6e7b8c9d0e1f2a3b4c5d6e7f', to: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d', value: 3500, timestamp: txTime(30), isSuspicious: false },
      ],
      relatedWallets: [
        { address: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d', relationship: 'Transferred To', riskScore: 58 },
        { address: '0xmixer001exampleaddress12345678901234567890', relationship: 'Sent to mixer', riskScore: 85 },
      ],
      exchangeConnections: [
        { name: 'PhantomEx Exchange', type: 'PEER_TO_PEER', flagged: true },
        { name: 'LocalBitcoins', type: 'PEER_TO_PEER', flagged: true },
      ],
      patternAnalysis: { averageTransactionValue: '1975.81', transactionFrequency: '1.38 tx/day', concentrationRisk: 'HIGH', layeringIndicators: 'DETECTED', dormancyPeriods: 2 },
      investigationTimeline: [
        { date: txTime(90), event: 'WALLET_CREATED', details: 'First transaction detected — wallet receives initial 50 ETH' },
        { date: txTime(60), event: 'SUSPICIOUS_ACTIVITY', details: 'First mixer interaction detected' },
        { date: txTime(30), event: 'HIGH_VOLUME', details: 'Significant increase in transaction frequency' },
        { date: txTime(5), event: 'RECENT_TRANSFER', details: 'Large transfer to Wallet Beta matches phishing campaign timeline' },
      ],
      disclaimer: 'Synthetic/demo data. Requires human expert review and legal process before any action.',
      requiresHumanReview: true, analyzedBy: investigator._id,
    },
    {
      caseId, walletAddress: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d', blockchain: 'ETH',
      riskScore: 58, riskLevel: 'MEDIUM', transactionCount: 67, totalValueUSD: 128000, suspiciousTransactions: 18,
      indicators: [
        { name: 'Intermediate Layering Pattern', description: 'Receives from high-risk wallet and rapidly redistributes', severity: 'MEDIUM' },
        { name: 'High-Volume Low-Value Transactions', description: 'Structuring pattern detected in outbound transactions', severity: 'MEDIUM' },
      ],
      transactions: [
        { txHash: '0xabc111222333444555666777888999000aabbccddeeff0011223344556677889', from: '0x7a2f8e9b3c1d4a5f6e7b8c9d0e1f2a3b4c5d6e7f', to: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d', value: 12500, timestamp: txTime(5), isSuspicious: true, suspicionReason: 'Inbound from high-risk wallet' },
        { txHash: '0xbcd222333444555666777888999000aabbccddeeff0011223344556677889900', from: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d', to: '0x9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', value: 10000, timestamp: txTime(4), isSuspicious: true, suspicionReason: 'Rapid redistribution after receipt' },
      ],
      relatedWallets: [
        { address: '0x7a2f8e9b3c1d4a5f6e7b8c9d0e1f2a3b4c5d6e7f', relationship: 'Received funds from', riskScore: 82 },
        { address: '0x9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', relationship: 'Sent funds to', riskScore: 71 },
      ],
      exchangeConnections: [{ name: 'PhantomEx Exchange', type: 'PEER_TO_PEER', flagged: true }],
      patternAnalysis: { averageTransactionValue: '1910.45', transactionFrequency: '0.74 tx/day', concentrationRisk: 'MODERATE', layeringIndicators: 'POSSIBLE' },
      investigationTimeline: [
        { date: txTime(45), event: 'FIRST_CONNECTION', details: 'First transfer received from Wallet Alpha' },
        { date: txTime(4), event: 'RAPID_REDISTRIBUTION', details: 'Funds redistributed to Wallet Gamma within 24 hours of receipt' },
      ],
      disclaimer: 'Synthetic/demo data. Requires human expert review.',
      requiresHumanReview: true, analyzedBy: analyst._id,
    },
  ]);

  logger.info('✅ Blockchain analyses created');

  // ─── EVIDENCE ────────────────────────────────────────────────────────────
  await Evidence.create([
    { caseId, title: 'Victim Priya Voicemail Recording', type: 'AUDIO', description: 'Voice message received by victim from suspected cloned voice of her financial advisor', isProcessed: true, processingStatus: 'completed', uploadedBy: investigator._id, tags: ['voice-cloning', 'victim', 'audio'] },
    { caseId, title: 'Phishing Email — Account Suspension', type: 'EMAIL', description: 'Primary phishing email with cryptocurrency payment request and suspicious link', isProcessed: true, processingStatus: 'completed', uploadedBy: investigator._id, tags: ['phishing', 'email', 'cryptocurrency'] },
    { caseId, title: 'Suspect Passport — Viktor Lazarov', type: 'DOCUMENT', description: 'Passport document submitted during business registration — inconsistencies detected', isProcessed: true, processingStatus: 'completed', uploadedBy: investigator._id, tags: ['identity', 'passport', 'forgery'] },
    { caseId, title: 'Blockchain Transaction Records', type: 'BLOCKCHAIN', description: 'Transaction log for Wallet Alpha showing layering pattern', isProcessed: true, processingStatus: 'completed', uploadedBy: analyst._id, tags: ['blockchain', 'transactions', 'laundering'] },
    { caseId, title: 'Network Diagram — Entity Relationships', type: 'NETWORK', description: 'Visual mapping of identified entity connections across all intelligence modules', isProcessed: true, processingStatus: 'completed', uploadedBy: analyst._id, tags: ['network', 'relationships'] },
    { caseId, title: 'ShadowTech Business Registration Documents', type: 'DOCUMENT', description: 'Offshore business registration records for ShadowTech Solutions Ltd.', isProcessed: false, processingStatus: 'pending', uploadedBy: investigator._id, tags: ['organization', 'shell-company', 'offshore'] },
  ]);

  await Case.findByIdAndUpdate(caseId, { evidenceCount: 6 });
  logger.info('✅ Evidence created');

  // ─── TIMELINE EVENTS ──────────────────────────────────────────────────────
  await TimelineEvent.create([
    { caseId, eventType: 'CASE_OPENED', title: 'Operation Phoenix Initiated', description: 'Case opened following tip from financial crime unit regarding suspicious cryptocurrency transactions', eventDate: new Date(Date.now() - 90 * 86400000), source: 'manual', significance: 'HIGH', isVerified: true, createdBy: admin._id },
    { caseId, eventType: 'ENTITY_IDENTIFIED', title: 'Shell Company Identified', description: 'ShadowTech Solutions Ltd. identified as possible infrastructure provider through business registration analysis', eventDate: new Date(Date.now() - 85 * 86400000), source: 'intelligence', significance: 'HIGH', isVerified: false, createdBy: investigator._id },
    { caseId, eventType: 'BLOCKCHAIN_EVENT', title: 'Wallet Alpha First Detected', description: 'ETH wallet 0x7a2f... first appears in transaction records. Initial deposit of 50 ETH from unknown source.', eventDate: new Date(Date.now() - 80 * 86400000), source: 'ChainTrace AI', significance: 'MEDIUM', isVerified: true, createdBy: investigator._id },
    { caseId, eventType: 'EMAIL_THREAT', title: 'Phishing Domain Registered', description: 'secure-bank-verify.com registered — 3 days before phishing campaign launched', eventDate: new Date(Date.now() - 72 * 86400000), source: 'MailGuard', significance: 'HIGH', isVerified: true, createdBy: analyst._id },
    { caseId, eventType: 'EMAIL_THREAT', title: 'Phishing Campaign Launched', description: 'Mass phishing email campaign begins targeting financial sector employees. 47 emails sent from tempmail address.', eventDate: new Date(Date.now() - 69 * 86400000), source: 'MailGuard Intelligence', significance: 'HIGH', isVerified: true, createdBy: investigator._id },
    { caseId, eventType: 'VOICE_EVENT', title: 'Voice Cloning Attack on Priya Sharma', description: 'Victim Priya Sharma receives voicemail from cloned voice of her financial advisor requesting urgent fund transfer', eventDate: new Date(Date.now() - 65 * 86400000), source: 'VoiceShield AI', significance: 'CRITICAL', isVerified: false, createdBy: investigator._id },
    { caseId, eventType: 'IDENTITY_EVENT', title: 'Forged Passport Submitted', description: 'Viktor Lazarov\'s passport submitted for business account opening — inconsistencies flagged by VeriTrust AI', eventDate: new Date(Date.now() - 60 * 86400000), source: 'VeriTrust AI', significance: 'HIGH', isVerified: false, createdBy: analyst._id },
    { caseId, eventType: 'BLOCKCHAIN_EVENT', title: 'Mixer Interaction Detected', description: 'Wallet Alpha routes funds through suspected cryptocurrency mixer — classic money laundering technique', eventDate: new Date(Date.now() - 50 * 86400000), source: 'ChainTrace AI', significance: 'HIGH', isVerified: true, createdBy: investigator._id },
    { caseId, eventType: 'ENTITY_IDENTIFIED', title: 'Viktor Lazarov Identified as Primary Suspect', description: 'Cross-referencing email headers, blockchain patterns, and voice analysis timestamps identifies Viktor as primary suspect', eventDate: new Date(Date.now() - 45 * 86400000), source: 'AI Intelligence Core', significance: 'CRITICAL', isVerified: false, createdBy: investigator._id },
    { caseId, eventType: 'BLOCKCHAIN_EVENT', title: 'Layering Pattern Confirmed', description: 'Alpha→Beta→Gamma wallet chain confirmed as three-stage layering scheme', eventDate: new Date(Date.now() - 30 * 86400000), source: 'ChainTrace AI', significance: 'HIGH', isVerified: true, createdBy: analyst._id },
    { caseId, eventType: 'EMAIL_THREAT', title: 'CEO Spear Phishing Attempt', description: 'Targeted spear phishing email to finance department referencing voice message — suspected BEC attack', eventDate: new Date(Date.now() - 25 * 86400000), source: 'MailGuard Intelligence', significance: 'CRITICAL', isVerified: true, createdBy: investigator._id },
    { caseId, eventType: 'BLOCKCHAIN_EVENT', title: 'Large Transfer to Exchange Wallet', description: 'Wallet Beta transfers $10,000 to Wallet Gamma (PhantomEx) — final laundering stage', eventDate: new Date(Date.now() - 4 * 86400000), source: 'ChainTrace AI', significance: 'HIGH', isVerified: true, createdBy: investigator._id },
    { caseId, eventType: 'AI_INSIGHT', title: 'Unified Intelligence Analysis Generated', description: 'AI Intelligence Core generates cross-module correlation report linking all five evidence streams to common operator', eventDate: new Date(Date.now() - 1 * 86400000), source: 'AI Intelligence Core', significance: 'HIGH', isVerified: false, createdBy: admin._id },
  ]);

  logger.info('✅ Timeline events created');

  // ─── ALERTS ───────────────────────────────────────────────────────────────
  await Alert.create([
    { caseId, title: 'CRITICAL: High-Suspicion Voice Sample', message: 'Voice analysis of victim_priya_voicemail.mp3 returned suspicion score 84/100. Possible synthetic voice — immediate expert review required.', severity: 'CRITICAL', category: 'voice', source: 'VoiceShield AI', isRead: false },
    { caseId, title: 'HIGH: Phishing Campaign Active', message: 'Primary phishing email scored 95/100 threat level. Active campaign using TOR infrastructure targeting financial sector.', severity: 'HIGH', category: 'email', source: 'MailGuard Intelligence', isRead: false },
    { caseId, title: 'HIGH: Document Inconsistencies — Viktor Lazarov Passport', message: 'Passport analysis returned risk score 78/100. Three significant inconsistencies detected including metadata anomaly. Verification required.', severity: 'HIGH', category: 'identity', source: 'VeriTrust AI', isRead: false },
    { caseId, title: 'HIGH: Suspicious Blockchain Activity — Wallet Alpha', message: 'Wallet 0x7a2f... scored 82/100. 38 suspicious transactions including mixer interaction. Layering pattern confirmed.', severity: 'HIGH', category: 'blockchain', source: 'ChainTrace AI', isRead: false },
    { caseId, title: 'CRITICAL: Business Email Compromise Attempt', message: 'CEO impersonation spear phishing email detected. Targets finance department with urgent wire transfer request. Immediate action recommended.', severity: 'CRITICAL', category: 'email', source: 'MailGuard Intelligence', isRead: false },
  ]);

  await Case.findByIdAndUpdate(caseId, { alertCount: 5 });
  logger.info('✅ Alerts created');

  // ─── SECOND CASE ──────────────────────────────────────────────────────────
  await Case.create({
    caseId: 'CV-DARKWEB-2024-002',
    title: 'Operation DarkWeb Marketplace',
    description: 'Investigation into suspected darkweb marketplace facilitating illegal digital goods trading. Multiple cryptocurrency wallets and anonymous email accounts identified.',
    status: 'OPEN',
    priority: 'HIGH',
    assignedTo: analyst._id,
    createdBy: investigator._id,
    tags: ['darkweb', 'cryptocurrency', 'marketplace'],
    riskScore: 65,
    entityCount: 3,
    evidenceCount: 2,
    alertCount: 2,
    lastActivityAt: new Date(Date.now() - 5 * 86400000),
  });

  await Case.create({
    caseId: 'CV-VOICEID-2024-003',
    title: 'Operation VoiceID — Banking Fraud',
    description: 'Investigation into voice cloning attacks targeting banking sector employees. Victims received calls from synthetic voices impersonating bank executives.',
    status: 'OPEN',
    priority: 'HIGH',
    assignedTo: investigator._id,
    createdBy: admin._id,
    tags: ['voice-cloning', 'banking', 'fraud'],
    riskScore: 73,
    entityCount: 5,
    evidenceCount: 4,
    alertCount: 3,
    lastActivityAt: new Date(Date.now() - 2 * 86400000),
  });

  logger.info('✅ Additional cases created');

  // Seed tactical surveillance, geospatial, and SMS dispatch data
  await seedTacticalData(caseId, admin._id);
  await seedEnterpriseModules(caseId, admin._id);

  logger.info('🎉 Database seeding complete!');
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.info('Demo Credentials:');
  logger.info('  Admin:        admin@crimeverse.demo / CrimeVerse@2024!');
  logger.info('  Investigator: investigator@crimeverse.demo / CrimeVerse@2024!');
  logger.info('  Supervisor:   supervisor@crimeverse.demo / CrimeVerse@2024!');
  logger.info('  Citizen:      citizen@crimeverse.demo / CrimeVerse@2024!');
  logger.info('  Analyst:      analyst@crimeverse.demo / CrimeVerse@2024!');
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

export async function seedTacticalData(phoenixCaseId: any, adminId: any): Promise<void> {
  logger.info('📹 Seeding CCTV cameras, geospatial incidents, and tactical units...');

  // Seed Cameras
  await Camera.deleteMany({});
  await Camera.create([
    {
      cameraId: 'CAM-FIN-01',
      name: 'Exchange Plaza Tower North',
      sector: 'Financial District',
      locationName: 'Wall St & Concourse North',
      coordinates: { lat: 28.6289, lng: 77.2065 },
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      status: 'ALERT',
      resolution: '4K UHD (3840x2160)',
      fps: 30,
      bitrateMbps: 8.5,
      ptzCapable: true,
      currentPan: 15,
      currentTilt: -8,
      currentZoom: 2.4,
      nightVision: false,
      thermalMode: false,
      caseId: phoenixCaseId,
      activeDetections: [
        {
          id: 'DET-FIN-01-A',
          type: 'WEAPON',
          label: 'Concealed Handgun Detected',
          confidence: 0.942,
          bbox: [28, 42, 14, 22],
          threatSeverity: 'CRITICAL',
          timestamp: new Date(),
        },
        {
          id: 'DET-FIN-01-B',
          type: 'PERSON',
          label: 'Suspect Match: Viktor Lazarov',
          confidence: 0.918,
          bbox: [22, 28, 26, 62],
          threatSeverity: 'CRITICAL',
          timestamp: new Date(),
          suspectMatch: {
            name: 'Viktor Lazarov',
            alias: 'The Ghost Broker',
            similarity: 91.8,
          },
        },
      ],
    },
    {
      cameraId: 'CAM-FIN-02',
      name: 'Bank ATM Concourse #104',
      sector: 'Financial District',
      locationName: 'Concourse Plaza East Wing',
      coordinates: { lat: 28.6219, lng: 77.2185 },
      streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      status: 'ALERT',
      resolution: '1080p FHD (1920x1080)',
      fps: 60,
      bitrateMbps: 6.2,
      ptzCapable: true,
      currentPan: -45,
      currentTilt: -15,
      currentZoom: 3.0,
      nightVision: false,
      thermalMode: false,
      caseId: phoenixCaseId,
      activeDetections: [
        {
          id: 'DET-FIN-02-A',
          type: 'ANOMALY',
          label: 'Skimmer / Hardware Mule Tap Flagged',
          confidence: 0.885,
          bbox: [48, 55, 12, 18],
          threatSeverity: 'HIGH',
          timestamp: new Date(),
        },
      ],
    },
    {
      cameraId: 'CAM-AIR-03',
      name: 'Airport Terminal 3 - VIP Gate',
      sector: 'Airport Sector',
      locationName: 'International Departures Gate 12',
      coordinates: { lat: 28.5562, lng: 77.1000 },
      streamUrl: '',
      status: 'ONLINE',
      resolution: '4K UHD (3840x2160)',
      fps: 30,
      bitrateMbps: 9.0,
      ptzCapable: true,
      currentPan: 0,
      currentTilt: 0,
      currentZoom: 1.0,
      nightVision: true,
      thermalMode: false,
      caseId: phoenixCaseId,
      activeDetections: [],
    },
    {
      cameraId: 'CAM-METRO-04',
      name: 'Central Metro Transit Concourse',
      sector: 'Transit Hub',
      locationName: 'Gate 4 Turnstiles & Platforms',
      coordinates: { lat: 28.6304, lng: 77.2177 },
      streamUrl: '',
      status: 'ONLINE',
      resolution: '1080p FHD (1920x1080)',
      fps: 30,
      bitrateMbps: 5.4,
      ptzCapable: true,
      currentPan: 30,
      currentTilt: -10,
      currentZoom: 1.5,
      nightVision: false,
      thermalMode: false,
      caseId: phoenixCaseId,
      activeDetections: [
        {
          id: 'DET-MET-01',
          type: 'BAGGAGE',
          label: 'Unattended Luggage (Static > 12 mins)',
          confidence: 0.892,
          bbox: [62, 68, 15, 20],
          threatSeverity: 'MEDIUM',
          timestamp: new Date(),
        },
      ],
    },
    {
      cameraId: 'CAM-PORT-05',
      name: 'Maritime Freight Bay 9 (FLIR)',
      sector: 'Harbor & Port',
      locationName: 'Cargo Container Terminal East',
      coordinates: { lat: 28.5900, lng: 77.2400 },
      streamUrl: '',
      status: 'ONLINE',
      resolution: '1080p FHD (FLIR)',
      fps: 25,
      bitrateMbps: 4.8,
      ptzCapable: true,
      currentPan: -12,
      currentTilt: -5,
      currentZoom: 2.0,
      nightVision: false,
      thermalMode: true,
      caseId: phoenixCaseId,
      activeDetections: [],
    },
    {
      cameraId: 'CAM-SAFE-06',
      name: 'Warehouse 14 Perimeter North',
      sector: 'Industrial Sector',
      locationName: 'Industrial Bypass Road 14',
      coordinates: { lat: 28.6410, lng: 77.2280 },
      streamUrl: '',
      status: 'ALERT',
      resolution: '4K UHD (3840x2160)',
      fps: 30,
      bitrateMbps: 7.8,
      ptzCapable: true,
      currentPan: 80,
      currentTilt: -20,
      currentZoom: 4.5,
      nightVision: true,
      thermalMode: false,
      caseId: phoenixCaseId,
      activeDetections: [
        {
          id: 'DET-SAFE-01',
          type: 'VEHICLE',
          label: 'ANPR: Black Tactical SUV [DL-04-CK-8819]',
          confidence: 0.967,
          bbox: [35, 45, 30, 32],
          threatSeverity: 'HIGH',
          timestamp: new Date(),
        },
      ],
    },
    {
      cameraId: 'CAM-COMM-07',
      name: 'Cyber Tech Park Server Vault',
      sector: 'Cyber Tech Park',
      locationName: 'Building Gamma Level B2',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      streamUrl: '',
      status: 'ONLINE',
      resolution: '4K UHD (3840x2160)',
      fps: 30,
      bitrateMbps: 8.0,
      ptzCapable: true,
      currentPan: 0,
      currentTilt: -30,
      currentZoom: 1.0,
      nightVision: false,
      thermalMode: false,
      caseId: phoenixCaseId,
      activeDetections: [],
    },
    {
      cameraId: 'CAM-GOV-08',
      name: 'Command Headquarters Gate Alpha',
      sector: 'Government Enclave',
      locationName: 'North Perimeter Access Checkpoint',
      coordinates: { lat: 28.6145, lng: 77.1995 },
      streamUrl: '',
      status: 'ONLINE',
      resolution: '4K UHD (3840x2160)',
      fps: 60,
      bitrateMbps: 12.0,
      ptzCapable: true,
      currentPan: 0,
      currentTilt: 0,
      currentZoom: 1.0,
      nightVision: false,
      thermalMode: false,
      caseId: phoenixCaseId,
      activeDetections: [],
    },
  ]);

  // Seed GeoIncidents
  await GeoIncident.deleteMany({});
  await GeoIncident.create([
    {
      incidentId: 'INC-GEO-001',
      title: 'Operation Phoenix: Coordinated Crypto Heist Extraction',
      description: 'Primary cyber intrusion and unauthorized RTGS wire exfiltration hub. Linked to Viktor Lazarov syndicate.',
      crimeType: 'CYBER_HEIST',
      severity: 'CRITICAL',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      address: 'Cyber Tech Park Bldg Gamma, Tech Corridor',
      sector: 'Cyber Tech Park',
      caseId: phoenixCaseId,
      radiusMeters: 450,
      threatScore: 94,
      assignedUnits: ['PATROL-ALPHA-01', 'SWAT-BRAVO-02'],
      reportedAt: new Date(Date.now() - 4 * 3600000),
      suspectTrail: [
        {
          timestamp: new Date(Date.now() - 4 * 3600000),
          locationName: 'Cyber Tech Park - Server Room',
          lat: 28.6139,
          lng: 77.2090,
          activity: 'Intrusion initiated via compromised VPN certificate',
          confirmedBy: 'IDS Sentinel',
        },
        {
          timestamp: new Date(Date.now() - 3 * 3600000),
          locationName: 'Bank ATM Concourse #104',
          lat: 28.6219,
          lng: 77.2185,
          activity: 'Physical mule extraction flagged on CCTV CAM-FIN-02',
          confirmedBy: 'CAM-FIN-02',
        },
        {
          timestamp: new Date(Date.now() - 90 * 60000),
          locationName: 'Metro Transit Hub - Gate 4',
          lat: 28.6304,
          lng: 77.2177,
          activity: 'Suspect boarded rapid transit line with tactical case',
          confirmedBy: 'Facial Biometric AI',
        },
        {
          timestamp: new Date(Date.now() - 25 * 60000),
          locationName: 'Warehouse 14 Safehouse Perimeter',
          lat: 28.6410,
          lng: 77.2280,
          activity: 'Active signal beacon and vehicle detected on CAM-SAFE-06',
          confirmedBy: 'SWAT Drone Sentinel',
        },
      ],
    },
    {
      incidentId: 'INC-GEO-002',
      title: 'Physical Cash-out Mule Network Intercepted',
      description: 'Multiple automated teller withdrawals coordinated via burner SIM cards.',
      crimeType: 'FINANCIAL_FRAUD',
      severity: 'HIGH',
      coordinates: { lat: 28.6219, lng: 77.2185 },
      address: 'Concourse Plaza East, Financial District',
      sector: 'Financial District',
      caseId: phoenixCaseId,
      radiusMeters: 300,
      threatScore: 82,
      assignedUnits: ['PATROL-ALPHA-01'],
      reportedAt: new Date(Date.now() - 2 * 3600000),
    },
    {
      incidentId: 'INC-GEO-003',
      title: 'Cloned Voice Executive Impersonation Sighting',
      description: 'Suspect observed communicating with high-gain directional mic and cellular scrambler.',
      crimeType: 'IDENTITY_THEFT',
      severity: 'HIGH',
      coordinates: { lat: 28.6304, lng: 77.2177 },
      address: 'Central Metro Transit Hub, Concourse East',
      sector: 'Transit Hub',
      caseId: phoenixCaseId,
      radiusMeters: 350,
      threatScore: 78,
      assignedUnits: ['DRONE-SENTINEL-03'],
      reportedAt: new Date(Date.now() - 90 * 60000),
    },
    {
      incidentId: 'INC-GEO-004',
      title: 'Warehouse 14 Armed Safehouse Perimeter Lockdown',
      description: 'Hostile armed guards and counter-surveillance scrambler antenna detected.',
      crimeType: 'SURVEILLANCE_FLAG',
      severity: 'CRITICAL',
      coordinates: { lat: 28.6410, lng: 77.2280 },
      address: 'Industrial Bypass Road, Warehouse 14',
      sector: 'Industrial Sector',
      caseId: phoenixCaseId,
      radiusMeters: 500,
      threatScore: 92,
      assignedUnits: ['SWAT-BRAVO-02'],
      reportedAt: new Date(Date.now() - 30 * 60000),
    },
    {
      incidentId: 'INC-GEO-005',
      title: 'Darknet Escrow Narcotics Staging Node',
      description: 'Suspicious maritime container activity matching encrypted ledger transactions.',
      crimeType: 'NARCOTICS',
      severity: 'MEDIUM',
      coordinates: { lat: 28.5900, lng: 77.2400 },
      address: 'Freight Container Terminal Bay 9',
      sector: 'Harbor & Port',
      radiusMeters: 400,
      threatScore: 68,
      assignedUnits: ['PATROL-DELTA-04'],
      reportedAt: new Date(Date.now() - 6 * 3600000),
    },
    {
      incidentId: 'INC-GEO-006',
      title: 'VIP Gate Compromised Passport Sighting',
      description: 'Foreign synthetic passport scan flagged at border biometric kiosk.',
      crimeType: 'IDENTITY_THEFT',
      severity: 'HIGH',
      coordinates: { lat: 28.5562, lng: 77.1000 },
      address: 'Airport Terminal 3 Departures',
      sector: 'Airport Sector',
      radiusMeters: 250,
      threatScore: 75,
      assignedUnits: ['MOTO-ECHO-05'],
      reportedAt: new Date(Date.now() - 5 * 3600000),
    },
  ]);

  // Seed PatrolUnits
  await PatrolUnit.deleteMany({});
  await PatrolUnit.create([
    {
      unitId: 'PATROL-ALPHA-01',
      callSign: 'Interceptor Alpha-1',
      vehicleType: 'INTERCEPTOR_CAR',
      officerInCharge: 'Inspector Vikram Rathore',
      badgeNumber: 'DL-POL-4412',
      contactRadio: 'TAC-CH-1',
      coordinates: { lat: 28.6250, lng: 77.2120 },
      heading: 45,
      speedKmH: 52,
      status: 'ON_PATROL',
      sector: 'Financial District',
      batteryOrFuelPercent: 92,
      lastPingAt: new Date(),
    },
    {
      unitId: 'SWAT-BRAVO-02',
      callSign: 'Tactical SWAT Heavy-2',
      vehicleType: 'TACTICAL_SWAT_VAN',
      officerInCharge: 'Capt. Marcus Sterling',
      badgeNumber: 'SWAT-DL-08',
      contactRadio: 'SWAT-CH-ALPHA',
      coordinates: { lat: 28.6380, lng: 77.2240 },
      heading: 210,
      speedKmH: 68,
      status: 'PURSUIT',
      assignedIncidentId: 'INC-GEO-004',
      sector: 'Industrial Sector',
      batteryOrFuelPercent: 84,
      lastPingAt: new Date(),
    },
    {
      unitId: 'DRONE-SENTINEL-03',
      callSign: 'SkyEye UAV Sentinel-3',
      vehicleType: 'SURVEILLANCE_DRONE',
      officerInCharge: 'Pilot Sgt. Roy',
      badgeNumber: 'UAV-AIR-19',
      contactRadio: 'UAV-TELEMETRY',
      coordinates: { lat: 28.6290, lng: 77.2190 },
      heading: 90,
      speedKmH: 35,
      status: 'RESPONDING',
      assignedIncidentId: 'INC-GEO-003',
      sector: 'Transit Hub',
      batteryOrFuelPercent: 78,
      lastPingAt: new Date(),
    },
    {
      unitId: 'PATROL-DELTA-04',
      callSign: 'Port Cruiser Delta-4',
      vehicleType: 'INTERCEPTOR_CAR',
      officerInCharge: 'Officer Neha Saxena',
      badgeNumber: 'DL-POL-7729',
      contactRadio: 'TAC-CH-4',
      coordinates: { lat: 28.5950, lng: 77.2350 },
      heading: 180,
      speedKmH: 40,
      status: 'ON_PATROL',
      sector: 'Harbor & Port',
      batteryOrFuelPercent: 88,
      lastPingAt: new Date(),
    },
    {
      unitId: 'MOTO-ECHO-05',
      callSign: 'Rapid Moto Unit Echo-5',
      vehicleType: 'MOTOR_PATROL',
      officerInCharge: 'Officer Tariq Khan',
      badgeNumber: 'DL-MOTO-31',
      contactRadio: 'MOTO-CH-5',
      coordinates: { lat: 28.5600, lng: 77.1050 },
      heading: 270,
      speedKmH: 60,
      status: 'STANDBY',
      sector: 'Airport Sector',
      batteryOrFuelPercent: 95,
      lastPingAt: new Date(),
    },
  ]);

  // Seed Initial SmsDispatch
  await SmsDispatch.deleteMany({});
  await SmsDispatch.create([
    {
      dispatchId: 'SMS-DSP-001092',
      title: '🚨 ALL UNITS APB: High-risk suspect Viktor Lazarov sighted',
      recipientGroup: 'ALL_UNITS',
      message: '🚨 [CRIMEVERSE ALERT] ALL UNITS APB: High-risk suspect Viktor Lazarov sighted near Sector 4 Transit Hub. Suspect is armed and dangerous. Intercept with caution. Coordinate via Channel Bravo.',
      priority: 'CRITICAL_SOS',
      status: 'DELIVERED',
      totalRecipients: 76,
      deliveredCount: 76,
      failedCount: 0,
      caseId: phoenixCaseId,
      carrierResponse: {
        gateway: 'CRIMEVERSE-GOV-SMS-TELECOM-NODE-01',
        messageId: 'MSG-TEL-78921B',
        deliveryRatePercent: 100,
        latencyMs: 98,
      },
      sentBy: adminId,
      sentAt: new Date(Date.now() - 45 * 60000),
    },
    {
      dispatchId: 'SMS-DSP-001089',
      title: '⚠️ Cyber Fraud Advisory: Banking Executive Voice Cloning',
      recipientGroup: 'CYBER_CELL',
      message: '🛡️ [CYBER FRAUD ALERT] Active AI voice cloning attack targeting regional bank account holders. Impersonation of fraud department executives detected. Place freeze on unverified RTGS transfers.',
      priority: 'HIGH',
      status: 'DELIVERED',
      totalRecipients: 12,
      deliveredCount: 12,
      failedCount: 0,
      caseId: phoenixCaseId,
      carrierResponse: {
        gateway: 'CRIMEVERSE-GOV-SMS-TELECOM-NODE-01',
        messageId: 'MSG-TEL-44120A',
        deliveryRatePercent: 100,
        latencyMs: 115,
      },
      sentBy: adminId,
      sentAt: new Date(Date.now() - 3 * 3600000),
    },
  ]);

  logger.info('✅ CCTV cameras, geospatial incidents, and tactical units seeded successfully!');
}

export async function seedEnterpriseModules(phoenixCaseId: any, adminId: any): Promise<void> {
  logger.info('🛡️ Seeding enterprise modules (multi-case, complaints, locations, challenge AI, simulations, escalations)...');

  // 1. Ensure Supervisor and Citizen demo users exist
  let supervisor = await User.findOne({ email: 'supervisor@crimeverse.demo' });
  if (!supervisor) {
    supervisor = await User.create({
      name: 'IG Anita Roy',
      email: 'supervisor@crimeverse.demo',
      password: 'CrimeVerse@2024!',
      role: 'SUPERVISOR',
    });
  }

  let citizen = await User.findOne({ email: 'citizen@crimeverse.demo' });
  if (!citizen) {
    citizen = await User.create({
      name: 'Rahul Citizen Sharma',
      email: 'citizen@crimeverse.demo',
      password: 'CrimeVerse@2024!',
      role: 'CITIZEN',
    });
  }

  const investigator = await User.findOne({ email: 'investigator@crimeverse.demo' });

  // 2. Multi-Case: ensure Operation CyberShield and Operation DarkNexus exist
  let cyberShieldCase = await Case.findOne({ caseId: 'CV-CYBERSHIELD-2024-002' });
  if (!cyberShieldCase) {
    cyberShieldCase = await Case.create({
      caseId: 'CV-CYBERSHIELD-2024-002',
      title: 'Operation CyberShield',
      description: 'Multi-state investigation into high-tech deepfake video and synthetic voice extortion rings targeting corporate executives, elderly citizens, and banking customers.',
      status: 'ACTIVE',
      priority: 'HIGH',
      assignedTo: investigator?._id || adminId,
      createdBy: adminId,
      tags: ['deepfake', 'voice-cloning', 'extortion', 'cyber-crime', 'sih2024'],
      riskScore: 74,
      riskConfidence: 82,
      riskExplanation: 'Elevated risk from automated AI deepfake telephony generation and targeted extortion demands.',
      riskFactors: {
        connectedEntitiesScore: 16,
        unresolvedRelationshipsScore: 14,
        evidenceGapsScore: 12,
        suspiciousActivityScore: 18,
        networkComplexityScore: 10,
        locationInconsistenciesScore: 8,
        contradictoryInfoScore: 4,
      },
      entityCount: 8,
      evidenceCount: 6,
      alertCount: 4,
      lastActivityAt: new Date(),
    });
  }

  let darkNexusCase = await Case.findOne({ caseId: 'CV-DARKNEXUS-2024-003' });
  if (!darkNexusCase) {
    darkNexusCase = await Case.create({
      caseId: 'CV-DARKNEXUS-2024-003',
      title: 'Operation DarkNexus',
      description: 'Transnational Hawala syndicate operating through unregulated peer-to-peer crypto swap endpoints, dummy offshore shell entities, and disguised logistics cargo invoices.',
      status: 'ACTIVE',
      priority: 'CRITICAL',
      assignedTo: investigator?._id || adminId,
      createdBy: adminId,
      tags: ['hawala', 'money-laundering', 'crypto', 'cross-border', 'darkweb'],
      riskScore: 92,
      riskConfidence: 89,
      riskExplanation: 'Critical risk from multi-hop cross-border asset flight and non-cooperative offshore jurisdictions.',
      riskFactors: {
        connectedEntitiesScore: 19,
        unresolvedRelationshipsScore: 18,
        evidenceGapsScore: 15,
        suspiciousActivityScore: 20,
        networkComplexityScore: 18,
        locationInconsistenciesScore: 14,
        contradictoryInfoScore: 8,
      },
      entityCount: 14,
      evidenceCount: 11,
      alertCount: 7,
      lastActivityAt: new Date(),
    });
  }

  // 3. Citizen Complaints
  await Complaint.deleteMany({});
  await Complaint.create({
    complaintId: 'CMP-20240901-7891A',
    category: 'FINANCIAL_FRAUD',
    title: 'Unauthorized Deepfake Voice Transfer of ₹4,80,000 from Savings Account',
    description: 'Received a distress call impersonating my branch manager with identical voice cadence, directing me to authenticate an immediate security vault transfer to safeguard my balance. Amount was wiped immediately to an unknown virtual account.',
    incidentDateTime: new Date(Date.now() - 6 * 86400000),
    complainant: {
      name: 'Rahul Citizen Sharma',
      phone: '+91 98765 43210',
      email: 'citizen@crimeverse.demo',
      nationalId: 'XXXX-XXXX-4589',
      address: 'Flat 402, Shanti Vihar Apartments, Mayur Vihar, New Delhi',
      isAnonymous: false,
    },
    suspectInfo: {
      name: 'Unknown Male (Caller ID Spoofed)',
      aliases: ['Manager Sharma Impersonator'],
      description: 'Fluent Hindi and English speaker, familiar with banking protocols and IFSC lookup.',
      contactNumber: '+91 99112 33445',
      email: 'support@bank-security-verify.org',
    },
    location: {
      fullAddress: 'Mayur Vihar Phase 1, East District, New Delhi',
      city: 'New Delhi',
      district: 'East Delhi',
      state: 'Delhi',
      country: 'India',
      pinCode: '110091',
      coordinates: { lat: 28.6095, lng: 77.2926 },
    },
    relatedPersons: ['Victim Rahul Sharma', 'Branch Manager Alok Saxena'],
    relatedLocations: ['Mayur Vihar Residence', 'Connaught Place Branch'],
    relatedVehiclesDevices: ['Android Mobile IMEI 869402049182391', 'Destination UPI VPA'],
    evidenceFiles: [
      {
        fileName: 'recorded_call_deepfake_snippet.wav',
        fileType: 'AUDIO',
        originalName: 'ScamCall_Recording_Sept01.wav',
        fileSize: 2450000,
        uploadedAt: new Date(Date.now() - 6 * 86400000),
      },
      {
        fileName: 'bank_statement_debit_proof.pdf',
        fileType: 'DOCUMENT',
        originalName: 'TransactionStatement_Sept01.pdf',
        fileSize: 450000,
        uploadedAt: new Date(Date.now() - 6 * 86400000),
      },
    ],
    status: 'INVESTIGATION_STARTED',
    statusHistory: [
      { status: 'SUBMITTED', updatedBy: 'Rahul Citizen Sharma', notes: 'Citizen complaint filed via Portal.', timestamp: new Date(Date.now() - 6 * 86400000) },
      { status: 'UNDER_REVIEW', updatedBy: 'Agent Sarah Chen', notes: 'Evidentiary bank statement and voice audio authenticated.', timestamp: new Date(Date.now() - 5 * 86400000) },
      { status: 'INVESTIGATION_STARTED', updatedBy: 'Agent Sarah Chen', notes: 'Correlated with Operation Phoenix VoiceShield cluster.', timestamp: new Date(Date.now() - 3 * 86400000) },
    ],
    assignedDepartment: 'Cyber Crime Investigation Division',
    assignedOfficer: investigator?._id,
    linkedCaseId: phoenixCaseId,
    userId: citizen?._id,
  });

  await Complaint.create([
    {
      complaintId: 'CMP-20240904-4521B',
      category: 'IDENTITY_THEFT',
      title: 'Pension Savings Targeted via Forged Digital Life Certificate & Spoofed KYC',
      description: 'Fraudulent digital life certificate submitted in my father’s name to divert quarterly pension benefits. Forged Aadhaar and biometric template used at an unauthorized CSC kiosk.',
      incidentDateTime: new Date(Date.now() - 4 * 86400000),
      complainant: {
        name: 'Sunita Verma',
        phone: '+91 98110 99887',
        email: 'sunita.verma@example.in',
        nationalId: 'XXXX-XXXX-1123',
        address: 'Sector 15, Rohini, Delhi',
        isAnonymous: false,
      },
      suspectInfo: {
        name: 'Kiosk Operator Rajan & Associates',
        description: 'Unauthorized digital services kiosk operating near Old Secretariat.',
      },
      location: {
        fullAddress: 'CSC Kiosk #14, Old Secretariat Road, Civil Lines',
        city: 'Delhi',
        district: 'North Delhi',
        state: 'Delhi',
        country: 'India',
        pinCode: '110054',
        coordinates: { lat: 28.6811, lng: 77.2228 },
      },
      relatedPersons: ['Elderly Retiree O.P. Verma'],
      relatedLocations: ['Civil Lines Secretariat', 'Rohini Residence'],
      evidenceFiles: [
        {
          fileName: 'forged_certificate_scan.jpg',
          fileType: 'IMAGE',
          originalName: 'ForgedDoc_Scan.jpg',
          fileSize: 1250000,
          uploadedAt: new Date(Date.now() - 4 * 86400000),
        },
      ],
      status: 'EVIDENCE_REVIEW',
      statusHistory: [
        { status: 'SUBMITTED', updatedBy: 'Sunita Verma', notes: 'Intake registration completed.', timestamp: new Date(Date.now() - 4 * 86400000) },
        { status: 'UNDER_REVIEW', updatedBy: 'Dr. Raj Patel', notes: 'Aadhaar biometric forgery confirmed via VeriTrust AI.', timestamp: new Date(Date.now() - 3 * 86400000) },
        { status: 'EVIDENCE_REVIEW', updatedBy: 'Dr. Raj Patel', notes: 'Kiosk CCTV records requisitioned.', timestamp: new Date(Date.now() - 1 * 86400000) },
      ],
      assignedDepartment: 'Identity Fraud Screening Cell',
      assignedOfficer: investigator?._id,
      linkedCaseId: cyberShieldCase._id,
      userId: citizen?._id,
    },
    {
      complaintId: 'CMP-20240907-9923C',
      category: 'EXTORTION',
      title: 'Commercial Extortion & Encrypted Ransomware Demand against Hospital Logistics',
      description: 'Ransomware deployment on emergency pharmaceutical logistics database. Perpetrators demanding 12.5 Monero via encrypted ProtonMail channel within 48 hours or threatening patient records leak.',
      incidentDateTime: new Date(Date.now() - 2 * 86400000),
      complainant: {
        name: 'Nexa Health Logistics Corp',
        phone: '+91 99887 66554',
        email: 'security@nexa-health.org',
        address: 'DLF Cyber City, Tower C, Gurugram',
        isAnonymous: false,
      },
      suspectInfo: {
        name: 'DarkHydra Extortion Group',
        email: 'darkhydra.leak@proton.me',
        additionalDetails: 'Uses double-extortion tactics with custom Cobalt Strike stagers.',
      },
      location: {
        fullAddress: 'Tower C, DLF Cyber City, Phase II',
        city: 'Gurugram',
        district: 'Gurugram',
        state: 'Haryana',
        country: 'India',
        pinCode: '122002',
        coordinates: { lat: 28.4906, lng: 77.0911 },
      },
      relatedPersons: ['CTO Manish Gupta', 'CISO Radhika Bose'],
      relatedLocations: ['Gurugram Data Center'],
      relatedVehiclesDevices: ['Server Cluster IP 185.220.101.45'],
      evidenceFiles: [
        {
          fileName: 'ransom_note_instruction.txt',
          fileType: 'DOCUMENT',
          originalName: 'READ_ME_NOW.txt',
          fileSize: 4500,
          uploadedAt: new Date(Date.now() - 2 * 86400000),
        },
      ],
      status: 'UNDER_REVIEW',
      statusHistory: [
        { status: 'SUBMITTED', updatedBy: 'Nexa Health Logistics Corp', notes: 'High priority corporate extortion complaint registered.', timestamp: new Date(Date.now() - 2 * 86400000) },
        { status: 'UNDER_REVIEW', updatedBy: 'Agent Sarah Chen', notes: 'ChainTrace AI activated on ransom wallet address.', timestamp: new Date(Date.now() - 1 * 86400000) },
      ],
      assignedDepartment: 'Critical Infrastructure & Ransomware Taskforce',
      assignedOfficer: investigator?._id,
      linkedCaseId: darkNexusCase._id,
    },
    {
      complaintId: 'CMP-20240908-1120D',
      category: 'CYBER_HARASSMENT',
      title: 'Corporate Executive SIM Swapping and Social Media Impersonation',
      description: 'Phone signal dropped unexpectedly yesterday. Suspect cloned SIM card at regional telecom gallery and attempted password resets across confidential corporate email and social media accounts.',
      incidentDateTime: new Date(Date.now() - 1 * 86400000),
      complainant: {
        name: 'Meera Sen',
        phone: '+91 97112 88440',
        email: 'meera.sen@fintech-ventures.com',
        address: 'Greater Kailash II, New Delhi',
        isAnonymous: false,
      },
      location: {
        fullAddress: 'M Block Market, Greater Kailash II',
        city: 'New Delhi',
        district: 'South Delhi',
        state: 'Delhi',
        country: 'India',
        pinCode: '110048',
        coordinates: { lat: 28.5355, lng: 77.2435 },
      },
      relatedPersons: ['Victim Meera Sen'],
      status: 'SUBMITTED',
      statusHistory: [
        { status: 'SUBMITTED', updatedBy: 'Meera Sen', notes: 'Complaint filed online.', timestamp: new Date(Date.now() - 1 * 86400000) },
      ],
      assignedDepartment: 'Cyber Crime Investigation Division',
    },
    {
      complaintId: 'CMP-20240825-3319E',
      category: 'BURGLARY_THEFT',
      title: 'Jewelry Store Armed Burglary and Grey Sedan Escape Route',
      description: 'Four masked perpetrators entered premises during closing hours, broke display vaults, and fled in an unregistered grey sedan heading towards Ring Road.',
      incidentDateTime: new Date(Date.now() - 15 * 86400000),
      complainant: {
        name: 'Rajesh Jewellers (Prop. Rajesh Mehra)',
        phone: '+91 98100 12345',
        email: 'rajesh.jewellers.delhi@gmail.com',
        address: 'Karol Bagh Market, New Delhi',
        isAnonymous: false,
      },
      location: {
        fullAddress: 'Main Ajmal Khan Road, Karol Bagh',
        city: 'New Delhi',
        district: 'Central Delhi',
        state: 'Delhi',
        country: 'India',
        pinCode: '110005',
        coordinates: { lat: 28.6517, lng: 77.1906 },
      },
      relatedPersons: ['Owner Rajesh Mehra', 'Security Guard Ramu'],
      relatedVehiclesDevices: ['Grey Sedan Chassis 7728A'],
      status: 'RESOLVED',
      statusHistory: [
        { status: 'SUBMITTED', updatedBy: 'Rajesh Mehra', notes: 'Complaint lodged.', timestamp: new Date(Date.now() - 15 * 86400000) },
        { status: 'INVESTIGATION_STARTED', updatedBy: 'Agent Sarah Chen', notes: 'CCTV footage correlated.', timestamp: new Date(Date.now() - 14 * 86400000) },
        { status: 'RESOLVED', updatedBy: 'IG Anita Roy', notes: 'All 4 suspects apprehended and 95% stolen property recovered.', timestamp: new Date(Date.now() - 2 * 86400000) },
      ],
      assignedDepartment: 'Special Staff & Crime Branch',
      assignedOfficer: investigator?._id,
    },
  ]);

  // 4. Case Locations
  await LocationRecord.deleteMany({});
  await LocationRecord.create([
    {
      caseId: phoenixCaseId,
      name: 'ShadowTech Solutions Command Server Vault',
      locationType: 'CRIME_SCENE',
      address: 'Plot 48, Okhla Industrial Area Phase III',
      city: 'New Delhi',
      district: 'South East Delhi',
      state: 'Delhi',
      country: 'India',
      pinCode: '110020',
      coordinates: { lat: 28.5355, lng: 77.2690 },
      verificationStatus: 'VERIFIED',
      notes: 'Primary clandestine data center seized under warrant. Host server for voice clone models and phishing SMTP relays.',
      discoveredDate: new Date(Date.now() - 5 * 86400000),
      createdBy: adminId,
    },
    {
      caseId: phoenixCaseId,
      name: 'Suspect Viktor Lazarov Last Known Sighting',
      locationType: 'SUSPECT_LAST_KNOWN',
      address: 'Transit Junction Hotel, Sector 18',
      city: 'Noida',
      district: 'Gautam Buddha Nagar',
      state: 'Uttar Pradesh',
      country: 'India',
      pinCode: '201301',
      coordinates: { lat: 28.5708, lng: 77.3271 },
      verificationStatus: 'REPORTED',
      notes: 'CCTV footage showed individual matching suspect physical description checking out 30 minutes prior to raid.',
      discoveredDate: new Date(Date.now() - 3 * 86400000),
      createdBy: adminId,
    },
    {
      caseId: phoenixCaseId,
      name: 'Vault Safe Deposit Box #402 (Cold Hardware Wallets)',
      locationType: 'EVIDENCE_LOCATION',
      address: 'Vault Safe Custody, Barakhamba Road, Connaught Place',
      city: 'New Delhi',
      district: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      pinCode: '110001',
      coordinates: { lat: 28.6315, lng: 77.2167 },
      verificationStatus: 'VERIFIED',
      notes: '3 Ledger Nano X hardware wallets recovered with cryptographic backup seed phrases.',
      discoveredDate: new Date(Date.now() - 4 * 86400000),
      createdBy: adminId,
    },
    {
      caseId: phoenixCaseId,
      name: 'Key Witness Briefing Location',
      locationType: 'WITNESS_LOCATION',
      address: 'Cyber Hub Executive Lounge, DLF Phase 2',
      city: 'Gurugram',
      district: 'Gurugram',
      state: 'Haryana',
      country: 'India',
      pinCode: '122002',
      coordinates: { lat: 28.4950, lng: 77.0895 },
      verificationStatus: 'REPORTED',
      notes: 'Deposition recorded from former systems engineer employed at ShadowTech.',
      discoveredDate: new Date(Date.now() - 2 * 86400000),
      createdBy: adminId,
    },
    {
      caseId: phoenixCaseId,
      name: 'AI-Inferred Cellular Tower Anchor Hub',
      locationType: 'RELATED_LOCATION',
      address: 'Cell Tower Node DL-ND-091, Sector 62',
      city: 'Noida',
      district: 'Gautam Buddha Nagar',
      state: 'Uttar Pradesh',
      country: 'India',
      pinCode: '201309',
      coordinates: { lat: 28.6280, lng: 77.3649 },
      verificationStatus: 'AI_INFERRED',
      notes: 'Triangulated from anonymous burner IMEI registration pings. Requires physical radio survey.',
      discoveredDate: new Date(Date.now() - 1 * 86400000),
      createdBy: adminId,
    },
    {
      caseId: phoenixCaseId,
      name: 'Abandoned Getaway Vehicle (Grey Sedan)',
      locationType: 'VEHICLE_LOCATION',
      address: 'Under Barapullah Flyover, Ring Road',
      city: 'New Delhi',
      district: 'South Delhi',
      state: 'Delhi',
      country: 'India',
      pinCode: '110013',
      coordinates: { lat: 28.5682, lng: 77.2285 },
      verificationStatus: 'VERIFIED',
      notes: 'Forensic team recovered two burner SIM trays and encrypted USB memory stick.',
      discoveredDate: new Date(Date.now() - 2 * 86400000),
      createdBy: adminId,
    },
  ]);

  // 5. Challenge AI Findings
  await AIFinding.deleteMany({});
  await AIFinding.create([
    {
      caseId: phoenixCaseId,
      findingId: 'FND-PHOENIX-001',
      title: 'Viktor Lazarov directly commands Wallet Alpha cryptocurrency distribution network',
      finding: 'AI intelligence fusion infers Viktor Lazarov as the sole beneficial controller of Wallet Alpha (0x7a2f...6e7f) based on temporal transaction synchronization with encrypted chat sessions.',
      confidence: 86,
      supportingEvidence: [
        'Timestamp match between suspect chat logins and 14 major Ethereum outbound transfers.',
        'Disposable email sender.phoenix@tempmail.io used to fund gas fees on layer 2 bridge.',
        'Witness testimony confirms Lazarov instructed crypto settlement for technical deliverables.',
      ],
      contradictingEvidence: [
        'Wallet Alpha private key was also accessed from an IP block registered in Singapore while Lazarov was confirmed traveling in Eastern Europe.',
        'Two transfers occurred while suspect device was disconnected from mobile network.',
      ],
      missingInformation: [
        'Subpoenaed KYC exchange logs from PhantomEx exchange.',
        'Forensic confirmation of hardware wallet seed backup handwriting.',
      ],
      potentialAssumptions: [
        'Assumes single-operator key ownership without considering multi-signature vault architecture.',
        'Assumes chat activity strictly correlates to wallet signing.',
      ],
      alternativeExplanations: [
        'Wallet Alpha could be managed by an unflagged technical co-conspirator operating under shared API credentials.',
        'The wallet may be an automated clearing pool used by multiple independent affiliates of the syndicate.',
      ],
      recommendedVerifications: [
        'Request Mutual Legal Assistance Treaty (MLAT) disclosure from PhantomEx host jurisdiction.',
        'Perform multi-signature smart contract bytecode disassembly.',
      ],
      criticalQuestions: [
        {
          question: 'What evidence proves Viktor Lazarov had exclusive control of the private keys?',
          answer: 'Circumstantial timestamp alignment only. Cryptographic signature was not signed in custody.',
          category: 'EVIDENCE',
          status: 'FLAGGED',
        },
        {
          question: 'Could there be an innocent intermediary or automated smart contract?',
          answer: 'Yes, multi-signature contract analysis reveals 2-of-3 threshold configuration.',
          category: 'ALTERNATIVE',
          status: 'ADDRESSED',
        },
        {
          question: 'Is this conclusion based on an assumption of single-user ownership?',
          answer: 'Yes, flagged for critical human supervisor review.',
          category: 'ASSUMPTION',
          status: 'FLAGGED',
        },
      ],
      verificationStatus: 'UNDER_CHALLENGE',
      humanReviews: [
        {
          reviewerId: supervisor._id,
          reviewerName: 'IG Anita Roy',
          verdict: 'DISPUTED',
          comment: 'Confidence downgraded from 92% to 86%. Multi-sig keyholder possibility cannot be dismissed before exchange subpoena return.',
          timestamp: new Date(Date.now() - 1 * 86400000),
        },
      ],
      category: 'BLOCKCHAIN_INTELLIGENCE',
      isUnderReview: true,
      createdBy: adminId,
    },
    {
      caseId: phoenixCaseId,
      findingId: 'FND-PHOENIX-002',
      title: 'ShadowTech Solutions Ltd operates exclusively as a criminal front entity',
      finding: 'Corporate filing analysis and fund flow velocity indicates ShadowTech Solutions Ltd has no genuine commercial revenue and exists purely to layer illicit proceeds.',
      confidence: 78,
      supportingEvidence: [
        '89% of inbound corporate revenue originates from high-risk peer-to-peer crypto swaps.',
        'No public client portfolio, published software releases, or verified physical staff payroll.',
      ],
      contradictingEvidence: [
        'Company holds registered GST and software service export licenses with statutory filings.',
        'Legitimate subcontracting agreement found with regional cloud hosting supplier.',
      ],
      missingInformation: [
        'Audited balance sheets from official chartered accountant.',
        'Bank statements for vendor software expense reconciliation.',
      ],
      potentialAssumptions: [
        'Assumed lack of visible commercial client work implies 100% illegitimate operation.',
      ],
      alternativeExplanations: [
        'ShadowTech may operate genuine proprietary software research alongside compromised rogue employees.',
      ],
      recommendedVerifications: [
        'Summon statutory auditor for formal financial deposition.',
      ],
      criticalQuestions: [
        {
          question: 'Is the relationship between ShadowTech and Viktor Lazarov legally documented?',
          answer: 'Lazarov does not appear on Registrar of Companies (ROC) director filings. Proxy director listed.',
          category: 'EVIDENCE',
          status: 'PENDING',
        },
      ],
      verificationStatus: 'REQUIRES_HUMAN_REVIEW',
      category: 'CORPORATE_INTELLIGENCE',
      isUnderReview: true,
      createdBy: adminId,
    },
    {
      caseId: phoenixCaseId,
      findingId: 'FND-PHOENIX-003',
      title: 'Audio sample clone AC-001 vocal formant match with suspect Maria Cortez',
      finding: 'VoiceShield AI biometrics spectral model indicates 91% formant trajectory overlap between intercepted deepfake audio and Maria Cortez reference voice profile.',
      confidence: 91,
      supportingEvidence: [
        'Spectral pitch distribution matches within 1.2% delta across vocal phonemes.',
        'Glottal pulse jitter anomaly index corresponds to reference microphone characteristics.',
      ],
      contradictingEvidence: [
        'Audio clip duration was only 4.8 seconds with significant background street traffic noise.',
      ],
      missingInformation: [
        'Studio-grade acoustic baseline recording of Maria Cortez in controlled setting.',
      ],
      potentialAssumptions: [
        'Short audio duration assumption: voice synthesis tools often simulate generic female formants.',
      ],
      alternativeExplanations: [
        'A commercial female text-to-speech voice model could coincidently share similar formant frequencies.',
      ],
      recommendedVerifications: [
        'Run deep neural voice anti-spoofing detector on lossless uncompressed audio file.',
      ],
      criticalQuestions: [
        {
          question: 'Does the 4.8 second sample meet the international forensic standard for legal admissibility?',
          answer: 'Standard requires minimum 15 seconds of clean speech. Sample is indicative, not legally conclusive.',
          category: 'EVIDENCE',
          status: 'FLAGGED',
        },
      ],
      verificationStatus: 'VERIFIED',
      category: 'VOICE_INTELLIGENCE',
      isUnderReview: false,
      createdBy: adminId,
    },
  ]);

  // 6. What-If Simulation
  await Simulation.deleteMany({});
  await Simulation.create([
    {
      caseId: phoenixCaseId,
      simulationId: 'SIM-PHOENIX-001',
      title: 'Hypothetical Exclusion of Intermediary James Okafor',
      description: 'Test scenario evaluating case network structure if James Okafor is cleared as an unwitting victim rather than an active co-conspirator.',
      hypothesis: 'If James Okafor acted under duress without criminal conspiracy, removing his account links should isolate Wallet Beta and reveal independent routing.',
      modifications: {
        excludedRelationshipIds: [],
        excludedEntityIds: [],
        addedHypotheticalEntities: [
          {
            id: 'hypo-entity-01',
            name: 'Hypothetical Offshore Broker X',
            type: 'ORGANIZATION',
            riskLevel: 'HIGH',
            role: 'Direct Layering Broker',
          },
        ],
        addedHypotheticalRelationships: [
          {
            id: 'hypo-rel-01',
            source: '0x7a2f8e9b3c1d4a5f6e7b8c9d0e1f2a3b4c5d6e7f',
            target: 'hypo-entity-01',
            relationshipType: 'DIRECT_DEPOSIT',
            strength: 85,
          },
        ],
      },
      baselineRiskScore: 87,
      simulatedRiskScore: 62,
      riskScoreDelta: -25,
      comparisonSummary: 'Excluding James Okafor drops overall case risk from 87 to 62 points (-25 delta). Network analysis shows the criminal cluster remains functionally intact through Wallet Alpha directly connecting to offshore exchange endpoints.',
      watermark: 'HYPOTHETICAL / SIMULATION',
      createdBy: adminId,
    },
  ]);

  // 7. Supervisor Escalations
  await Escalation.deleteMany({});
  await Escalation.create([
    {
      escalationId: 'ESC-20240905-001',
      caseId: phoenixCaseId,
      reason: 'Challenge AI identified severe evidentiary contradiction regarding Wallet Alpha ownership (Finding FND-PHOENIX-001). Risk score is 87 (CRITICAL). Supervisor authorization required before applying for freezing injunction.',
      trigger: 'CONTRADICTORY_EVIDENCE',
      priority: 'CRITICAL',
      status: 'UNDER_REVIEW',
      submittedBy: investigator?._id || adminId,
      submittedByName: 'Agent Sarah Chen',
      supervisorId: supervisor._id,
      supervisorName: 'IG Anita Roy',
      supervisorComments: 'Reviewing cross-border MLAT provisions and multi-sig wallet contract disassembly with legal counsel.',
      reviewNotes: [
        {
          note: 'Escalation initiated following Challenge AI dispute submission by Agent Chen.',
          authorName: 'Agent Sarah Chen',
          authorRole: 'INVESTIGATOR',
          authorId: investigator?._id || adminId,
          createdAt: new Date(Date.now() - 3 * 86400000),
        },
        {
          note: 'Supervisor IG Anita Roy accepted file for formal legal department review.',
          authorName: 'IG Anita Roy',
          authorRole: 'SUPERVISOR',
          authorId: supervisor._id,
          createdAt: new Date(Date.now() - 2 * 86400000),
        },
      ],
      dateSubmitted: new Date(Date.now() - 3 * 86400000),
    },
    {
      escalationId: 'ESC-20240907-002',
      caseId: darkNexusCase._id,
      reason: 'Urgent cross-border Hawala transfer of ₹2.4 Crores detected. Mutual legal assistance clearance required to freeze overseas exchange endpoint.',
      trigger: 'HIGH_RISK_SCORE',
      priority: 'HIGH',
      status: 'PENDING',
      submittedBy: investigator?._id || adminId,
      submittedByName: 'Agent Sarah Chen',
      reviewNotes: [
        {
          note: 'Immediate supervisor intervention requested to dispatch emergency advisory to FIU-IND (Financial Intelligence Unit).',
          authorName: 'Agent Sarah Chen',
          authorRole: 'INVESTIGATOR',
          authorId: investigator?._id || adminId,
          createdAt: new Date(Date.now() - 1 * 86400000),
        },
      ],
      dateSubmitted: new Date(Date.now() - 1 * 86400000),
    },
  ]);

  logger.info('✅ Enterprise modules seeded successfully (multi-cases, complaints, locations, challenge AI, simulations, escalations)!');
}

// Standalone seed runner
if (require.main === module) {
  const { connectDatabase } = require('../config/database');
  connectDatabase().then(() => seedDatabase().then(() => process.exit(0)));
}

