import React, { createContext, useMemo } from "react";
import { SecureLend, SecureLendConfig } from "@securelend/sdk";

interface SecureLendContextType {
  client: SecureLend | null;
}

export const SecureLendContext = createContext<SecureLendContextType>({
  client: null,
});

interface SecureLendProviderProps {
  config?: SecureLendConfig;
  children: React.ReactNode;
}

export function SecureLendProvider({
  config,
  children,
}: SecureLendProviderProps) {
  const client = useMemo(() => new SecureLend(config), [config]);

  return (
    <SecureLendContext.Provider value={{ client }}>
      {children}
    </SecureLendContext.Provider>
  );
}
