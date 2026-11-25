// VeriTrust AI — Mock Identity & Document Verification Service
// IMPORTANT: Does NOT automatically declare any identity as fake.
// All results require human review and are investigative indicators only.

export interface IdentityVerificationResult {
  documentType: string;
  documentNumber?: string;
  subjectName?: string;
  dateOfBirth?: string;
  nationality?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  extractedFields: Record<string, any>;
  inconsistencies: { field: string; description: string; severity: string }[];
  riskScore: number;
  verificationStatus: string;
  riskLevel: string;
  indicators: { name: string; description: string; severity: string }[];
  metadataFlags: string[];
  disclaimer: string;
  requiresHumanReview: boolean;
}

const documentTemplates: Record<string, Record<string, any>> = {
  PASSPORT: {
    fields: ['documentNumber', 'surname', 'givenNames', 'nationality', 'dateOfBirth', 'sex', 'placeOfBirth', 'issueDate', 'expiryDate', 'issuingAuthority', 'mrzLine1', 'mrzLine2'],
    expectedFormat: { documentNumber: /^[A-Z]{1}[0-9]{8}$/, mrzLine1: /^P</, expiryDate: /^\d{6}$/ },
  },
  NATIONAL_ID: {
    fields: ['idNumber', 'fullName', 'dateOfBirth', 'address', 'issueDate', 'expiryDate', 'issuingState'],
    expectedFormat: { idNumber: /^[A-Z]{2}[0-9]{10}$/ },
  },
  DRIVERS_LICENSE: {
    fields: ['licenseNumber', 'fullName', 'dateOfBirth', 'address', 'vehicleClasses', 'issueDate', 'expiryDate'],
    expectedFormat: { licenseNumber: /^[A-Z0-9]{6,15}$/ },
  },
};

export async function analyzeIdentity(
  documentType: string,
  fields: Record<string, string>,
  fileName?: string
): Promise<IdentityVerificationResult> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const inconsistencies: { field: string; description: string; severity: string }[] = [];
  const metadataFlags: string[] = [];
  const indicators: { name: string; description: string; severity: string }[] = [];

  // Date consistency checks
  if (fields.issueDate && fields.expiryDate) {
    const issue = new Date(fields.issueDate);
    const expiry = new Date(fields.expiryDate);
    if (issue >= expiry) {
      inconsistencies.push({ field: 'dates', description: 'Issue date is after or equal to expiry date — chronological inconsistency', severity: 'HIGH' });
    }
    if (expiry < new Date()) {
      inconsistencies.push({ field: 'expiryDate', description: 'Document has expired', severity: 'MEDIUM' });
    }
  }

  if (fields.dateOfBirth && fields.issueDate) {
    const dob = new Date(fields.dateOfBirth);
    const issue = new Date(fields.issueDate);
    const ageAtIssue = (issue.getTime() - dob.getTime()) / (365.25 * 24 * 3600 * 1000);
    if (ageAtIssue < 0) {
      inconsistencies.push({ field: 'dateOfBirth', description: 'Date of birth is after issue date — impossible chronology', severity: 'HIGH' });
    }
    if (ageAtIssue > 120) {
      inconsistencies.push({ field: 'dateOfBirth', description: 'Age at issue exceeds 120 years — anomalous', severity: 'MEDIUM' });
    }
  }

  // Font/format checks (simulated)
  if (fileName) {
    const hash = Array.from(fileName).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    if (hash % 3 === 0) {
      metadataFlags.push('PDF metadata creation date predates document issue date');
      inconsistencies.push({ field: 'metadata', description: 'File metadata suggests document was created before stated issue date', severity: 'HIGH' });
    }
    if (hash % 4 === 1) {
      metadataFlags.push('Image DPI inconsistent with official document standards');
      indicators.push({ name: 'Image Quality Anomaly', description: 'Document image resolution does not match typical government-issued document standards', severity: 'MEDIUM' });
    }
  }

  // Name/nationality consistency
  if (fields.nationality && fields.issuingAuthority) {
    const knownMismatches = [['USA', 'UK'], ['IND', 'PAK']];
    for (const [nat, auth] of knownMismatches) {
      if (fields.nationality.toUpperCase().includes(nat) && fields.issuingAuthority.toUpperCase().includes(auth)) {
        inconsistencies.push({ field: 'nationality', description: `Nationality (${fields.nationality}) inconsistent with issuing authority (${fields.issuingAuthority})`, severity: 'HIGH' });
      }
    }
  }

  // Add general indicators based on inconsistency count
  if (inconsistencies.length >= 2) {
    indicators.push({ name: 'Multiple Field Inconsistencies', description: `${inconsistencies.length} inconsistencies detected across document fields`, severity: 'HIGH' });
  }
  if (inconsistencies.length > 0) {
    indicators.push({ name: 'Document Consistency Check', description: 'One or more fields fail cross-validation checks', severity: inconsistencies.some(i => i.severity === 'HIGH') ? 'HIGH' : 'MEDIUM' });
  }

  const riskScore = Math.min(100, inconsistencies.length * 20 + indicators.length * 10 + metadataFlags.length * 15);
  const riskLevel = riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : riskScore >= 15 ? 'LOW' : 'MINIMAL';

  const verificationStatus =
    riskScore >= 70 ? 'REQUIRES_VERIFICATION'
    : riskScore >= 40 ? 'SUSPICIOUS — Review Recommended'
    : riskScore >= 15 ? 'MINOR_CONCERNS'
    : 'CONSISTENT';

  return {
    documentType,
    documentNumber: fields.documentNumber || fields.idNumber || fields.licenseNumber,
    subjectName: fields.fullName || fields.surname,
    dateOfBirth: fields.dateOfBirth,
    nationality: fields.nationality,
    issuingAuthority: fields.issuingAuthority || fields.issuingState,
    issueDate: fields.issueDate,
    expiryDate: fields.expiryDate,
    extractedFields: { ...fields },
    inconsistencies,
    riskScore,
    verificationStatus,
    riskLevel,
    indicators,
    metadataFlags,
    disclaimer: 'This analysis does not constitute legal verification. Results are investigative indicators only. Human expert review is mandatory before any official action is taken. AI analysis may produce false positives and false negatives.',
    requiresHumanReview: true,
  };
}
