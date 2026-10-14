import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { SecureLendContext } from "../../src/contexts/SecureLendProvider";
import { useLead } from "../../src/hooks/useLead";
import { useLeadOutcomes } from "../../src/hooks/useLeadOutcomes";
import { useShareConsent } from "../../src/hooks/useShareConsent";

function wrap(client: object) {
  return ({ children }: { children: React.ReactNode }) => (
    <SecureLendContext.Provider value={{ client: client as never }}>
      {children}
    </SecureLendContext.Provider>
  );
}

describe("loop hooks", () => {
  it("loads a lead, its outcomes, and its consents", async () => {
    const client = {
      leads: { get: jest.fn(async () => ({ id: "enquiry_1" })) },
      outcomes: {
        list: jest.fn(async () => [{ id: "out_1", state: "viewed" }]),
      },
      consents: { list: jest.fn(async () => [{ id: "cns_1" }]) },
    };
    const wrapper = wrap(client);
    const lead = renderHook(() => useLead("enquiry_1"), { wrapper });
    const outcomes = renderHook(() => useLeadOutcomes("enquiry_1"), {
      wrapper,
    });
    const consents = renderHook(() => useShareConsent("enquiry_1"), {
      wrapper,
    });
    await waitFor(() =>
      expect(lead.result.current.lead).toEqual({ id: "enquiry_1" }),
    );
    await waitFor(() =>
      expect(outcomes.result.current.outcomes).toHaveLength(1),
    );
    await waitFor(() =>
      expect(consents.result.current.consents).toEqual([{ id: "cns_1" }]),
    );
    expect(client.leads.get).toHaveBeenCalledWith("enquiry_1");
  });
});
