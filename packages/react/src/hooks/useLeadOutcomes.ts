import { useEffect, useState } from "react";
import { useSecureLend } from "./useSecureLend";

interface OutcomeApi {
  outcomes: { list(leadId: string): Promise<unknown[]> };
}

/** Loads lender outcomes for one lead. */
export function useLeadOutcomes(leadId: string | null) {
  const client = useSecureLend() as unknown as OutcomeApi;
  const [outcomes, setOutcomes] = useState<unknown[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!leadId) {
      setOutcomes([]);
      return;
    }
    let active = true;
    client.outcomes
      .list(leadId)
      .then((rows) => {
        if (active) setOutcomes(rows);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error
              ? err
              : new Error("Outcomes could not be loaded."),
          );
        }
      });
    return () => {
      active = false;
    };
  }, [client, leadId]);

  return { outcomes, error };
}
