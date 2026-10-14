import { useEffect, useState } from "react";
import { useSecureLend } from "./useSecureLend";

interface LeadApi {
  leads: { get(id: string): Promise<unknown> };
}

/** Loads one lead for this workspace. */
export function useLead(id: string | null) {
  const client = useSecureLend() as unknown as LeadApi;
  const [lead, setLead] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLead(null);
      return;
    }
    let active = true;
    client.leads
      .get(id)
      .then((row) => {
        if (active) setLead(row);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error
              ? err
              : new Error("The lead could not be loaded."),
          );
        }
      });
    return () => {
      active = false;
    };
  }, [client, id]);

  return { lead, error };
}
