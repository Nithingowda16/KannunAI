import { UploadedDocument } from '../types/document';
import { createDocumentChunks } from '../services/document/chunker';

export const SAMPLE_EMPLOYMENT_AGREEMENT_TEXT = `
EMPLOYMENT AGREEMENT

THIS EMPLOYMENT AGREEMENT (the "Agreement") is made effective as of January 15, 2026 (the "Effective Date"), by and between Apex Global Technologies Inc., a Delaware corporation ("Employer"), and Jane Doe ("Employee").

SECTION 1. POSITION AND DUTIES
Employer hereby employs Employee as Senior Software Architect. Employee shall perform duties faithfully, diligently, and to the best of Employee's ability in accordance with corporate policies.

SECTION 2. COMPENSATION AND BENEFITS
Employer shall pay Employee a base salary of $185,000 per annum, payable in semi-monthly installments. Employee shall be eligible to participate in standard medical, dental, and 401(k) retirement benefit plans provided to full-time employees.

SECTION 3. TERM AND TERMINATION
(a) Term: The initial term of employment under this Agreement shall commence on the Effective Date and continue for a period of one (1) year.
(b) Automatic Renewal: This Agreement shall automatically renew for successive one-year terms unless either party provides written notice of non-renewal at least sixty (60) days prior to the expiration of the current term.
(c) Termination by Employer: Employer may terminate Employee's employment at any time for Cause immediately upon written notice, or without Cause upon thirty (30) days' written notice.

SECTION 4. INTELLECTUAL PROPERTY ASSIGNMENT
Employee agrees that all inventions, software code, trade secrets, patents, designs, documentation, and work product conceived, developed, or reduced to practice by Employee during employment ("Work Product") shall belong exclusively to Employer as work made for hire. Employee hereby assigns all right, title, and interest in Work Product to Employer.

SECTION 5. CONFIDENTIALITY
Employee agrees to hold in strict confidence all non-public technical, financial, customer, and business information ("Confidential Information") of Employer. Obligations of confidentiality shall survive termination of employment indefinitely.

SECTION 6. RESTRICTIVE COVENANTS AND NON-COMPETE
During the employment term and for a period of twelve (12) months following termination of employment for any reason, Employee shall not, directly or indirectly, engage in, consult for, or assist any entity that directly competes with Employer in the field of cloud-native AI software architecture within North America.

SECTION 7. GOVERNING LAW AND DISPUTE RESOLUTION
This Agreement shall be governed by the laws of the State of California. Any dispute arising out of or relating to this Agreement shall be resolved through binding arbitration administered by JAMS in San Francisco, California.
`.trim();

export const SAMPLE_SAAS_TERMS_TEXT_V1 = `
SAAS MASTER SERVICES AGREEMENT (VERSION 1.0)

THIS MASTER SERVICES AGREEMENT is entered into as of March 1, 2026, by CloudPulse Solutions Inc. ("Provider") and Subscriber ("Customer").

1. SERVICES AND ACCESS
Provider grants Customer a non-exclusive, non-transferable right to access and use the CloudPulse Analytics Platform during the Subscription Term.

2. PAYMENT AND FEES
Customer shall pay all recurring subscription fees specified in the Order Form. Fees are invoiced annually in advance and are due within thirty (30) days of invoice date. Unpaid invoices accrue interest at 1.5% per month.

3. TERM AND AUTOMATIC RENEWAL
The initial subscription term is twelve (12) months. The agreement automatically renews for consecutive 12-month periods unless Customer provides written cancellation notice at least forty-five (45) days before term end.

4. LIMITATION OF LIABILITY
IN NO EVENT SHALL PROVIDER'S TOTAL AGGREGATE LIABILITY EXCEED THE TOTAL FEES PAID BY CUSTOMER IN THE THREE (3) MONTHS PRECEDING THE CLAIM. PROVIDER SHALL NOT BE LIABLE FOR INDIRECT OR CONSEQUENTIAL DAMAGES.
`.trim();

export const SAMPLE_SAAS_TERMS_TEXT_V2 = `
SAAS MASTER SERVICES AGREEMENT (VERSION 2.0 - AMENDED)

THIS MASTER SERVICES AGREEMENT is entered into as of March 1, 2026, by CloudPulse Solutions Inc. ("Provider") and Subscriber ("Customer").

1. SERVICES AND ACCESS
Provider grants Customer a non-exclusive right to access the CloudPulse Platform.

2. PAYMENT AND FEES
Customer shall pay all subscription fees. Fees are invoiced annually in advance and are due within fifteen (15) days of invoice date. Late fees of 2.0% per month apply to overdue balances.

3. TERM AND CANCELLATION
The initial subscription term is twelve (12) months. Customer may terminate this agreement at any time by providing thirty (30) days' written notice. Automatic renewal has been removed.

4. INTELLECTUAL PROPERTY & DATA PRIVACY
Customer retains sole ownership of all uploaded data. Provider agrees to comply with GDPR and CCPA data privacy frameworks.

5. LIMITATION OF LIABILITY
MUTUAL LIABILITY SHALL BE CAPPED AT TOTAL FEES PAID BY CUSTOMER IN THE PRECEDING TWELVE (12) MONTHS. PROVIDER WARRANTS 99.9% UPTIME SLA.
`.trim();

export function getSampleDocument(type: 'employment' | 'saas_v1' | 'saas_v2'): UploadedDocument {
  const text =
    type === 'employment'
      ? SAMPLE_EMPLOYMENT_AGREEMENT_TEXT
      : type === 'saas_v1'
      ? SAMPLE_SAAS_TERMS_TEXT_V1
      : SAMPLE_SAAS_TERMS_TEXT_V2;

  const filename =
    type === 'employment'
      ? 'Sample_Employment_Agreement.txt'
      : type === 'saas_v1'
      ? 'CloudPulse_SaaS_Agreement_V1.txt'
      : 'CloudPulse_SaaS_Agreement_V2.txt';

  const docId = `sample_${type}_${Date.now()}`;
  const pageCount = 2;
  const chunks = createDocumentChunks(docId, text, pageCount);

  return {
    id: docId,
    filename,
    fileSize: text.length,
    mimeType: 'text/plain',
    uploadedAt: new Date(),
    rawText: text,
    pageCount,
    wordCount: text.split(/\s+/).length,
    chunks,
    hash: 'sample_hash_' + type
  };
}
