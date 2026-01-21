import { z } from "zod";

// A generic schema for application data, which can be any of the search schemas
const anyObjectSchema = z.object({}).passthrough();

// Shared Enums
export enum CreditTier {
  PRIME = "PRIME",
  NEAR_PRIME = "NEAR_PRIME",
  SUBPRIME = "SUBPRIME",
  DEEP_SUBPRIME = "DEEP_SUBPRIME",
  UNKNOWN = "UNKNOWN",
}

export enum ProductType {
  INSTALLMENT_LOAN = "INSTALLMENT_LOAN",
  LINE_OF_CREDIT = "LINE_OF_CREDIT",
  SHORT_TERM_CREDIT = "SHORT_TERM_CREDIT",
  BNPL = "BNPL",
  MORTGAGE = "MORTGAGE",
  AUTO_LOAN = "AUTO_LOAN",
  AUTO_REFINANCE = "AUTO_REFINANCE",
  STUDENT_LOAN = "STUDENT_LOAN",
  STUDENT_LOAN_REFINANCE = "STUDENT_LOAN_REFINANCE",
  BUSINESS_LOAN = "BUSINESS_LOAN",
  BUSINESS_BANKING = "BUSINESS_BANKING",
  BUSINESS_CREDIT_CARD = "BUSINESS_CREDIT_CARD",
  PERSONAL_BANKING = "PERSONAL_BANKING",
  SAVINGS_ACCOUNT = "SAVINGS_ACCOUNT",
  PERSONAL_CREDIT_CARD = "PERSONAL_CREDIT_CARD",
}

// Lender Directory Related Types
export interface Lender {
  lender_id: string;
  canonical_name: string;
  entity_type: string;
  product_types: string[];
  credit_tier_target: string[];
  amount_min?: number;
  amount_max?: number;
  states_served?: string[];
  funding_speed?: string;
  brand_status: string;
  exclusion_reason?: string;
  source: string;
  updated_at: string;
  gsi1pks: string[];
  lanes?: string[];
  primary_lane?: string;
  lane_pk?: string;
}

export interface LenderSearchCriteria {
  creditScore?: number;
  creditTier?: CreditTier;
  loanAmount: number;
  state?: string;
  productType: ProductType;
  includeReviewStatus?: boolean; // Include lenders with REVIEW status
}

// Loan Offer Related Types

const moneySchema = z.object({
  amount: z.number(),
  currency: z.literal("USD"),
});

export type Money = z.infer<typeof moneySchema>;
export type Percentage = number; // 0-100
export type BasisPoints = number;
export type DateString = string; // ISO 8601

export enum ApplicationType {
  PERSONAL = "PERSONAL",
  BUSINESS = "BUSINESS",
}

export enum ApplicationStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  IN_REVIEW = "IN_REVIEW",
  ACTION_REQUIRED = "ACTION_REQUIRED",
  APPROVED = "APPROVED",
  DECLINED = "DECLINED",
  CLOSED = "CLOSED",
}

export enum ProviderStatus {
  PENDING = "PENDING", // Not yet sent
  SUBMITTED = "SUBMITTED", // Sent to provider
  REFERRED = "REFERRED", // Sent via affiliate link
  ERROR = "ERROR", // Failed to send
  RECEIVED = "RECEIVED", // Provider acknowledged
}

export const personalApplicantSchema = z.object({
  firstName: z.string().describe("The applicant's first name."),
  lastName: z.string().describe("The applicant's last name."),
  email: z.string().email().describe("The applicant's email address."),
  phone: z.string().optional().describe("The applicant's phone number."),
});

