import React from "react";

interface SecureLendWidgetProps {
  html: string;
  className?: string;
}

export function SecureLendWidget({ html, className }: SecureLendWidgetProps) {
  return (
    <div
      className={className || "securelend-widget"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
