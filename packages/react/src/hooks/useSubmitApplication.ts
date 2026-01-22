import { useState, useCallback } from "react";
import {
  GetOfferParams,
  GetMultipleOffersParams,
  PersonalApplication,
  SecureLendError,
} from "@securelend/sdk";
import { useSecureLend } from "./useSecureLend";

export function useSubmitApplication() {
  const client = useSecureLend();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PersonalApplication | null>(null);
  const [error, setError] = useState<SecureLendError | null>(null);

  const submitOffer = useCallback(
    async (request: GetOfferParams) => {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const result = await client.getOffer(request);
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

  const submitMultipleOffers = useCallback(
    async (request: GetMultipleOffersParams) => {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const result = await client.getMultipleOffers(request);
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

  return { submitOffer, submitMultipleOffers, data, loading, error };
}
