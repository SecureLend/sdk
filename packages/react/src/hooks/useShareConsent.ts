import { useEffect, useState } from "react";
import { useSecureLend } from "./useSecureLend";

interface ConsentApi {
  consents: { list(leadId?: string): Promise<unknown[]> };
}

/** Loads share consents for one lead. */
export function useShareConsent(leadId: string | null) {
  const client = useSecureLend() as unknown as ConsentApi;
  const [consents, setConsents] = useState<unknown[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!leadId) {
      setConsents([]);
      return;
    }
    let active = true;
    client.consents
      .list(leadId)
      .then((rows) => {
        if (active) setConsents(rows);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error
              ? err
              : new Error("Consents could not be loaded."),
          );
        }
      });
    return () => {
      active = false;
    };
  }, [client, leadId]);

  return { consents, error };
}