export const loanOfferSchema = z.object({
  offerId: z.string().describe("A unique identifier for this specific loan offer."),
  lender: z.object({
    id: z.string().describe("The unique identifier for the lender."),
    name: z.string().describe("The display name of the lender."),
    type: z.string().describe("The type of lending institution (e.g., 'Bank', 'Credit Union')."),
  }).describe("Details about the lender providing the offer."),
  product: z.object({
    name: z.string().describe("The name of the financial product being offered."),
    type: z.nativeEnum(ProductType).describe("The category of the financial product."),
    description: z.string().optional().describe("A brief description of the product."),
  }).describe("Details about the financial product."),
  terms: z.object({
    amount: moneySchema.describe("The principal loan amount."),
    interestRate: z.object({
      type: z.enum(["fixed", "variable"]).describe("The type of interest rate."),
      rate: z.number().describe("The nominal interest rate."),
      apr: z.number().describe("The Annual Percentage Rate, including fees."),
    }).describe("Details about the interest rate."),
    termMonths: z.number().describe("The duration of the loan in months."),
    payment: z
      .object({
        frequency: z.literal("monthly").describe("The frequency of payments."),
        amount: moneySchema.describe("The amount of each payment."),
      })
      .optional().describe("Details about the repayment schedule."),
    totalCost: moneySchema.optional().describe("The total cost of the loan, including interest and fees."),
    prepaymentPenalty: z.boolean().optional().describe("Indicates if there is a penalty for early repayment."),
    repayment: z
      .object({
        totalRepaymentAmount: z.number().describe("The total amount to be repaid over the life of the loan."),
        costOfFinancing: z.number().describe("The total cost of borrowing (interest and fees)."),
      })
      .optional().describe("Summary of repayment details."),
  }).describe("The terms and conditions of the loan offer."),
  fees: z
    .object({
      origination: z
        .object({
          amount: moneySchema.describe("The origination fee amount."),
          percentage: z.number().optional().describe("The origination fee as a percentage of the loan amount."),
        })
        .optional().describe("Fee charged by the lender for processing the loan."),
    })
    .optional().describe("Any fees associated with the loan."),
  matching: z
    .object({
      matchScore: z.number().optional().describe("A score indicating how well the offer matches the search criteria."),
      matchReasons: z.array(z.string()).optional().describe("Reasons for the match score."),
    })
    .optional().describe("Information about how the offer was matched."),
  process: z.object({
    applicationMethod: z.enum(["online", "phone", "in_person"]).describe("How to apply for the loan."),
    applicationUrl: z.string().url().optional().describe("The URL to the online application form."),
    fundingSpeed: z.object({ description: z.string().describe("Estimated time to receive funds.") }).optional().describe("Information on how quickly the loan is funded."),
  }).describe("Details about the application and funding process."),
  isSecureLendTenant: z.boolean().describe("Indicates if the offer is from a SecureLend-managed tenant."),
});

export type LoanOffer = z.infer<typeof loanOfferSchema>;

// Adapter Interface
export interface PersonalLenderAdapter {
  readonly name: string;
  search(params: PersonalLoanSearchParams): Promise<LoanOffer[]>;
}

export interface BusinessLenderAdapter {
  readonly name: string;
  search(params: BusinessLoanSearchParams): Promise<LoanOffer[]>;
}

export interface MortgageLenderAdapter {
  readonly name: string;
  search(params: MortgageSearchParams): Promise<LoanOffer[]>;
}

export interface AutoLenderAdapter {
  readonly name: string;
  search(params: AutoLoanSearchParams): Promise<LoanOffer[]>;
}

export interface StudentLenderAdapter {
  readonly name: string;
  search(params: StudentLoanSearchParams): Promise<LoanOffer[]>;
}

export interface BusinessCreditCardAdapter {
  readonly name: string;
  search(
    params: BusinessCreditCardSearchParams
  ): Promise<BusinessCreditCardOffer[]>;
}

export interface BusinessBankingAdapter {
  readonly name: string;
  search(
    params: BusinessBankingSearchSchema & {
      maxResults?: number;
      includeReviewStatus?: boolean;
    }
  ): Promise<BusinessBankingOffer[]>;
}

export interface PersonalBankingAdapter {
  readonly name: string;
  search(
    params: PersonalBankingSearchSchema
  ): Promise<PersonalBankingOffer[]>;
}

export interface SavingsAdapter {
  readonly name: string;
  search(params: SavingsSearchSchema): Promise<SavingsOffer[]>;
}

