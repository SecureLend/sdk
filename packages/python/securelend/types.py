from __future__ import annotations
from typing import List, Literal, Optional, TypedDict, Union, Dict, Any

# ============================================================================
# Common & Base Types
# ============================================================================

class Money(TypedDict, total=False):
    amount: float
    currency: str

class Resource(TypedDict, total=False):
    mimeType: str
    text: str

class ContentItem(TypedDict, total=False):
    type: str
    resource: Resource
    text: str

class ToolResult(TypedDict, total=False):
    content: List[ContentItem]
    structuredContent: Any
    requestId: str

class SecureLendConfig(TypedDict, total=False):
    apiKey: str
    serverUrl: str

# ============================================================================
# Loan Comparison
# ============================================================================

class PersonalLoanSearchParams(TypedDict, total=False):
    loanAmount: float
    purpose: Literal["debt_consolidation", "home_improvement", "major_purchase", "medical", "vacation", "other"]
    creditScore: int
    monthlyIncome: float
    employmentStatus: Literal["employed", "self_employed", "retired", "unemployed"]
    state: str

class BusinessLoanSearchParams(TypedDict, total=False):
    loanAmount: float
    purpose: str
    annualRevenue: float
    industry: str
    state: str

class MortgageSearchParams(TypedDict, total=False):
    loanAmount: float
    homePrice: float
    downPayment: float
    creditScore: int
    loanType: Literal["conventional", "fha", "va", "jumbo", "refinance"]
    propertyType: Literal["primary", "secondary", "investment"]
    state: str

class AutoLoanSearchParams(TypedDict, total=False):
    loanAmount: float
    creditScore: int
    isNew: bool
    state: str

class StudentLoanSearchParams(TypedDict, total=False):
    loanAmount: float
    creditScore: int
    coSignerCreditScore: int
    degreeType: Literal["undergraduate", "graduate", "mba", "medical", "law"]
    state: str

class LoanOffer(TypedDict, total=False):
    offerId: str
    lender: Dict[str, Any]
    product: Dict[str, Any]
    terms: Dict[str, Any]
    fees: Optional[Dict[str, Any]]
    matching: Optional[Dict[str, Any]]
    process: Optional[Dict[str, Any]]

class LoanComparisonResponse(TypedDict, total=False):
    offers: List[LoanOffer]
    summary: Dict[str, Any]
    searchCriteria: Optional[Dict[str, Any]]
    metadata: Dict[str, Any]
    widget: Optional[str]

# ============================================================================
# Banking & Credit Cards
# ============================================================================

class BusinessBankingSearchSchema(TypedDict, total=False):
    industry: str
    monthlyTransactions: int

class BusinessBankingOffer(TypedDict, total=False):
    accountId: str
    name: str
    issuer: str
    # ... and other fields

class BusinessBankingComparisonResponse(TypedDict, total=False):
    offers: List[BusinessBankingOffer]
    # ... and other fields
    widget: Optional[str]

class PersonalBankingSearchSchema(TypedDict, total=False):
    features: List[str]

class PersonalBankingOffer(TypedDict, total=False):
    accountId: str
    # ... and other fields

class PersonalBankingComparisonResponse(TypedDict, total=False):
    offers: List[PersonalBankingOffer]
    # ... and other fields
    widget: Optional[str]

class SavingsSearchSchema(TypedDict, total=False):
    initialDeposit: float

class SavingsOffer(TypedDict, total=False):
    accountId: str
    # ... and other fields

class SavingsAccountComparisonResponse(TypedDict, total=False):
    offers: List[SavingsOffer]
    # ... and other fields
    widget: Optional[str]

class BusinessCreditCardSearchParams(TypedDict, total=False):
    creditScore: int
    annualRevenue: float
    businessAgeInYears: float

class BusinessCreditCardOffer(TypedDict, total=False):
    cardId: str
    # ... and other fields

class BusinessCreditCardComparisonResponse(TypedDict, total=False):
    offers: List[BusinessCreditCardOffer]
    # ... and other fields
    widget: Optional[str]

