/**
 * Type definitions for SecureLend SDK
 *
 * @packageDocumentation
 */

// ============================================================================
// Common Types
// ============================================================================

export interface Money {
  amount: number;
  currency?: string; // ISO 4217 (default: 'USD')
}

export type Percentage = number; // 0-100
export type BasisPoints = number;
export type DateString = string; // ISO 8601

export interface CreditScore {
  score: number; // 300-850
  bureau?: "Experian" | "Equifax" | "TransUnion" | "VantageScore";
  date?: DateString;
}

export interface Geography {
  country: string; // ISO 3166-1 alpha-2
  state?: string;
  city?: string;
  postalCode?: string;
}

// ============================================================================
// Business Profile
// ============================================================================

export interface BusinessProfile {
  basic?: {
    legalName?: string;
    dba?: string;
    ein?: string;
    entityType?:
      | "sole_proprietorship"
      | "partnership"
      | "llc"
      | "s_corp"
      | "c_corp"
      | "non_profit";
    incorporationDate?: DateString;
    industry?: {
      naicsCode?: string;
      description?: string;
    };
  };

  location?: {
    headquarters?: Geography;
    operatingStates?: string[];
    numLocations?: number;
  };

  financials?: {
    revenue?: {
      annual?: Money;
      monthlyAverage?: Money;
      trailing12Months?: Money;
      growthRate?: Percentage;
    };
    existingDebt?: {
      totalDebt?: Money;
      monthlyDebtService?: Money;
    };
  };

  credit?: {
    ownerCreditScore?: CreditScore;
    bankruptcyHistory?: boolean;
  };
}

// ============================================================================
// Loan Types
// ============================================================================

export type LoanPurpose =
  | "working_capital"
  | "equipment_purchase"
  | "real_estate"
  | "business_acquisition"
  | "inventory"
  | "expansion"
  | "debt_consolidation"
  | "payroll"
  | "other";

export interface BusinessLoanComparisonRequest {
  loanAmount: number;
  purpose: string;
  annualRevenue?: number;
  industry?: string;
  state?: string;
  maxResults?: number;
}

export interface PersonalLoanComparisonRequest {
  loanAmount: number;
  purpose: LoanPurpose;
  creditScore?: number;
  state?: string;
  maxResults?: number;
}

export interface MortgageComparisonRequest {
  propertyValue: number;
  loanAmount: number;
  creditScore?: number;
  state: string;
  maxResults?: number;
}

export interface AutoLoanComparisonRequest {
  loanAmount: number;
  creditScore?: number;
  vehicleType: "new" | "used";
  maxResults?: number;
}

export interface StudentLoanComparisonRequest {
  loanAmount: number;
  creditScore?: number;
  degreeType: "undergraduate" | "graduate" | "parent";
  maxResults?: number;
}

export interface LoanOffer {
  offerId: string;
  lender: {
    id: string;
    name: string;
    type: string;
  };
  product: {
    name: string;
    type: string;
    description?: string;
  };
  terms: {
    amount: Money;
    interestRate: {
      type: "fixed" | "variable";
      rate: Percentage;
      apr: Percentage;
    };
    termMonths: number;
    payment?: {
      amount: Money;
      frequency: string;
    };
    totalCost: Money;
  };
  fees?: {
    origination?: {
      amount?: Money;
      percentage?: Percentage;
    };
    processing?: Money;
  };
  matching: {
    matchScore?: number;
    matchReasons?: string[];
  };
  process?: {
    applicationUrl?: string;
    fundingSpeed?: {
      description: string;
    };
  };
}

export interface LoanComparisonResponse {
  offers: LoanOffer[];
  summary: {
    totalOffers: number;
    bestRate: number;
    fastestFunding: string;
  };
  metadata: {
    queryId: string;
    timestamp: string;
  };
  widget?: string;
}


// ============================================================================
// Credit Card Types
// ============================================================================

export interface PersonalCreditCardComparisonRequest {
  creditScore: number;
  monthlySpend: number;
  spendCategories?: Array<{
    category: string;
    amount: number;
  }>;
  preferences?: {
    rewardsType?: "cashback" | "points" | "miles";
    annualFeeMax?: number;
    introApr?: boolean;
  };
  maxResults?: number;
}

export interface PersonalCreditCardOffer {
  cardId: string;
  name: string;
  issuer: string;
  bestFor: string;
  recommendedCreditScore: string;
  rewardsRate: string;
  introOffer: string;
  applyUrl: string;
}

export interface PersonalCreditCardComparisonResponse {
  offers: PersonalCreditCardOffer[];
  widget?: string;
}