export interface PersonalCreditCardAdapter {
  readonly name: string;
  search(
    params: PersonalCreditCardSearchSchema
  ): Promise<PersonalCreditCardOffer[]>;
}

// Zod Schemas for Tool Input/Output
export const personalLoanSearchSchema = z.object({
  loanAmount: z
    .number()
    .min(1000)
    .max(100000)
    .describe("The desired loan amount in USD (e.g., 25000)."),
  purpose: z
    .enum([
      "debt_consolidation",
      "home_improvement",
      "major_purchase",
      "medical",
      "vacation",
      "other",
    ])
    .describe("The purpose of the loan."),
  creditScore: z
    .number()
    .min(300)
    .max(850)
    .optional()
    .describe("The applicant's estimated credit score (300-850)."),
  monthlyIncome: z
    .number()
    .min(0)
    .optional()
    .describe("Applicant's gross monthly income in USD."),
  employmentStatus: z
    .enum(["employed", "self_employed", "retired", "unemployed"])
    .optional()
    .describe("The applicant's employment status."),
  state: z
    .string()
    .optional()
    .describe("The applicant's state of residence (2-letter code)."),
});
export type PersonalLoanSearchParams = z.infer<typeof personalLoanSearchSchema>;

// Generic schema for business loan data
export const businessLoanSearchSchema = z.object({
  loanAmount: z
    .number()
    .min(1000)
    .describe("The desired loan amount, e.g., 50000 for $50,000."),
  purpose: z.string().describe("The reason for the loan, e.g., 'working capital'."),
  annualRevenue: z
    .number()
    .min(0)
    .optional()
    .describe("The business's gross annual revenue in USD."),
  industry: z
    .string()
    .optional()
    .describe("The industry the business operates in, e.g., 'technology'."),
  state: z
    .string()
    .optional()
    .describe("The state where the business is located (2-letter code)."),
});
export type BusinessLoanSearchParams = z.infer<typeof businessLoanSearchSchema>;

export const mortgageSearchSchema = z.object({
  loanAmount: z.number().min(50000).max(2000000).describe("The desired mortgage loan amount in USD."),
  homePrice: z.number().min(50000).max(5000000).optional().describe("The purchase price of the home in USD."),
  downPayment: z.number().min(0).optional().describe("The amount of the down payment in USD."),
  creditScore: z.number().min(500).max(850).optional().describe("The applicant's estimated credit score (500-850)."),
  loanType: z.enum(["conventional", "fha", "va", "jumbo", "refinance"]).describe("The type of mortgage loan."),
  propertyType: z.enum(["primary", "secondary", "investment"]).optional().describe("The intended use of the property."),
  state: z.string().optional().describe("The state where the property is located (2-letter code)."),
});
export type MortgageSearchParams = z.infer<typeof mortgageSearchSchema>;

export const autoLoanSearchSchema = z.object({
  loanAmount: z.number().min(1000).max(100000).describe("The desired auto loan amount in USD."),
  creditScore: z.number().min(300).max(850).optional().describe("The applicant's estimated credit score (300-850)."),
  isNew: z.boolean().describe("Specifies if the vehicle is new (true) or used (false)."),
  state: z
    .string()
    .optional()
    .describe("The applicant's state of residence (2-letter code)."),
});
export type AutoLoanSearchParams = z.infer<typeof autoLoanSearchSchema>;

export const studentLoanSearchSchema = z.object({
  loanAmount: z.number().min(1000).max(250000).describe("The total amount needed for the student loan in USD."),
  creditScore: z.number().min(300).max(850).optional().describe("The student's estimated credit score (300-850)."),
  coSignerCreditScore: z.number().min(300).max(850).optional().describe("The co-signer's estimated credit score (300-850), if applicable."),
  degreeType: z.enum(["undergraduate", "graduate", "mba", "medical", "law"]).describe("The type of degree the loan is for."),
  state: z.string().optional().describe("The student's state of residence (2-letter code)."),
});
export type StudentLoanSearchParams = z.infer<typeof studentLoanSearchSchema>;

