import { useState, useCallback } from "react";
import {
  CreditCardComparisonRequest,
  CreditCardComparisonResponse,
  SecureLendError,
} from "@securelend/sdk";
import { useSecureLend } from "./useSecureLend";

export function useCreditCardComparison() {
  const client = useSecureLend();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CreditCardComparisonResponse | null>(null);
  const [widget, setWidget] = useState<string | null>(null);
  const [error, setError] = useState<SecureLendError | null>(null);

  const compare = useCallback(
    async (request: CreditCardComparisonRequest) => {
      setLoading(true);
      setError(null);
      setData(null);
      setWidget(null);

      try {
        const result = await client.creditCards.compare(request);
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
