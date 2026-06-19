"use client";

import { Toaster } from "react-hot-toast";

export function FeedbackProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#ffffff",
          color: "#173b72",
          border: "1px solid #d9deea",
          borderRadius: "16px",
          boxShadow: "0 18px 38px -24px rgba(23, 59, 114, 0.35)",
          padding: "14px 16px",
        },
        success: {
          iconTheme: {
            primary: "#173b72",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#bf4733",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}