// Schemas for Business Credit Card Comparison
export const businessCreditCardSearchSchema = z.object({
  creditScore: z
    .number()
    .min(300)
    .max(850)
    .optional()
    .describe("The applicant's estimated credit score (300-850)."),
  annualRevenue: z
    .number()
    .min(0)
    .optional()
    .describe("The business's annual revenue in USD."),
  businessAgeInYears: z
    .number()
    .min(0)
    .optional()
    .describe("The age of the business in years."),
});
export type BusinessCreditCardSearchParams = z.infer<
  typeof businessCreditCardSearchSchema
>;

export const businessCreditCardOfferSchema = z.object({
  cardId: z.string(),
  name: z.string(),
  issuer: z.string(),
  imageUrl: z.string(),
  rating: z.number().min(0).max(5),
  creditScoreRange: z.string(),
  welcomeBonus: z.string(),
  terms: z.object({
    apr: z.number(),
    annualFee: z.number(),
    creditLimit: moneySchema,
  }),
});
export type BusinessCreditCardOffer = z.infer<
  typeof businessCreditCardOfferSchema
>;

export const businessCreditCardComparisonResponseSchema = z.object({
  offers: z.array(businessCreditCardOfferSchema),
  searchCriteria: businessCreditCardSearchSchema.optional(),
  metadata: z.object({
    queryId: z.string(),
    timestamp: z.string(),
    sessionId: z.string().optional(),
  }),
  widget: z.string().optional(),
});
export type BusinessCreditCardComparisonResponse = z.infer<typeof businessCreditCardComparisonResponseSchema>;


// Schemas for Business Banking Comparison
export const businessBankingSearchSchema = z.object({
  industry: z.string().optional().describe("The business's industry."),
  monthlyTransactions: z
    .number()
    .optional()
    .describe("Estimated number of monthly transactions."),
});
export type BusinessBankingSearchSchema = z.infer<
  typeof businessBankingSearchSchema
>;

export const businessBankingOfferSchema = z.object({
  accountId: z.string(),
  name: z.string(),
  issuer: z.string(),
  imageUrl: z.string(),
  rating: z.number().min(0).max(5),
  bestFor: z.string(),
  apy: z.string(),
  interestRate: z.string().optional(),
  monthlyFee: z.string(),
  bonus: z.string(),
});
export type BusinessBankingOffer = z.infer<typeof businessBankingOfferSchema>;

export const businessBankingComparisonResponseSchema = z.object({
  offers: z.array(businessBankingOfferSchema),
  searchCriteria: businessBankingSearchSchema.optional(),
  metadata: z.object({
    queryId: z.string(),
    timestamp: z.string(),
    sessionId: z.string().optional(),
  }),
  widget: z.string().optional(),
});
export type BusinessBankingComparisonResponse = z.infer<typeof businessBankingComparisonResponseSchema>;

// Schemas for Personal Banking Comparison
export const personalBankingSearchSchema = z.object({
  features: z.array(z.string()).optional().describe("Desired account features."),
});
export type PersonalBankingSearchSchema = z.infer<
  typeof personalBankingSearchSchema
>;

export const personalBankingOfferSchema = z.object({
  accountId: z.string(),
  name: z.string(),
  issuer: z.string(),
  imageUrl: z.string(),
  rating: z.number().min(0).max(5),
  bestFor: z.string(),
  apy: z.string(),
  interestRate: z.string().optional(),
  bonus: z.string(),
  monthlyFee: z.string(),
  overdraftRating: z.number().min(0).max(5),
});
export type PersonalBankingOffer = z.infer<typeof personalBankingOfferSchema>;

export const personalBankingComparisonResponseSchema = z.object({
  offers: z.array(personalBankingOfferSchema),
  searchCriteria: personalBankingSearchSchema.optional(),
  metadata: z.object({
    queryId: z.string(),
    timestamp: z.string(),
    sessionId: z.string().optional(),
  }),
  widget: z.string().optional(),
});
export type PersonalBankingComparisonResponse = z.infer<typeof personalBankingComparisonResponseSchema>;