export interface BusinessCreditCardComparisonRequest {
  creditScore?: number;
  annualRevenue?: number;
  businessAgeInYears?: number;
  maxResults?: number;
}

export interface BusinessCreditCardOffer {
  cardId: string;
  name: string;
  issuer: string;
  welcomeBonus: string;
  terms: {
    apr: number;
    annualFee: number;
  };
  applyUrl: string;
}

export interface BusinessCreditCardComparisonResponse {
  offers: BusinessCreditCardOffer[];
  widget?: string;
}

// ============================================================================
// Banking Types (Extended)
// ============================================================================

export interface BusinessBankingComparisonRequest {
  industry?: string;
  monthlyTransactions?: number;
  maxResults?: number;
}

export interface BusinessBankingOffer {
  accountId: string;
  name: string;
  issuer: string;
  bestFor: string;
  apy: string;
  monthlyFee: string;
}

export interface BusinessBankingComparisonResponse {
  offers: BusinessBankingOffer[];
  widget?: string;
}

export interface PersonalBankingComparisonRequest {
  features?: string[];
  maxResults?: number;
}

export interface PersonalBankingOffer {
  accountId: string;
  name: string;
  issuer: string;
  bestFor: string;
  apy: string;
  monthlyFee: string;
}

export interface PersonalBankingComparisonResponse {
  offers: PersonalBankingOffer[];
  widget?: string;
}

export interface SavingsAccountComparisonRequest {
  initialDeposit?: number;
  maxResults?: number;
}

export interface SavingsAccountOffer {
  accountId: string;
  name: string;
  issuer: string;
  apy: string;
  monthlyFee: string;
  minBalanceForApy: string;
}

export interface SavingsAccountComparisonResponse {
  offers: SavingsAccountOffer[];
  widget?: string;
}

// ============================================================================
// Calculation Types
// ============================================================================

export interface LoanCalculationRequest {
  loanAmount: number;
  interestRate: number;
  loanTermInMonths: number;
}

export interface LoanCalculationResponse {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}

export interface MortgageCalculationRequest {
  propertyValue: number;
  downPayment: number;
  interestRate: number;
  loanTermInYears: number;
  propertyTaxRate: number;
  homeInsurance: number;
}

export interface MortgageCalculationResponse {
  loanAmount: number;
  principalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyHomeInsurance: number;
  totalMonthlyPayment: number;
}

export interface LeaseVsPurchaseRequest {
  vehiclePrice: number;
  downPayment: number;
  loanTermInMonths: number;
  interestRate: number;
  monthlyLeasePayment: number;
  leaseTermInMonths: number;
  expectedOwnershipInMonths: number;
}

export interface LeaseVsPurchaseResponse {
  purchaseAnalysis: {
    monthlyPayment: number;
    totalCostOfOwnership: number;
  };
  leaseAnalysis: {
    totalCostOfLeasing: number;
  };
  comparison: {
    recommendation: string;
  };
}

// ============================================================================
// Application Management Types
// ============================================================================

export interface GetOfferRequest {
  offerId: string;
  sessionId: string;
  applicationDetails: Record<string, any>; // User-filled form data
}

export interface GetMultipleOffersRequest {
  offerIds: string[];
  sessionId: string;
  applicationDetails: Record<string, any>;
}

export interface ApplicationResponse {
  id: string;
  status: string;
  productType: string;
  submittedAt: DateString;
  providers: Array<{
    providerName: string;
    status: string;
  }>;
}

export interface DisplayOfferFormRequest {
  offerId: string;
  sessionId: string;
}

export interface DisplayOfferFormResponse {
  productType: string;
  offer: LoanOffer | PersonalCreditCardOffer; // etc.
  widget?: string;
}

export interface TrackOfferStatusRequest {
  applicationId?: string;
  email?: string;
}

export interface TrackOfferStatusResponse {
  applications: ApplicationResponse[];
  widget?: string;
}

export interface DisplayUploadDocumentsFormRequest {
  applicationId: string;
}

export interface DisplayUploadDocumentsFormResponse {
  widget?: string;
}

export interface SubmitDocumentsRequest {
  applicationId: string;
  documentType: string;
  fileName: string;
  fileType: string;
}

export interface SubmitDocumentsResponse {
  success: boolean;
  message: string;
  documentId?: string;
  uploadUrl?: string;
}

// ============================================================================
// SDK Config
// ============================================================================

export interface SecureLendConfig {
  /** MCP Server URL (default: https://mcp.securelend.ai/mcp) */
  serverUrl?: string;
}
