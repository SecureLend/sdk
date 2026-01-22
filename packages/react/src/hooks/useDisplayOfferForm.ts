import { useState, useCallback } from "react";
import {
  DisplayOfferFormParams,
  DisplayOfferFormResponse,
  SecureLendError,
} from "@securelend/sdk";
import { useSecureLend } from "./useSecureLend";

export function useDisplayOfferForm() {
  const client = useSecureLend();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DisplayOfferFormResponse | null>(null);
  const [error, setError] = useState<SecureLendError | null>(null);

  const displayForm = useCallback(
    async (request: DisplayOfferFormParams) => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const result = await client.displayOfferForm(request);
        setData(result);
        return result;
      } catch (err) {
        if (err instanceof SecureLendError) {
          setError(err);
        } else {
          setError(new SecureLendError((err as Error).message, "unknown_error"));
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client],
  );

  return { displayForm, data, loading, error };
}
