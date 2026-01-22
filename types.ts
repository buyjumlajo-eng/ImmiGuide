
export type Language = 'en' | 'es' | 'zh' | 'ar' | 'fr' | 'pt' | 'hi';

export type SubscriptionTier = 'free' | 'one_form' | 'monthly' | 'annual';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  subscriptionTier: SubscriptionTier;
}

export interface RFEAnalysis {
  summary: string;
  missingEvidence: string[];
  severity: 'low' | 'medium' | 'high';
  actionItems: string[];
  legalTone: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface FormFieldHelp {
  plainEnglish: string;
  risks: string[];
  example: string;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
  suggestion?: string;
  severity: 'warning' | 'error' | 'success';
}

export interface CaseStat {
  daysPending: number;
  averageDays: number;
  percentile: number;
  status: 'Normal' | 'Delayed' | 'Critical';
}

export interface Attorney {
  id: string;
  name: string;
  firm: string;
  image: string;
  specialties: string[];
  languages: string[];
  rating: number;
  reviewCount: number;
  successRate: number;
  priceStart: number;
  isVerified: boolean;
  nextAvailable: string;
}

export interface AttorneyApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  firmName: string;
  barState: string;
  barNumber: string;
  yearAdmitted: string;
  specialties: string[];
  bio: string;
  partnershipModel: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: Date;
}

export interface StoredDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: Date;
  status: 'scanning' | 'verified' | 'issue';
  ocrData?: string;
  previewUrl?: string; // Legacy unencrypted URL or placeholder
  encryptedData?: string; // Base64 ciphertext
  iv?: string; // Initialization vector
  isEncrypted?: boolean;
  storagePath?: string;
}

export interface PredictionResult {
  estimatedDate: string;
  confidence: number;
  factors: string[];
  recommendation: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  date: Date;
}

export interface CaseLawResult {
  caseName: string;
  citation: string;
  year: string;
  relevanceScore: number;
  summary: string;
  applicationToUser: string;
  tags: string[];
}

export interface InterviewFeedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  redFlags: string[];
  confidenceTips: string;
}

export interface RiskProfile {
  approvalOdds: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  redFlags: string[];
  warnings: string[];
  strengths: string[];
  actionPlan: string[];
}