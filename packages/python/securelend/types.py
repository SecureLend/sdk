from __future__ import annotations
from typing import List, Literal, Optional, Union, Dict, Any
from pydantic import BaseModel, Field, model_validator
from enum import Enum

# ============================================================================
# Enums
# ============================================================================

class CreditTier(str, Enum):
    PRIME = "PRIME"
    NEAR_PRIME = "NEAR_PRIME"
    SUBPRIME = "SUBPRIME"
    DEEP_SUBPRIME = "DEEP_SUBPRIME"
    UNKNOWN = "UNKNOWN"

class ProductType(str, Enum):
    INSTALLMENT_LOAN = "INSTALLMENT_LOAN"
    LINE_OF_CREDIT = "LINE_OF_CREDIT"
    SHORT_TERM_CREDIT = "SHORT_TERM_CREDIT"
    BNPL = "BNPL"
    MORTGAGE = "MORTGAGE"
    AUTO_LOAN = "AUTO_LOAN"
    AUTO_REFINANCE = "AUTO_REFINANCE"
    STUDENT_LOAN = "STUDENT_LOAN"
    STUDENT_LOAN_REFINANCE = "STUDENT_LOAN_REFINANCE"
    BUSINESS_LOAN = "BUSINESS_LOAN"
    BUSINESS_BANKING = "BUSINESS_BANKING"
    BUSINESS_CREDIT_CARD = "BUSINESS_CREDIT_CARD"
    PERSONAL_BANKING = "PERSONAL_BANKING"
    SAVINGS_ACCOUNT = "SAVINGS_ACCOUNT"
    PERSONAL_CREDIT_CARD = "PERSONAL_CREDIT_CARD"

class ApplicationType(str, Enum):
    PERSONAL = "PERSONAL"
    BUSINESS = "BUSINESS"

