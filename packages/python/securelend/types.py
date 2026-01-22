from __future__ import annotations
from typing import List, Literal, Optional, Union, Dict, Any
from pydantic import BaseModel, Field

# ============================================================================
# Common & Base Types
# ============================================================================

class Money(BaseModel):
    amount: float
    currency: Optional[str] = None

class Resource(BaseModel):
    mime_type: Optional[str] = Field(None, alias="mimeType")
    text: Optional[str] = None

class ContentItem(BaseModel):
    type: Optional[str] = None
    resource: Optional[Resource] = None
    text: Optional[str] = None

class ToolResult(BaseModel):
    content: List[ContentItem] = []
    structured_content: Optional[Any] = Field(None, alias="structuredContent")
    request_id: Optional[str] = Field(None, alias="requestId")

class SecureLendConfig(BaseModel):
    api_key: Optional[str] = Field(None, alias="apiKey")
    server_url: Optional[str] = Field(None, alias="serverUrl")

# ============================================================================
# Loan Comparison
# ============================================================================

class PersonalLoanSearchParams(BaseModel):
    loan_amount: float = Field(..., alias="loanAmount")
    purpose: Literal["debt_consolidation", "home_improvement", "major_purchase", "medical", "vacation", "other"]
    credit_score: Optional[int] = Field(None, alias="creditScore")
    monthly_income: Optional[float] = Field(None, alias="monthlyIncome")
    employment_status: Optional[Literal["employed", "self_employed", "retired", "unemployed"]] = Field(None, alias="employmentStatus")
    state: Optional[str] = None

class BusinessLoanSearchParams(BaseModel):
    loan_amount: float = Field(..., alias="loanAmount")
    purpose: str
    annual_revenue: Optional[float] = Field(None, alias="annualRevenue")
    industry: Optional[str] = None
    state: Optional[str] = None

class MortgageSearchParams(BaseModel):
    loan_amount: float = Field(..., alias="loanAmount")
    home_price: Optional[float] = Field(None, alias="homePrice")
    down_payment: Optional[float] = Field(None, alias="downPayment")
    credit_score: Optional[int] = Field(None, alias="creditScore")
    loan_type: Literal["conventional", "fha", "va", "jumbo", "refinance"] = Field(..., alias="loanType")
    property_type: Optional[Literal["primary", "secondary", "investment"]] = Field(None, alias="propertyType")
    state: Optional[str] = None

class AutoLoanSearchParams(BaseModel):
    loan_amount: float = Field(..., alias="loanAmount")
    credit_score: Optional[int] = Field(None, alias="creditScore")
    is_new: bool = Field(..., alias="isNew")
    state: Optional[str] = None

class StudentLoanSearchParams(BaseModel):
    loan_amount: float = Field(..., alias="loanAmount")
    credit_score: Optional[int] = Field(None, alias="creditScore")
    co_signer_credit_score: Optional[int] = Field(None, alias="coSignerCreditScore")
    degree_type: Literal["undergraduate", "graduate", "mba", "medical", "law"] = Field(..., alias="degreeType")
    state: Optional[str] = None

class LoanOffer(BaseModel):
    offer_id: str = Field(..., alias="offerId")
    lender: Dict[str, Any]
    product: Dict[str, Any]
    terms: Dict[str, Any]
    fees: Optional[Dict[str, Any]] = None
    matching: Optional[Dict[str, Any]] = None
    process: Optional[Dict[str, Any]] = None

class LoanComparisonResponse(BaseModel):
    offers: List[LoanOffer]
    summary: Dict[str, Any]
    search_criteria: Optional[Dict[str, Any]] = Field(None, alias="searchCriteria")
    metadata: Dict[str, Any]
    widget: Optional[str] = None

# ============================================================================
# Banking & Credit Cards
# ============================================================================

class BusinessBankingSearchSchema(BaseModel):
    industry: Optional[str] = None
    monthly_transactions: Optional[int] = Field(None, alias="monthlyTransactions")

class BusinessBankingOffer(BaseModel):
    account_id: str = Field(..., alias="accountId")
    name: str
    issuer: str

class BusinessBankingComparisonResponse(BaseModel):
    offers: List[BusinessBankingOffer]
    widget: Optional[str] = None

class PersonalBankingSearchSchema(BaseModel):
    features: Optional[List[str]] = None

class PersonalBankingOffer(BaseModel):
    account_id: str = Field(..., alias="accountId")

class PersonalBankingComparisonResponse(BaseModel):
    offers: List[PersonalBankingOffer]
    widget: Optional[str] = None

class SavingsSearchSchema(BaseModel):
    initial_deposit: Optional[float] = Field(None, alias="initialDeposit")

class SavingsOffer(BaseModel):
    account_id: str = Field(..., alias="accountId")

class SavingsAccountComparisonResponse(BaseModel):
    offers: List[SavingsOffer]
    widget: Optional[str] = None

class BusinessCreditCardSearchParams(BaseModel):
    credit_score: Optional[int] = Field(None, alias="creditScore")
    annual_revenue: Optional[float] = Field(None, alias="annualRevenue")
    business_age_in_years: Optional[float] = Field(None, alias="businessAgeInYears")

class BusinessCreditCardOffer(BaseModel):
    card_id: str = Field(..., alias="cardId")

class BusinessCreditCardComparisonResponse(BaseModel):
    offers: List[BusinessCreditCardOffer]
    widget: Optional[str] = None

class PersonalCreditCardSearchSchema(BaseModel):
    credit_score: Optional[int] = Field(None, alias="creditScore")
    rewards_type: Optional[Literal["cash_back", "travel", "points"]] = Field(None, alias="rewardsType")