class PersonalCreditCardSearchSchema(TypedDict, total=False):
    creditScore: int
    rewardsType: Literal["cash_back", "travel", "points"]

class PersonalCreditCardOffer(TypedDict, total=False):
    cardId: str
    # ... and other fields
    applicationUrl: Optional[str]

class PersonalCreditCardComparisonResponse(TypedDict, total=False):
    offers: List[PersonalCreditCardOffer]
    # ... and other fields
    widget: Optional[str]


# ============================================================================
# Financial Calculators
# ============================================================================

class LoanPaymentParams(TypedDict, total=False):
    loanAmount: float
    interestRate: float
    loanTermInMonths: int

class LoanCalculationResponse(TypedDict, total=False):
    monthlyPayment: float
    totalPayment: float
    totalInterest: float
    widget: Optional[str]

class MortgagePaymentParams(TypedDict, total=False):
    propertyValue: float
    downPayment: float
    interestRate: float
    loanTermInYears: int
    propertyTaxRate: float
    homeInsurance: float

class MortgageCalculationResponse(TypedDict, total=False):
    loanAmount: float
    principalAndInterest: float
    monthlyPropertyTax: float
    monthlyHomeInsurance: float
    totalMonthlyPayment: float
    widget: Optional[str]

class LeaseVsPurchaseParams(TypedDict, total=False):
    purchasePrice: float
    downPayment: float
    loanTermInMonths: int
    interestRate: float
    salesTaxRate: float
    leaseTermInMonths: int
    monthlyLeasePayment: float
    moneyFactor: float
    acquisitionFee: float
    securityDeposit: float
    residualValuePercentage: float
    expectedOwnershipInMonths: int

class LeaseVsPurchaseResponse(TypedDict, total=False):
    purchaseAnalysis: Dict[str, Any]
    leaseAnalysis: Dict[str, Any]
    comparison: Dict[str, Any]
    widget: Optional[str]

# ============================================================================
# Application Management
# ============================================================================

class PersonalApplicant(TypedDict, total=False):
    firstName: str
    lastName: str
    email: str
    phone: Optional[str]

class GetOfferParams(TypedDict, total=False):
    productType: str
    applicant: PersonalApplicant
    applicationData: Dict[str, Any]
    provider: Dict[str, Any]

class GetMultipleOffersParams(TypedDict, total=False):
    productType: str
    applicant: PersonalApplicant
    applicationData: Dict[str, Any]
    providers: List[Dict[str, Any]]

class PersonalApplication(TypedDict, total=False):
    id: str
    # ... and other fields
    widget: Optional[str]

class DisplayOfferFormParams(TypedDict, total=False):
    sessionId: Optional[str]
    offerId: Optional[str]

AnyOffer = Union[LoanOffer, BusinessCreditCardOffer, BusinessBankingOffer, PersonalBankingOffer, SavingsOffer, PersonalCreditCardOffer]

class DisplayOfferFormResponse(TypedDict, total=False):
    offer: AnyOffer
    allOffers: List[AnyOffer]
    applicationData: Dict[str, Any]
    productType: str
    widget: Optional[str]

class TrackOfferStatusParams(TypedDict, total=False):
    applicationId: Optional[str]
    email: Optional[str]

class TrackOfferStatusResponse(TypedDict, total=False):
    applications: List[PersonalApplication]
    widget: Optional[str]

class DisplayUploadDocumentsFormParams(TypedDict, total=False):
    applicationId: Optional[str]

class DisplayUploadDocumentsFormResponse(TypedDict, total=False):
    widget: Optional[str]

class SubmitDocumentsParams(TypedDict, total=False):
    applicationId: str
    fileName: str
    documentType: str

class SubmitDocumentsResponse(TypedDict, total=False):
    success: bool
    message: str
    uploadUrl: Optional[str]
    uploadFields: Optional[Dict[str, str]]
    documentId: Optional[str]
    widget: Optional[str]