class ApplicationStatus(str, Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    IN_REVIEW = "IN_REVIEW"
    ACTION_REQUIRED = "ACTION_REQUIRED"
    APPROVED = "APPROVED"
    DECLINED = "DECLINED"
    CLOSED = "CLOSED"

class ProviderStatus(str, Enum):
    PENDING = "PENDING"
    SUBMITTED = "SUBMITTED"
    REFERRED = "REFERRED"
    ERROR = "ERROR"
    RECEIVED = "RECEIVED"

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
    loan_amount: float = Field(..., alias="loanAmount", description="The desired loan amount in USD (e.g., 25000).")
    purpose: Literal["debt_consolidation", "home_improvement", "major_purchase", "medical", "vacation", "other"] = Field(..., description="The purpose of the loan.")
    credit_score: Optional[int] = Field(None, alias="creditScore", description="The applicant's estimated credit score (300-850).")
    monthly_income: Optional[float] = Field(None, alias="monthlyIncome", description="Applicant's gross monthly income in USD.")
    employment_status: Optional[Literal["employed", "self_employed", "retired", "unemployed"]] = Field(None, alias="employmentStatus", description="The applicant's employment status.")
    state: Optional[str] = Field(None, description="The applicant's state of residence (2-letter code).")

class BusinessLoanSearchParams(BaseModel):
    loan_amount: float = Field(..., alias="loanAmount", description="The desired loan amount, e.g., 50000 for $50,000.")
    purpose: str = Field(..., description="The reason for the loan, e.g., 'working capital'.")
    annual_revenue: Optional[float] = Field(None, alias="annualRevenue", description="The business's gross annual revenue in USD.")
    industry: Optional[str] = Field(None, description="The industry the business operates in, e.g., 'technology'.")
    state: Optional[str] = Field(None, description="The state where the business is located (2-letter code).")

class MortgageSearchParams(BaseModel):
    loan_amount: float = Field(..., alias="loanAmount", description="The desired mortgage loan amount in USD.")
    home_price: Optional[float] = Field(None, alias="homePrice", description="The purchase price of the home in USD.")
    down_payment: Optional[float] = Field(None, alias="downPayment", description="The amount of the down payment in USD.")
    credit_score: Optional[int] = Field(None, alias="creditScore", description="The applicant's estimated credit score (500-850).")
    loan_type: Literal["conventional", "fha", "va", "jumbo", "refinance"] = Field(..., alias="loanType", description="The type of mortgage loan.")
    property_type: Optional[Literal["primary", "secondary", "investment"]] = Field(None, alias="propertyType", description="The intended use of the property.")
    state: Optional[str] = Field(None, description="The state where the property is located (2-letter code).")

class AutoLoanSearchParams(BaseModel):
    loan_amount: float = Field(..., alias="loanAmount", description="The desired auto loan amount in USD.")
    credit_score: Optional[int] = Field(None, alias="creditScore", description="The applicant's estimated credit score (300-850).")
    is_new: bool = Field(..., alias="isNew", description="Specifies if the vehicle is new (true) or used (false).")
    state: Optional[str] = Field(None, description="The applicant's state of residence (2-letter code).")

class StudentLoanSearchParams(BaseModel):
    loan_amount: float = Field(..., alias="loanAmount", description="The total amount needed for the student loan in USD.")
    credit_score: Optional[int] = Field(None, alias="creditScore", description="The student's estimated credit score (300-850).")
    co_signer_credit_score: Optional[int] = Field(None, alias="coSignerCreditScore", description="The co-signer's estimated credit score (300-850), if applicable.")
    degree_type: Literal["undergraduate", "graduate", "mba", "medical", "law"] = Field(..., alias="degreeType", description="The type of degree the loan is for.")
    state: Optional[str] = Field(None, description="The student's state of residence (2-letter code).")

class Lender(BaseModel):
    id: str
    name: str
    type: str
    logo_url: Optional[str] = Field(None, alias="logoUrl")

class Product(BaseModel):
    name: str
    type: str
    description: Optional[str] = None

class InterestRate(BaseModel):
    type: Literal["fixed", "variable"]
    rate: Optional[float] = None
    apr: float

class Payment(BaseModel):
    frequency: Optional[str] = None
    amount: Money

class Repayment(BaseModel):
    total_repayment_amount: float = Field(..., alias="totalRepaymentAmount")
    cost_of_financing: float = Field(..., alias="costOfFinancing")

class LoanTerms(BaseModel):
    amount: Money
    interest_rate: InterestRate = Field(..., alias="interestRate")
    term_months: int = Field(..., alias="termMonths")
    payment: Payment
    total_cost: Optional[Money] = Field(None, alias="totalCost")
    repayment: Optional[Repayment] = None

class OriginationFee(BaseModel):
    amount: Optional[Money] = None
    percentage: Optional[float] = None

class LoanFees(BaseModel):
    origination: Optional[OriginationFee] = None

class Matching(BaseModel):
    approval_probability: Optional[float] = Field(None, alias="approvalProbability")
    match_score: Optional[float] = Field(None, alias="matchScore")
    match_reasons: Optional[List[str]] = Field(None, alias="matchReasons")

class FundingSpeed(BaseModel):
    description: str

class Process(BaseModel):
    application_method: str = Field(..., alias="applicationMethod")
    application_url: Optional[str] = Field(None, alias="applicationUrl")
    funding_speed: Optional[FundingSpeed] = Field(None, alias="fundingSpeed")

class LoanOffer(BaseModel):
    offer_id: str = Field(..., alias="offerId")
    lender: Lender
    product: Product
    terms: LoanTerms
    fees: Optional[LoanFees] = None
    matching: Optional[Matching] = None
    process: Optional[Process] = None
    lender_info: Optional[str] = Field(None, alias="lenderInfo")
    badges: Optional[List[str]] = None
    is_secure_lend_tenant: Optional[bool] = Field(None, alias="isSecureLendTenant")

class LoanComparisonSummary(BaseModel):
    total_offers: int = Field(..., alias="totalOffers")
    best_rate: float = Field(..., alias="bestRate")
    best_approval_probability: Optional[float] = Field(None, alias="bestApprovalProbability")
    fastest_funding: Optional[str] = Field(None, alias="fastestFunding")

class Metadata(BaseModel):
    query_id: str = Field(..., alias="queryId")
    timestamp: str
    session_id: Optional[str] = Field(None, alias="sessionId")

class LoanComparisonResponse(BaseModel):
    offers: List[LoanOffer]
    summary: LoanComparisonSummary
    search_criteria: Optional[Union[PersonalLoanSearchParams, BusinessLoanSearchParams, MortgageSearchParams, AutoLoanSearchParams, StudentLoanSearchParams]] = Field(None, alias="searchCriteria")
    metadata: Metadata
    widget: Optional[str] = None

# ============================================================================
# Banking & Credit Cards
# ============================================================================

class BusinessBankingSearchSchema(BaseModel):
    industry: Optional[str] = Field(None, description="The business's industry.")
    monthly_transactions: Optional[int] = Field(None, alias="monthlyTransactions", description="Estimated number of monthly transactions.")

class BusinessBankingOffer(BaseModel):
    account_id: str = Field(..., alias="accountId")
    name: str
    issuer: str
    image_url: str = Field(..., alias="imageUrl")
    rating: float
    best_for: str = Field(..., alias="bestFor")
    apy: str
    interest_rate: Optional[str] = Field(None, alias="interestRate")
    monthly_fee: str = Field(..., alias="monthlyFee")
    bonus: str

class BusinessBankingComparisonResponse(BaseModel):
    offers: List[BusinessBankingOffer]
    search_criteria: Optional[BusinessBankingSearchSchema] = Field(None, alias="searchCriteria")
    metadata: Metadata
    widget: Optional[str] = None

class PersonalBankingSearchSchema(BaseModel):
    features: Optional[List[str]] = Field(None, description="Desired account features.")

class PersonalBankingOffer(BaseModel):
    account_id: str = Field(..., alias="accountId")
    name: str
    issuer: str
    image_url: str = Field(..., alias="imageUrl")
    rating: float
    best_for: str = Field(..., alias="bestFor")
    apy: str
    interest_rate: Optional[str] = Field(None, alias="interestRate")
    bonus: str
    monthly_fee: str = Field(..., alias="monthlyFee")
    overdraft_rating: float = Field(..., alias="overdraftRating")

class PersonalBankingComparisonResponse(BaseModel):
    offers: List[PersonalBankingOffer]
    search_criteria: Optional[PersonalBankingSearchSchema] = Field(None, alias="searchCriteria")
    metadata: Metadata
    widget: Optional[str] = None

class SavingsSearchSchema(BaseModel):
    initial_deposit: Optional[float] = Field(None, alias="initialDeposit", description="The initial deposit amount in USD.")

class SavingsOffer(BaseModel):
    account_id: str = Field(..., alias="accountId")
    name: str
    issuer: str
    image_url: str = Field(..., alias="imageUrl")
    rating: float
    apy: str
    interest_rate: Optional[str] = Field(None, alias="interestRate")
    min_balance_for_apy: str = Field(..., alias="minBalanceForApy")
    monthly_fee: str = Field(..., alias="monthlyFee")

class SavingsAccountComparisonResponse(BaseModel):
    offers: List[SavingsOffer]
    search_criteria: Optional[SavingsSearchSchema] = Field(None, alias="searchCriteria")
    metadata: Metadata
    widget: Optional[str] = None

class BusinessCreditCardSearchParams(BaseModel):
    credit_score: Optional[int] = Field(None, alias="creditScore", description="The applicant's estimated credit score (300-850).")
    annual_revenue: Optional[float] = Field(None, alias="annualRevenue", description="The business's annual revenue in USD.")
    business_age_in_years: Optional[float] = Field(None, alias="businessAgeInYears", description="The age of the business in years.")

class BusinessCreditCardTerms(BaseModel):
    apr: float
    annual_fee: float = Field(..., alias="annualFee")
    credit_limit: Money = Field(..., alias="creditLimit")

class BusinessCreditCardOffer(BaseModel):
    card_id: str = Field(..., alias="cardId")
    name: str
    issuer: str
    image_url: str = Field(..., alias="imageUrl")
    rating: float
    credit_score_range: str = Field(..., alias="creditScoreRange")
    welcome_bonus: str = Field(..., alias="welcomeBonus")
    terms: BusinessCreditCardTerms

class BusinessCreditCardComparisonResponse(BaseModel):
    offers: List[BusinessCreditCardOffer]
    search_criteria: Optional[BusinessCreditCardSearchParams] = Field(None, alias="searchCriteria")
    metadata: Metadata
    widget: Optional[str] = None

class PersonalCreditCardSearchSchema(BaseModel):
    credit_score: Optional[int] = Field(None, alias="creditScore", description="The applicant's estimated credit score (300-850).")
    rewards_type: Optional[Literal["cash_back", "travel", "points"]] = Field(None, alias="rewardsType", description="Preferred rewards type.")

class PersonalCreditCardAPRs(BaseModel):
    purchase: float
    balance_transfer: float = Field(..., alias="balanceTransfer")
    penalty: Optional[float] = None

class PersonalCreditCardFees(BaseModel):
    annual: float

class PersonalCreditCardTerms(BaseModel):
    apr: PersonalCreditCardAPRs
    fees: PersonalCreditCardFees

class PersonalCreditCardOffer(BaseModel):
    card_id: str = Field(..., alias="cardId")
    name: str
    issuer: str
    image_url: str = Field(..., alias="imageUrl")
    rating: float
    best_for: str = Field(..., alias="bestFor")
    rewards_rate: str = Field(..., alias="rewardsRate")
    intro_offer: str = Field(..., alias="introOffer")
    recommended_credit_score: str = Field(..., alias="recommendedCreditScore")
    terms: PersonalCreditCardTerms
    application_url: Optional[str] = Field(None, alias="applicationUrl")

class PersonalCreditCardComparisonResponse(BaseModel):
    offers: List[PersonalCreditCardOffer]
    search_criteria: Optional[PersonalCreditCardSearchSchema] = Field(None, alias="searchCriteria")
    metadata: Metadata
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
    first_name: str = Field(..., alias="firstName", description="The applicant's first name.")
    last_name: str = Field(..., alias="lastName", description="The applicant's last name.")
    email: str = Field(..., description="The applicant's email address.")
    phone: Optional[str] = Field(None, description="The applicant's phone number.")

class Provider(BaseModel):
    provider_id: str = Field(..., alias="providerId", description="The ID of the selected provider.")
    provider_name: str = Field(..., alias="providerName", description="The name of the selected provider.")

class GetOfferParams(BaseModel):
    product_type: ProductType = Field(..., alias="productType", description="The type of financial product being applied for.")
    applicant: PersonalApplicant = Field(..., description="Personal details of the applicant.")
    application_data: Dict[str, Any] = Field(..., alias="applicationData", description="The original search parameters or form data for the application.")
    provider: Provider = Field(..., description="The selected provider to submit the application to.")

class GetMultipleOffersParams(BaseModel):
    product_type: ProductType = Field(..., alias="productType", description="The type of financial product being applied for.")
    applicant: PersonalApplicant = Field(..., description="Personal details of the applicant.")
    application_data: Dict[str, Any] = Field(..., alias="applicationData", description="The original search parameters or form data for the application.")
    providers: List[Provider] = Field(..., min_length=1, description="The list of selected providers to submit the application to.")

class ApplicationProvider(BaseModel):
    provider_id: str = Field(..., alias="providerId")
    provider_name: str = Field(..., alias="providerName")
    status: ProviderStatus
    submitted_at: Optional[str] = Field(None, alias="submittedAt")
    provider_application_id: Optional[str] = Field(None, alias="providerApplicationId")
    referral_url: Optional[str] = Field(None, alias="referralUrl")
    error: Optional[str] = None

class PersonalApplication(BaseModel):
    id: str
    created_at: str = Field(..., alias="createdAt")
    updated_at: str = Field(..., alias="updatedAt")
    application_type: ApplicationType = Field(..., alias="applicationType")
    product_type: Union[ProductType, str] = Field(..., alias="productType")
    status: ApplicationStatus
    applicant: PersonalApplicant
    application_data: Dict[str, Any] = Field(..., alias="applicationData")
    providers: List[ApplicationProvider]
    email: str
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

    @model_validator(mode="after")
    def check_application_id_or_email(self) -> "TrackOfferStatusParams":
        if not self.application_id and not self.email:
            raise ValueError("Either applicationId or email must be provided.")
        return self

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
