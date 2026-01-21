import { useState, useCallback } from "react";
import {
  PersonalCreditCardComparisonRequest,
  PersonalCreditCardComparisonResponse,
  SecureLendError,
} from "@securelend/sdk";
import { useSecureLend } from "./useSecureLend";

export function useCreditCardComparison() {
  const client = useSecureLend();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PersonalCreditCardComparisonResponse | null>(null);
  const [widget, setWidget] = useState<string | null>(null);
  const [error, setError] = useState<SecureLendError | null>(null);

  const compare = useCallback(
    async (request: PersonalCreditCardComparisonRequest) => {
      setLoading(true);
      setError(null);
      setData(null);
      setWidget(null);

      try {
        const result = await client.comparePersonalCreditCards(request);
        setData(result);
        if (result.widget) {
          setWidget(result.widget);
        }
      } catch (err) {
        if (err instanceof SecureLendError) {
          setError(err);
        } else {
          setError(new SecureLendError((err as Error).message, "unknown_error"));
        }
      } finally {
        setLoading(false);
      }
    },
    [client],
  );

  return { compare, data, widget, loading, error };
}
