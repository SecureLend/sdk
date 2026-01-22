import React, { useMemo, useCallback, useState } from "react";
import { useSubmitApplication } from "@securelend/react";
import type {
  DisplayOfferFormResponse,
  GetOfferParams,
  GetMultipleOffersParams,
  PersonalApplication,
} from "@securelend/sdk";

// Helper to safely extract provider info from different offer types
function getProviderInfo(offer: any): { name: string; id: string } | null {
  if (!offer) return null;
  // Loan Offer
  if ("lender" in offer && offer.lender) {
    return { name: offer.lender.name, id: offer.lender.id };
  }
  // Credit Card Offer (personal and business)
  if ("issuer" in offer && "cardId" in offer) {
    return { name: offer.issuer, id: offer.cardId };
  }
  // Banking/Savings Offer
  if ("issuer" in offer && "accountId" in offer) {
    return { name: offer.issuer, id: offer.accountId };
  }
  return null;
}

type ApplicantInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

function ConsentModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [agreed, setAgreed] = useState(false);

  const modalStyles: { [key: string]: React.CSSProperties } = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      paddingTop: "5vh",
      zIndex: 1000,
      fontFamily: "inherit",
    },
    modal: {
      backgroundColor: "var(--bg-card)",
      padding: "2rem",
      borderRadius: "var(--radius)",
      maxWidth: "500px",
      width: "90%",
      boxShadow: "var(--shadow)",
      color: "var(--text-main)",
      maxHeight: "90vh",
      overflowY: "auto",
      boxSizing: "border-box",
    },
    title: {
      fontSize: "1.25rem",
      fontWeight: 600,
      marginBottom: "1rem",
    },
    text: {
      margin: "0 0 1.5rem 0",
      lineHeight: 1.5,
      color: "var(--text-muted)",
    },
    disclosureItem: {
      marginBottom: "1rem",
    },
    disclosureTitle: {
      fontSize: "0.875rem",
      fontWeight: 600,
      color: "var(--text-main)",
      margin: "0 0 0.25rem 0",
    },
    disclosureText: {
      fontSize: "0.875rem",
      color: "var(--text-muted)",
      margin: 0,
      lineHeight: 1.5,
    },
    agreementContainer: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      marginTop: "1.5rem",
      marginBottom: "1.5rem",
    },
    checkbox: {
      width: "1.25rem",
      height: "1.25rem",
      cursor: "pointer",
      flexShrink: 0,
    },
    agreementLabel: {
      fontSize: "0.875rem",
      color: "var(--text-muted)",
      cursor: "pointer",
    },
    link: {
      color: "#3B82F6",
      textDecoration: "underline",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "0.75rem",
    },
    button: {
      padding: "0.625rem 1.25rem",
      borderRadius: "8px",
      border: "none",
      fontSize: "0.875rem",
      fontWeight: 500,
      cursor: "pointer",
    },
    cancelButton: {
      backgroundColor: "var(--highlight)",
      color: "var(--text-main)",
    },
    confirmButton: {
      backgroundColor: "var(--primary)",
      color: "#FFFFFF",
    },
  };

  return (
    <div style={modalStyles.overlay} onClick={onCancel}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={modalStyles.title}>Important Disclosures</h2>
        <p style={modalStyles.text}>Please confirm the following to proceed:</p>

        <div style={modalStyles.disclosureItem}>
          <h3 style={modalStyles.disclosureTitle}>Role</h3>
          <p style={modalStyles.disclosureText}>
            SecureLend is a comparison and introduction platform, not a lender.
            We do not make credit decisions or provide financial advice.
          </p>
        </div>
        <div style={modalStyles.disclosureItem}>
          <h3 style={modalStyles.disclosureTitle}>Data Usage</h3>
          <p style={modalStyles.disclosureText}>
            You authorize us to share your information and uploaded documents
            with our partner network solely for the purpose of generating
            non-binding offers.
          </p>
        </div>
        <div style={modalStyles.disclosureItem}>
          <h3 style={modalStyles.disclosureTitle}>Compensation</h3>
          <p style={modalStyles.disclosureText}>
            We may receive a commission from partners if you choose their
            product. This does not affect the cost of your offer.
          </p>
        </div>

        <div style={modalStyles.agreementContainer}>
          <input
            type="checkbox"
            id="terms-agree"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            style={modalStyles.checkbox}
          />
          <label htmlFor="terms-agree" style={modalStyles.agreementLabel}>
            I agree to the{" "}
            <a
              href="https://securelend.ai/legal/terms"
              target="_blank"
              rel="noopener noreferrer"
              style={modalStyles.link}
            >
              Terms of Service
            </a>{" "}
            and have read the{" "}
            <a
              href="https://securelend.ai/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={modalStyles.link}
            >
              Privacy Policy
            </a>
            .
          </label>
        </div>

        <div style={modalStyles.buttonContainer}>
          <button
            style={{ ...modalStyles.button, ...modalStyles.cancelButton }}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            style={{
              ...modalStyles.button,
              ...modalStyles.confirmButton,
              ...(!agreed ? { opacity: 0.5, cursor: "not-allowed" } : {}),
            }}
            onClick={onConfirm}
            disabled={!agreed}
          >
            I Understand, Proceed
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({
  name,
  label,
  type = "text",
  styles,
  value,
  onChange,
}: {
  name: keyof ApplicantInfo;
  label: string;
  type?: string;
  styles: { [key: string]: React.CSSProperties };
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div style={styles.inputGroup}>
      <label htmlFor={name} style={styles.label}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        style={styles.input}
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );
}

interface ApplicationFormWidgetProps {
  offerData: DisplayOfferFormResponse;
  onSubmitted: (
    submissionType: "single" | "multiple",
    application: PersonalApplication,
  ) => void;
  onCancel?: () => void;
}

export const ApplicationFormWidget = ({
  offerData,
  onSubmitted,
  onCancel,
}: ApplicationFormWidgetProps) => {
  const styles: { [key: string]: React.CSSProperties } = useMemo(
    () => ({
      pageWrapper: {
        width: "100%",
        fontFamily: "inherit",
      },
      container: {
        maxWidth: "480px",
        margin: "0 auto",
        backgroundColor: "var(--bg-card)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow)",
        overflow: "hidden",
      },
      content: {
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      },
      title: {
        fontSize: "1.5rem",
        fontWeight: 600,
        color: "var(--primary)",
        textAlign: "center",
        margin: 0,
      },
      form: { display: "flex", flexDirection: "column", gap: "1rem" },
      inputGroup: { display: "flex", flexDirection: "column", gap: "0.5rem" },
      label: {
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "var(--text-main)",
      },
      input: {
        padding: "14px",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        fontSize: "1rem",
        color: "var(--text-main)",
        backgroundColor: "var(--bg-body)",
      },
      button: {
        padding: "14px 28px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "var(--primary)",
        color: "#FFFFFF",
        fontSize: "1rem",
        fontWeight: 600,
        cursor: "pointer",
      },
      buttonDisabled: { opacity: 0.6, cursor: "not-allowed" },
      centered: {
        textAlign: "center",
        padding: "2rem",
        color: "var(--primary)",
      },
      paragraph: {
        textAlign: "center",
        color: "var(--text-muted)",
      },
    }),
    [],
  );

  const { submitOffer, submitMultipleOffers, loading } = useSubmitApplication();

  const [applicantInfo, setApplicantInfo] = useState<ApplicantInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [submissionType, setSubmissionType] = useState<
    "single" | "multiple" | null
  >(null);
  const [showConsent, setShowConsent] = useState(false);

  const updateField = (field: keyof ApplicantInfo, value: string) => {
    setApplicantInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionType("single");
    setShowConsent(true);
  };

  const handleMultipleSubmit = () => {
    setSubmissionType("multiple");
    setShowConsent(true);
  };

  const executeSubmission = useCallback(async () => {
    if (!submissionType) return;

    try {
      if (submissionType === "single") {
        const providerInfo = getProviderInfo(offerData.offer);
        if (!providerInfo) {
          console.error("Could not determine provider info from offer.");
          return;
        }

        const request: GetOfferParams = {
          productType: offerData.productType as any,
          applicant: applicantInfo,
          applicationData: offerData.applicationData,
          provider: {
            providerId: providerInfo.id,
            providerName: providerInfo.name,
          },
        };
        const result = await submitOffer(request);
        onSubmitted("single", result);
      } else {
        const providers = offerData.allOffers
          .map((offer) => {
            const info = getProviderInfo(offer);
            return info ? { providerId: info.id, providerName: info.name } : null;
          })
          .filter((p): p is { providerId: string; providerName: string } => !!p);
        
        if (providers.length === 0) {
          console.error("Could not determine provider for any of the offers.");
          return;
        }

        const request: GetMultipleOffersParams = {
          productType: offerData.productType as any,
          applicant: applicantInfo,
          applicationData: offerData.applicationData,
          providers,
        };
        const result = await submitMultipleOffers(request);
        onSubmitted("multiple", result);
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      // You may want to show an error to the user here
    }
  }, [
    submissionType,
    offerData,
    applicantInfo,
    submitOffer,
    submitMultipleOffers,
    onSubmitted,
  ]);

  const onConfirmConsent = () => {
    setShowConsent(false);
    executeSubmission();
  };

  const lenderName = getProviderInfo(offerData.offer)?.name || "the provider";

  return (
    <div style={styles.pageWrapper}>
      {showConsent && (
        <ConsentModal
          onConfirm={onConfirmConsent}
          onCancel={() => setShowConsent(false)}
        />
      )}
      <div style={styles.container}>
        <div style={styles.content}>
          <h1 style={styles.title}>
            Complete your request with {lenderName}
          </h1>
          <form onSubmit={handleSingleSubmit} style={styles.form}>
            <InputField
              name="firstName"
              label="First Name"
              styles={styles}
              value={applicantInfo.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
            />
            <InputField
              name="lastName"
              label="Last Name"
              styles={styles}
              value={applicantInfo.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
            />
            <InputField
              name="email"
              label="Email Address"
              type="email"
              styles={styles}
              value={applicantInfo.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
            <InputField
              name="phone"
              label="Phone Number"
              type="tel"
              styles={styles}
              value={applicantInfo.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
            <div
              style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}
            >
              <button
                type="submit"
                style={{
                  ...styles.button,
                  flex: 1,
                  ...(loading && submissionType === "single"
                    ? styles.buttonDisabled
                    : {}),
                }}
                disabled={loading}
              >
                {loading && submissionType === "single"
                  ? "Submitting..."
                  : `Submit to ${lenderName}`}
              </button>
              {offerData?.allOffers?.length > 1 && (
                <button
                  type="button"
                  onClick={handleMultipleSubmit}
                  style={{
                    ...styles.button,
                    flex: 1,
                    ...(loading && submissionType === "multiple"
                      ? styles.buttonDisabled
                      : {}),
                  }}
                  disabled={loading}
                >
                  {loading && submissionType === "multiple"
                    ? "Submitting..."
                    : `Get All ${offerData?.allOffers?.length} Offers`}
                </button>
              )}
            </div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={{
                  ...styles.button,
                  backgroundColor: "transparent",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  marginTop: "0.5rem",
                }}
              >
                Back to Offers
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