// Schemas for Savings Account Comparison
export const savingsSearchSchema = z.object({
  initialDeposit: z.number().optional().describe("The initial deposit amount in USD."),
});
export type SavingsSearchSchema = z.infer<typeof savingsSearchSchema>;

export const savingsOfferSchema = z.object({
  accountId: z.string(),
  name: z.string(),
  issuer: z.string(),
  imageUrl: z.string(),
  rating: z.number().min(0).max(5),
  apy: z.string(),
  interestRate: z.string().optional(),
  minBalanceForApy: z.string(),
  monthlyFee: z.string(),
});
export type SavingsOffer = z.infer<typeof savingsOfferSchema>;

export const savingsComparisonResponseSchema = z.object({
  offers: z.array(savingsOfferSchema),
  searchCriteria: savingsSearchSchema.optional(),
  metadata: z.object({
    queryId: z.string(),
    timestamp: z.string(),
    sessionId: z.string().optional(),
  }),
  widget: z.string().optional(),
});
export type SavingsAccountComparisonResponse = z.infer<typeof savingsComparisonResponseSchema>;

// Schemas for Personal Credit Card Comparison
export const personalCreditCardSearchSchema = z.object({
  creditScore: z.number().min(300).max(850).optional().describe("The applicant's estimated credit score (300-850)."),
  rewardsType: z.enum(["cash_back", "travel", "points"]).optional().describe("Preferred rewards type."),
});
export type PersonalCreditCardSearchSchema = z.infer<typeof personalCreditCardSearchSchema>;

export const personalCreditCardOfferSchema = z.object({
  cardId: z.string(),
  name: z.string(),
  issuer: z.string(),
  imageUrl: z.string(),
  rating: z.number().min(0).max(5),
  bestFor: z.string(),
  rewardsRate: z.string(),
  introOffer: z.string(),
  recommendedCreditScore: z.string(),
  terms: z.object({
    apr: z.object({
      purchase: z.number(),
      balanceTransfer: z.number(),
      penalty: z.number().optional(),
    }),
    fees: z.object({
      annual: z.number(),
    }),
  }),
});
export type PersonalCreditCardOffer = z.infer<
  typeof personalCreditCardOfferSchema
>;

export const personalCreditCardComparisonResponseSchema = z.object({
  offers: z.array(personalCreditCardOfferSchema),
  searchCriteria: personalCreditCardSearchSchema.optional(),
  metadata: z.object({
    queryId: z.string(),
    timestamp: z.string(),
    sessionId: z.string().optional(),
  }),
  widget: z.string().optional(),
});
export type PersonalCreditCardComparisonResponse = z.infer<typeof personalCreditCardComparisonResponseSchema>;


export const loanComparisonResponseSchema = z.object({
  offers: z.array(loanOfferSchema),
  summary: z.object({
    totalOffers: z.number(),
    bestRate: z.number(),
    fastestFunding: z.string(),
  }),
  searchCriteria: z
    .union([
      personalLoanSearchSchema,
      businessLoanSearchSchema,
      mortgageSearchSchema,
      autoLoanSearchSchema,
      studentLoanSearchSchema,
    ])
    .optional(),
  metadata: z.object({
    queryId: z.string(),
    timestamp: z.string(),
    sessionId: z.string().optional(),
  }),
  widget: z.string().optional(),
});
export type LoanComparisonResponse = z.infer<typeof loanComparisonResponseSchema>;

export const applicationProviderSchema = z.object({
  providerId: z.string(),
  providerName: z.string(),
  status: z.nativeEnum(ProviderStatus),
  submittedAt: z.string().optional(),
  providerApplicationId: z.string().optional(),
  referralUrl: z.string().url().optional(),
  error: z.string().optional(),
});

export const personalApplicationSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  applicationType: z.nativeEnum(ApplicationType),
  productType: z.union([z.nativeEnum(ProductType), z.string()]),
  status: z.nativeEnum(ApplicationStatus),
  applicant: personalApplicantSchema,
  applicationData: anyObjectSchema,
  providers: z.array(applicationProviderSchema),
  email: z.string().email(),
  widget: z.string().optional(),
});