class PersonalCreditCardOffer(BaseModel):
    card_id: str = Field(..., alias="cardId")
    application_url: Optional[str] = Field(None, alias="applicationUrl")

class PersonalCreditCardComparisonResponse(BaseModel):
    offers: List[PersonalCreditCardOffer]
    widget: Optional[str] = None

# ============================================================================
# Financial Calculators
# ============================================================================

class LoanPaymentParams(BaseModel):
    loan_amount: float = Field(..., alias="loanAmount")
    interest_rate: float = Field(..., alias="interestRate")
    loan_term_in_months: int = Field(..., alias="loanTermInMonths")

class LoanCalculationResponse(BaseModel):
    monthly_payment: float = Field(..., alias="monthlyPayment")
    total_payment: float = Field(..., alias="totalPayment")
    total_interest: float = Field(..., alias="totalInterest")
    widget: Optional[str] = None

class MortgagePaymentParams(BaseModel):
    property_value: float = Field(..., alias="propertyValue")
    down_payment: float = Field(..., alias="downPayment")
    interest_rate: float = Field(..., alias="interestRate")
    loan_term_in_years: int = Field(..., alias="loanTermInYears")
    property_tax_rate: float = Field(..., alias="propertyTaxRate")
    home_insurance: float = Field(..., alias="homeInsurance")

class MortgageCalculationResponse(BaseModel):
    loan_amount: float = Field(..., alias="loanAmount")
    principal_and_interest: float = Field(..., alias="principalAndInterest")
    monthly_property_tax: float = Field(..., alias="monthlyPropertyTax")
    monthly_home_insurance: float = Field(..., alias="monthlyHomeInsurance")
    total_monthly_payment: float = Field(..., alias="totalMonthlyPayment")
    widget: Optional[str] = None

class LeaseVsPurchaseParams(BaseModel):
    purchase_price: float = Field(..., alias="purchasePrice")
    down_payment: float = Field(..., alias="downPayment")
    loan_term_in_months: int = Field(..., alias="loanTermInMonths")
    interest_rate: float = Field(..., alias="interestRate")
    sales_tax_rate: float = Field(..., alias="salesTaxRate")
    lease_term_in_months: int = Field(..., alias="leaseTermInMonths")
    monthly_lease_payment: float = Field(..., alias="monthlyLeasePayment")
    money_factor: float = Field(..., alias="moneyFactor")
    acquisition_fee: float = Field(..., alias="acquisitionFee")
    security_deposit: float = Field(..., alias="securityDeposit")
    residual_value_percentage: float = Field(..., alias="residualValuePercentage")
    expected_ownership_in_months: int = Field(..., alias="expectedOwnershipInMonths")

class LeaseVsPurchaseResponse(BaseModel):
    purchase_analysis: Dict[str, Any] = Field(..., alias="purchaseAnalysis")
    lease_analysis: Dict[str, Any] = Field(..., alias="leaseAnalysis")
    comparison: Dict[str, Any]
    widget: Optional[str] = None

# ============================================================================
# Application Management
# ============================================================================

class PersonalApplicant(BaseModel):
    first_name: str = Field(..., alias="firstName")
    last_name: str = Field(..., alias="lastName")
    email: str
    phone: Optional[str] = None

class GetOfferParams(BaseModel):
    product_type: str = Field(..., alias="productType")
    applicant: PersonalApplicant
    application_data: Dict[str, Any] = Field(..., alias="applicationData")
    provider: Dict[str, Any]

class GetMultipleOffersParams(BaseModel):
    product_type: str = Field(..., alias="productType")
    applicant: PersonalApplicant
    application_data: Dict[str, Any] = Field(..., alias="applicationData")
    providers: List[Dict[str, Any]]

class PersonalApplication(BaseModel):
    id: str
    widget: Optional[str] = None

class DisplayOfferFormParams(BaseModel):
    session_id: Optional[str] = Field(None, alias="sessionId")
    offer_id: Optional[str] = Field(None, alias="offerId")

AnyOffer = Union[LoanOffer, BusinessCreditCardOffer, BusinessBankingOffer, PersonalBankingOffer, SavingsOffer, PersonalCreditCardOffer]

class DisplayOfferFormResponse(BaseModel):
    offer: AnyOffer
    all_offers: List[AnyOffer] = Field(..., alias="allOffers")
    application_data: Dict[str, Any] = Field(..., alias="applicationData")
    product_type: str = Field(..., alias="productType")
    widget: Optional[str] = None

class TrackOfferStatusParams(BaseModel):
    application_id: Optional[str] = Field(None, alias="applicationId")
    email: Optional[str] = None

class TrackOfferStatusResponse(BaseModel):
    applications: List[PersonalApplication]
    widget: Optional[str] = None

class DisplayUploadDocumentsFormParams(BaseModel):
    application_id: Optional[str] = Field(None, alias="applicationId")

class DisplayUploadDocumentsFormResponse(BaseModel):
    widget: Optional[str] = None

class SubmitDocumentsParams(BaseModel):
    application_id: str = Field(..., alias="applicationId")
    file_name: str = Field(..., alias="fileName")
    document_type: str = Field(..., alias="documentType")

class SubmitDocumentsResponse(BaseModel):
    success: bool
    message: str
    upload_url: Optional[str] = Field(None, alias="uploadUrl")
    upload_fields: Optional[Dict[str, str]] = Field(None, alias="uploadFields")
    document_id: Optional[str] = Field(None, alias="documentId")
    widget: Optional[str] = None
