import { useState, useEffect } from "react";
import {
  useLoanComparison,
  useDisplayOfferForm,
  SecureLendWidget,
} from "@securelend/react";
import {
  LoanComparisonWidget,
  ApplicationFormWidget,
} from "@securelend/widgets";
import type {
  BusinessLoanSearchParams,
  LoanOffer,
  PersonalApplication,
} from "@securelend/sdk";

export default function Home() {
  const { compare, data, widget, loading, error } = useLoanComparison();
  const [loanAmount, setLoanAmount] = useState("50000");
  const [purpose, setPurpose] = useState("working_capital");
  const [annualRevenue, setAnnualRevenue] = useState("300000");
  const [industry, setIndustry] = useState("restaurant");
  const [usState, setUsState] = useState("CA");

  const {
    displayForm,
    data: offerFormData,
    loading: displayFormLoading,
    error: displayFormError,
  } = useDisplayOfferForm();

  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationResult, setApplicationResult] = useState<PersonalApplication | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplicationResult(null);
    setShowApplicationForm(false);
    const request: BusinessLoanSearchParams = {
      loanAmount: parseInt(loanAmount, 10),
      purpose,
      annualRevenue: parseInt(annualRevenue, 10),
      industry,
      state: usState,
    };
    compare(request);
  };

  const handleApplyClick = (offer: LoanOffer) => {
    if (data?.metadata.sessionId) {
      displayForm({
        offerId: offer.offerId,
        sessionId: data.metadata.sessionId,
      });
    }
  };

  useEffect(() => {
    if (offerFormData) {
      setShowApplicationForm(true);
    }
  }, [offerFormData]);

  const handleFormSubmitted = (
    submissionType: "single" | "multiple",
    application: PersonalApplication,
  ) => {
    setShowApplicationForm(false);
    setApplicationResult(application);
  };
  
  const handleBackToOffers = () => {
    setShowApplicationForm(false);
  }

  const isLoading = loading || displayFormLoading;

  if (showApplicationForm && offerFormData) {
    return (
      <main>
        <ApplicationFormWidget
          offerData={offerFormData}
          onSubmitted={handleFormSubmitted}
          onCancel={handleBackToOffers}
        />
      </main>
    );
  }

  if (applicationResult) {
    return (
      <main>
        <h1>Application Submitted!</h1>
        <p>Your application ID is: {applicationResult.id}</p>
        <button onClick={() => window.location.reload()}>Start Over</button>
      </main>
    );
  }

  return (
    <main>
      <h1 className="page-title">Business Loan Comparison</h1>
      <p className="page-subtitle">
        Enter your loan requirements to compare offers from top lenders.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={loanAmount}
          onChange={(e) => setLoanAmount(e.target.value)}
          placeholder="Loan Amount"
          required
        />
        <input
          type="text"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Loan Purpose"
          required
        />
        <input
          type="number"
          value={annualRevenue}
          onChange={(e) => setAnnualRevenue(e.target.value)}
          placeholder="Annual Revenue"
          required
        />
        <input
          type="text"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder="Industry"
          required
        />
        <input
          type="text"
          value={usState}
          onChange={(e) => setUsState(e.target.value)}
          placeholder="State (e.g. CA)"
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Compare Loans"}
        </button>
      </form>

      {(error || displayFormError) && (
        <p className="error">
          Error: {error?.message || displayFormError?.message}
        </p>
      )}

      <div className="widget-container">
        {data && !widget && (
          <LoanComparisonWidget
            response={data}
            onApplyClick={handleApplyClick}
          />
        )}
        {widget && <SecureLendWidget html={widget} />}
      </div>
    </main>
  );
}