// Application & Lead Types

export interface ApplicationProvider {
  providerId: string;
  providerName: string;
  status: ProviderStatus;
  submittedAt?: string;
  providerApplicationId?: string;
  referralUrl?: string;
  error?: string;
}

export interface PersonalApplicant {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface BusinessApplicant {
  businessName: string;
  ein?: string;
  contact: PersonalApplicant;
}

export interface Application<TApplicant, TData> {
  id: string; // PK
  createdAt: string;
  updatedAt: string;
  applicationType: ApplicationType;
  productType: ProductType | string;
  status: ApplicationStatus;
  applicant: TApplicant;
  applicationData: TData;
  providers: ApplicationProvider[];
  email: string; // For GSI
}

export type PersonalApplication = Application<
  PersonalApplicant,
  any
>;
export type BusinessApplication = Application<BusinessApplicant, any>;
export type GenericApplication = Application<
  PersonalApplicant | BusinessApplicant,
  any
>;

// Zod schemas for validation

export const createPersonalApplicationSchema = z.object({
  productType: z.nativeEnum(ProductType),
  applicant: personalApplicantSchema,
  applicationData: anyObjectSchema,
  providers: z
    .array(z.object({ providerId: z.string(), providerName: z.string() }))
    .optional(),
});
export type CreatePersonalApplicationDTO = z.infer<
  typeof createPersonalApplicationSchema
>;

export const displayOfferFormSchema = z.object({
  sessionId: z.string().optional().describe("The session ID from a previous search to retrieve all offers."),
  offerId: z.string().optional().describe("The specific offer ID to pre-select in the form."),
});
export type DisplayOfferFormParams = z.infer<typeof displayOfferFormSchema>;

export const displayOfferFormResponseSchema = z.object({
  offer: z.any(),
  allOffers: z.array(z.any()),
  applicationData: anyObjectSchema,
  productType: z.string(),
  widget: z.string().optional(),
});
export type DisplayOfferFormResponse = z.infer<typeof displayOfferFormResponseSchema>;

export const getOfferSchema = z.object({
  productType: z.nativeEnum(ProductType).describe("The type of financial product being applied for."),
  applicant: personalApplicantSchema.describe("Personal details of the applicant."),
  applicationData: anyObjectSchema.describe("The original search parameters or form data for the application."),
  provider: z
    .object({
      providerId: z.string().describe("The ID of the selected provider."),
      providerName: z.string().describe("The name of the selected provider."),
    })
    .describe("The selected provider to submit the application to."),
});
export type GetOfferParams = z.infer<typeof getOfferSchema>;

export const getMultipleOffersSchema = z.object({
  productType: z.nativeEnum(ProductType).describe("The type of financial product being applied for."),
  applicant: personalApplicantSchema.describe("Personal details of the applicant."),
  applicationData: anyObjectSchema.describe("The original search parameters or form data for the application."),
  providers: z
    .array(
      z.object({
        providerId: z.string().describe("The ID of the selected provider."),
        providerName: z.string().describe("The name of the selected provider."),
      })
    )
    .min(1)
    .describe("The list of selected providers to submit the application to."),
});
export type GetMultipleOffersParams = z.infer<typeof getMultipleOffersSchema>;

export const trackOfferStatusSchema = z
  .object({
    applicationId: z
      .string()
      .optional()
      .describe("The unique ID of the application to track."),
    email: z
      .string()
      .email()
      .optional()
      .describe("The email address of the applicant to find applications for."),
  })
  .refine((data) => data.applicationId || data.email, {
    message: "Either applicationId or email must be provided.",
  });
export type TrackOfferStatusParams = z.infer<typeof trackOfferStatusSchema>;

export const trackOfferStatusResponseSchema = z.object({
  applications: z.array(personalApplicationSchema),
  widget: z.string().optional(),
});
export type TrackOfferStatusResponse = z.infer<typeof trackOfferStatusResponseSchema>;

export const businessApplicantSchema = z.object({
  businessName: z.string(),
  ein: z.string().optional(),
  contact: personalApplicantSchema,
});

export const createBusinessApplicationSchema = z.object({
  productType: z.nativeEnum(ProductType),
  applicant: businessApplicantSchema,
  applicationData: anyObjectSchema,
  providers: z
    .array(z.object({ providerId: z.string(), providerName: z.string() }))
    .optional(),
});
export type CreateBusinessApplicationDTO = z.infer<
  typeof createBusinessApplicationSchema
>;

export const documentTypeEnum = z.enum([
  "articles-of-incorporation",
  "balance-sheet",
  "bank-statement",
  "business-license",
  "business-plan",
  "contract",
  "drivers-license",
  "financial-statement",
  "identity-document",
  "invoice",
  "lease-agreement",
  "other-business-document",
  "other-personal-document",
  "passport",
  "profit-and-loss-statement",
  "proof-of-address",
  "proof-of-income",
  "property-document",
  "purchase-order",
  "tax-return",
  "utility-bill",
  "vehicle-document",
  "voided-check",
]);
export type DocumentType = z.infer<typeof documentTypeEnum>;

export const displayUploadDocumentsFormSchema = z.object({
  applicationId: z
    .string()
    .optional()
    .describe("Pre-fill the application ID for the document upload form."),
});
export type DisplayUploadDocumentsFormParams = z.infer<
  typeof displayUploadDocumentsFormSchema
>;

export const submitDocumentsSchema = z.object({
  applicationId: z
    .string()
    .describe("The ID of the application to associate the document with."),
  fileName: z.string().describe("The original name of the file."),
  documentType: documentTypeEnum.describe("The category of the document."),
  _openai_meta: z
    .object({})
    .passthrough()
    .optional()
    .describe("Internal metadata from OpenAI (automatically injected)"),
});
export type SubmitDocumentsParams = z.infer<typeof submitDocumentsSchema>;

export const submitDocumentsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  uploadUrl: z.string().url().optional(),
  uploadFields: z.record(z.string(), z.string()).optional(),
  documentId: z.string().optional(),
  widget: z.string().optional(),
});
export type SubmitDocumentsResponse = z.infer<typeof submitDocumentsResponseSchema>;

