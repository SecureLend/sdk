import { useContext } from "react";
import { SecureLendContext } from "../contexts/SecureLendProvider";

export function useSecureLend() {
  const context = useContext(SecureLendContext);
  if (!context || !context.client) {
    throw new Error("useSecureLend must be used within a SecureLendProvider");
  }
  return context.client;
}
