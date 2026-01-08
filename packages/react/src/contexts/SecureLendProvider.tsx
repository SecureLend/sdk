import React, { createContext, useMemo } from "react";
import { SecureLend } from "@securelend/sdk";

interface SecureLendContextType {
  client: SecureLend | null;
}

export const SecureLendContext = createContext<SecureLendContextType>({
  client: null,
});

interface SecureLendProviderProps {
  apiKey: string;
  children: React.ReactNode;
}

export function SecureLendProvider({
  apiKey,
  children,
}: SecureLendProviderProps) {
  const client = useMemo(() => new SecureLend(apiKey), [apiKey]);

  return (
    <SecureLendContext.Provider value={{ client }}>
      {children}
    </SecureLendContext.Provider>
  );
}