export const displayUploadDocumentsFormResponseSchema = z.object({
    widget: z.string().optional(),
});
export type DisplayUploadDocumentsFormResponse = z.infer<typeof displayUploadDocumentsFormResponseSchema>;

// Schemas for Calculator Tools
export const loanPaymentSchema = z.object({
  loanAmount: z
    .number()
    .describe("The total amount of the loan in USD.")
    .positive("Loan amount must be positive."),
  interestRate: z
    .number()
    .describe("The annual interest rate (e.g., 5 for 5%).")
    .min(0, "Interest rate cannot be negative."),
  loanTermInMonths: z
    .number()
    .describe("The duration of the loan in months.")
    .positive("Loan term must be positive.")
    .int(),
});
export type LoanPaymentParams = z.infer<typeof loanPaymentSchema>;

export const loanPaymentResponseSchema = z.object({
  monthlyPayment: z.number().describe("The calculated monthly payment amount."),
  totalPayment: z.number().describe("The total amount to be paid over the life of the loan."),
  totalInterest: z.number().describe("The total interest paid over the life of the loan."),
  widget: z.string().optional(),
});
export type LoanCalculationResponse = z.infer<typeof loanPaymentResponseSchema>;

export const mortgagePaymentSchema = z.object({
  propertyValue: z
    .number()
    .describe("The total value of the property in USD.")
    .positive("Property value must be positive."),
  downPayment: z
    .number()
    .describe("The amount paid upfront in USD.")
    .min(0, "Down payment cannot be negative."),
  interestRate: z
    .number()
    .describe("The annual interest rate (e.g., 3.5 for 3.5%).")
    .min(0, "Interest rate cannot be negative."),
  loanTermInYears: z
    .number()
    .describe("The duration of the loan in years.")
    .positive("Loan term must be positive.")
    .int(),
  propertyTaxRate: z
    .number()
    .describe(
      "The annual property tax rate as a percentage (e.g., 1.2 for 1.2%)."
    )
    .min(0, "Property tax rate cannot be negative."),
  homeInsurance: z
    .number()
    .describe("The annual home insurance cost in USD.")
    .min(0, "Home insurance cannot be negative."),
});
export type MortgagePaymentParams = z.infer<typeof mortgagePaymentSchema>;

