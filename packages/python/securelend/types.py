from __future__ import annotations
from typing import List, Literal, Optional, TypedDict

# ============================================================================
# Common Types
# ============================================================================

class Money(TypedDict, total=False):
    amount: float
    currency: str  # ISO 4217 (default: 'USD')

Percentage = float  # 0-100
BasisPoints = int
DateString = str  # ISO 8601

class CreditScore(TypedDict, total=False):
    score: int  # 300-850
    bureau: Literal["Experian", "Equifax", "TransUnion", "VantageScore"]
    date: DateString

class Geography(TypedDict, total=False):
    country: str  # ISO 3166-1 alpha-2
    state: str
    city: str
    postalCode: str

# ============================================================================
# Tool Result Types (Internal)
# ============================================================================

class Resource(TypedDict, total=False):
    mimeType: str
    text: str

class ContentItem(TypedDict, total=False):
    type: str
    resource: Resource
    text: str

class ToolResult(TypedDict, total=False):
    content: List[ContentItem]
    requestId: str

# ============================================================================
# Business Profile
# ============================================================================

class BusinessProfileBasic(TypedDict, total=False):
    legalName: str
    dba: str
    ein: str
    entityType: Literal["sole_proprietorship", "partnership", "llc", "s_corp", "c_corp", "non_profit"]
    incorporationDate: DateString
    industry: dict

class BusinessProfileLocation(TypedDict, total=False):
    headquarters: Geography
    operatingStates: List[str]
    numLocations: int

class BusinessProfileFinancials(TypedDict, total=False):
    revenue: dict
    existingDebt: dict

class BusinessProfileCredit(TypedDict, total=False):
    ownerCreditScore: CreditScore
    bankruptcyHistory: bool

class BusinessProfile(TypedDict, total=False):
    basic: BusinessProfileBasic
    location: BusinessProfileLocation
    financials: BusinessProfileFinancials
    credit: BusinessProfileCredit

# ============================================================================
# Loan Types
# ============================================================================

LoanPurpose = Literal[
    "working_capital", "equipment_purchase", "real_estate", "business_acquisition",
    "inventory", "expansion", "debt_consolidation", "payroll", "other"
]

class LoanComparisonRequestBusiness(TypedDict, total=False):
    revenue: float
    creditScore: int
    timeInBusiness: int
    industry: str
    entityType: str
    location: dict

class LoanComparisonRequest(TypedDict, total=False):
    amount: float
    purpose: LoanPurpose
    business: LoanComparisonRequestBusiness
    termPreferenceMonths: int
    collateralAvailable: bool
    maxResults: int

class LoanOffer(TypedDict, total=False):
    offerId: str
    lender: dict
    product: dict
    terms: dict
    fees: dict
    matching: dict
    process: dict

class LoanComparisonResponse(TypedDict, total=False):
    offers: List[LoanOffer]
    summary: dict
    metadata: dict
    widget: str

# ============================================================================
# Banking Types
# ============================================================================

class BankingComparisonRequest(TypedDict, total=False):
    accountType: Literal["checking", "savings", "both"]
    monthlyRevenue: float
    monthlyTransactions: int
    averageBalance: float
    featuresNeeded: List[str]
    accountingSoftware: Literal["quickbooks", "xero", "freshbooks", "none"]
    maxResults: int

class BankingAccount(TypedDict, total=False):
    accountId: str
    bank: dict
    account: dict
    ratesAndFees: dict
    features: dict
    matching: dict

class BankingComparisonResponse(TypedDict, total=False):
    accounts: List[BankingAccount]
    summary: dict
    widget: str

# ============================================================================
# Credit Card Types
# ============================================================================

class CreditCardComparisonRequest(TypedDict, total=False):
    creditScore: int
    monthlySpend: float
    spendCategories: List[dict]
    preferences: dict
    business: BusinessProfile
    maxResults: int

class CreditCardOffer(TypedDict, total=False):
    cardId: str
    cardName: str
    issuer: str
    rewards: dict
    fees: dict
    apr: dict
    estimatedAnnualRewards: Money
    approvalProbability: float
    applyUrl: str

class CreditCardComparisonResponse(TypedDict, total=False):
    cards: List[CreditCardOffer]
    widget: str

# ============================================================================
# Calculation Types
# ============================================================================

class LoanCalculation(TypedDict, total=False):
    amount: float
    rate: float
    termMonths: int
    fees: dict

class LoanCalculationResult(TypedDict, total=False):
    monthlyPayment: float
    totalInterest: float
    totalCost: float
    apr: float
    amortizationSchedule: List[dict]
