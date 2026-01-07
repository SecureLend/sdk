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
  bureau?: 'Experian' | 'Equifax' | 'TransUnion' | 'VantageScore';
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
    entityType?: 'sole_proprietorship' | 'partnership' | 'llc' | 's_corp' | 'c_corp' | 'non_profit';
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
  | 'working_capital'
  | 'equipment_purchase'
  | 'real_estate'
  | 'business_acquisition'
  | 'inventory'
  | 'expansion'
  | 'debt_consolidation'
  | 'payroll'
  | 'other';

export interface LoanComparisonRequest {
  amount: number;
  purpose: LoanPurpose;
  business: {
    revenue: number;
    creditScore: number;
    timeInBusiness: number;
    industry?: string;
    entityType?: string;
    location?: {
      state?: string;
      country?: string;
    };
  };
  termPreferenceMonths?: number;
  collateralAvailable?: boolean;
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
      type: 'fixed' | 'variable';
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
    approvalProbability: number;
    matchScore: number;
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
    bestApprovalProbability: number;
    fastestFunding: string;
  };
  metadata: {
    queryId: string;
    timestamp: string;
  };
  widget?: string;
}

// ============================================================================
// Banking Types
// ============================================================================

export interface BankingComparisonRequest {
  accountType: 'checking' | 'savings' | 'both';
  monthlyRevenue?: number;
  monthlyTransactions?: number;
  averageBalance?: number;
  featuresNeeded?: string[];
  accountingSoftware?: 'quickbooks' | 'xero' | 'freshbooks' | 'none';
  maxResults?: number;
}

export interface BankingAccount {
  accountId: string;
  bank: {
    id: string;
    name: string;
    type: string;
  };
  account: {
    name: string;
    type: string;
    description?: string;
  };
  ratesAndFees: {
    interestRate?: {
      apy?: Percentage;
    };
    monthlyFee?: Money;
    feeWaiverConditions?: string[];
    minimumBalance?: Money;
  };
  features?: {
    onlineBanking?: boolean;
    mobileApp?: {
      available: boolean;
      rating?: number;
    };
    accountingIntegrations?: string[];
  };
  matching?: {
    matchScore?: number;
    estimatedMonthlyCost?: Money;
    pros?: string[];
    cons?: string[];
  };
}

export interface BankingComparisonResponse {
  accounts: BankingAccount[];
  summary: {
    lowestMonthlyCost: number;
    highestApy: number;
    bestForHighTransactions?: string;
    bestForInterest?: string;
  };
  widget?: string;
}

// ============================================================================
// Credit Card Types
// ============================================================================

export interface CreditCardComparisonRequest {
  creditScore: number;
  monthlySpend: number;
  spendCategories?: Array<{
    category: string;
    amount: number;
  }>;
  preferences?: {
    rewardsType?: 'cashback' | 'points' | 'miles';
    annualFeeMax?: number;
    introApr?: boolean;
  };
  business?: Partial<BusinessProfile>;
  maxResults?: number;
}

export interface CreditCardOffer {
  cardId: string;
  cardName: string;
  issuer: string;
  rewards: {
    type: 'cashback' | 'points' | 'miles';
    baseRate: number;
    bonusCategories?: Array<{
      category: string;
      rate: number;
    }>;
  };
  fees: {
    annualFee: Money;
    foreignTransactionFee?: Percentage;
  };
  apr: {
    purchaseApr: Percentage;
    introApr?: Percentage;
    introPeriodMonths?: number;
  };
  estimatedAnnualRewards?: Money;
  approvalProbability?: number;
  applyUrl: string;
}

export interface CreditCardComparisonResponse {
  cards: CreditCardOffer[];
  widget?: string;
}

// ============================================================================
// Calculation Types
// ============================================================================

export interface LoanCalculation {
  amount: number;
  rate: number;
  termMonths: number;
  fees?: {
    origination?: number;
    processing?: number;
  };
}

export interface LoanCalculationResult {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  apr: number;
  amortizationSchedule?: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

// ============================================================================
// SDK Config
// ============================================================================

export interface SecureLendConfig {
  /** MCP Server URL (default: https://mcp.securelend.ai/sse) */
  mcpURL?: string;

  /** Environment (default: production) */
  environment?: 'production' | 'development';
}