export const mortgagePaymentResponseSchema = z.object({
  loanAmount: z.number().describe("The total loan amount after down payment."),
  principalAndInterest: z.number().describe("The monthly payment for principal and interest."),
  monthlyPropertyTax: z.number().describe("The estimated monthly property tax payment."),
  monthlyHomeInsurance: z.number().describe("The estimated monthly home insurance payment."),
  totalMonthlyPayment: z.number().describe("The total estimated monthly payment (PITI)."),
  widget: z.string().optional(),
});
export type MortgageCalculationResponse = z.infer<typeof mortgagePaymentResponseSchema>;

// Schemas for Lease vs. Purchase Calculator
export const leaseVsPurchaseSchema = z.object({
  // Purchase details
  purchasePrice: z
    .number()
    .positive("Purchase price must be positive.")
    .describe("Total price of the vehicle for purchase in USD."),
  downPayment: z
    .number()
    .min(0, "Down payment cannot be negative.")
    .describe("Upfront payment amount for purchase in USD."),
  loanTermInMonths: z
    .number()
    .positive()
    .int()
    .describe("Loan duration in months for purchase."),
  interestRate: z
    .number()
    .min(0, "Interest rate cannot be negative.")
    .describe("Annual interest rate for purchase loan (e.g., 5 for 5%)."),
  salesTaxRate: z
    .number()
    .min(0, "Sales tax rate cannot be negative.")
    .describe("Sales tax rate as a percentage (e.g., 7.5 for 7.5%)."),

  // Lease details
  leaseTermInMonths: z
    .number()
    .positive()
    .int()
    .describe("Lease duration in months."),
  monthlyLeasePayment: z.number().positive().describe("Monthly payment for the lease in USD."),
  moneyFactor: z
    .number()
    .positive("Money factor must be positive.")
    .describe("The money factor for the lease (similar to interest rate)."),
  acquisitionFee: z
    .number()
    .min(0)
    .default(0)
    .describe("Fee charged by the lessor to initiate the lease in USD."),
  securityDeposit: z
    .number()
    .min(0)
    .default(0)
    .describe("Refundable deposit paid at the start of the lease in USD."),

  // Common details
  residualValuePercentage: z
    .number()
    .min(0)
    .max(100, "Residual value percentage cannot exceed 100.")
    .describe("Estimated value of the vehicle at the end of the lease, as a percentage of MSRP."),
  expectedOwnershipInMonths: z
    .number()
    .positive()
    .int()
    .describe("How long you plan to keep the vehicle, in months."),
});
export type LeaseVsPurchaseParams = z.infer<typeof leaseVsPurchaseSchema>;

export const leaseVsPurchaseResponseSchema = z.object({
  purchaseAnalysis: z.object({
    totalLoanPayment: z.number(),
    totalInterestPaid: z.number(),
    totalSalesTax: z.number(),
    equityAfterOwnership: z.number(),
    totalCostOfOwnership: z.number(),
    monthlyPayment: z.number(),
  }),
  leaseAnalysis: z.object({
    totalLeasePayments: z.number(),
    totalUpfrontCosts: z.number(),
    totalCostOfLeasing: z.number(),
  }),
  comparison: z.object({
    purchaseCostIsLowerBy: z.number(),
    leaseCostIsLowerBy: z.number(),
    recommendation: z.string(),
  }),
  widget: z.string().optional(),
});
export type LeaseVsPurchaseResponse = z.infer<typeof leaseVsPurchaseResponseSchema>;

// ============================================================================
// SDK Config
// ============================================================================

export interface SecureLendConfig {
  /** MCP Server URL (default: https://mcp.securelend.ai/mcp) */
  serverUrl?: string;
}
