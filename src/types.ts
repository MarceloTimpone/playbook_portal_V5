/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'PRE_SALES' | 'FINANCE' | 'PM_GOVERNANCE' | 'PMO_CORPORATE';

export type AppRole = 'Demonstrativo' | 'PMO' | 'PMO ADM';

export interface AppUser {
  id: string;
  username: string;
  name: string;
  role: AppRole;
  password?: string;
  isFirstLogin: boolean;
  active: boolean;
  email?: string;
}

export type ProjectStatus = 
  | 'PRE_SALES_DRAFT' 
  | 'AWAITING_CUSTOMER_REG' 
  | 'AWAITING_PMO_APP' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'CLOSURE_PENDING' 
  | 'CLOSED';

export interface Customer {
  id: string;
  name: string;
  cnpj: string;
  code: string; // S/4 HANA Customer Code
  status: 'ACTIVE' | 'PENDING_FINANCE';
  countryOfOrigin: string;
  requesterNotes?: string;
  requestedBy?: string;
}

export interface CurrencyFinanceInput {
  currency: string;
  organization: string;
  costCenter: string;
  profitCenter: string;
  product: string;
  sapProjectId?: string;
  sapPreSalesProjectId?: string;
}

export interface Project {
  id: string;
  name: string;
  type: string; // e.g. AMS, T&M, etc.
  solution: string; // e.g. RISE, GROW, etc.
  clientId: string;
  clientName: string;
  clientCode: string;
  clientCnpj: string;
  country: string;
  manager: string;
  startDate: string;
  endDate: string;
  notes: string;
  mirrorCurrency: boolean;
  mirrorCurrencyCode?: string;
  selectedMirrorCurrencies?: string[]; // List of multiple foreign currencies selected (e.g., ['USD', 'EUR'])
  currenciesFinance?: Record<string, CurrencyFinanceInput>; // Financial parameters for each currency
  isGlobalFinance: boolean; // true if mirrorCurrency is true
  sapProjectId?: string; // Created automatically upon PMO approval (for base currency)
  sapPreSalesProjectId?: string; // Created automatically (Pre sales internal mirror for base currency)
  status: ProjectStatus;
  
  // Filled by finance (fallback / base currency)
  currency?: string;
  organization?: string;
  costCenter?: string;
  profitCenter?: string;
  product?: string;
  
  requestedBy?: string;
  createdAt?: string;
  pmoNotes?: string;
  createCommercialMirror?: boolean; // If true, creates a mirror project for the commercial team in S4
  closureRequestedBy?: string;
  closureReason?: string;
}

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location: string;
  department: string;
  active: boolean;
}

export interface GovernanceProfile {
  role: UserRole;
  label: string;
  description: string;
  permissions: {
    canCreateCustomer: boolean;
    canCreateProject: boolean;
    canFillFinance: boolean;
    canApproveProject: boolean;
    canRequestClosure: boolean;
    canApproveClosure: boolean;
    canEditMasterList: boolean;
    canModifyGovernance: boolean;
  };
}

export interface QACriterion {
  id: string;
  number: number;
  text: string;
  type: string; // e.g. 'Porcentagem' | 'Sim / Parcial / Não / N/A'
  weight: number;
}

export interface QAReview {
  id: string;
  client: string;
  line: string;
  projectName: string;
  phase: string;
  manager: string;
  pptLink: string;
  status: 'Revisado e validado' | 'Novo QA realizado' | 'Novo QA necessário' | 'Aguardando revisão';
  scores: Record<string, number | string>; // Map of criterion number (e.g., '1', '14') to value (number for %, string for Sim/Parcial/Não/NA)
  adherence: number;
  validationDate: string;
  pmoObservations?: string;
  pendencyCount: number;
  nextQaRequired: string | boolean;
}

export interface RSERecord {
  id: string;
  client: string;
  line: string;
  projectName: string;
  date: string;
  delayed: 'Sim' | 'Não';
  pendencies: string; // e.g., 'Nenhuma', 'Simples/Moderadas', 'Graves'
  observations?: string;
}

export interface MeetingSummary {
  id: string;
  client: string;
  line: string;
  projectName: string;
  phase: string;
  manager: string;
  qaDone: 'Sim' | 'Não';
  lastMeetingDate: string;
  delayedMeeting: 'Sim' | 'Não' | 'N/A';
}

export interface AppLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface ExcelMapping {
  client: string;
  line: string;
  projectName: string;
  phase: string;
  manager: string;
  pptLink: string;
  status: string;
  validationDate: string;
  nextQaRequired: string;
  pmoObservations: string;
  criteriaPrefix: string;
}

export interface AppNotification {
  id: string;
  userId: string; // The user ID/email targeted (e.g. 'marcelo.timpone@exedconsulting.com' or 'all')
  title: string;
  message: string;
  timestamp: string;
  read: boolean; // Local read state or generic read flag
  type: 'error' | 'success' | 'info' | 'warning';
}

