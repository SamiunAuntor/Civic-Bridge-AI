export function toFriendlyAuthError(error: unknown) {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
      ? (error as { code: string }).code
      : "";

  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "The email or password you entered is incorrect.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case "auth/weak-password":
      return "Use a stronger password with at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before it finished.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup. Please allow popups and try again.";
    case "auth/cancelled-popup-request":
      return "Another sign-in attempt is already in progress.";
    case "auth/too-many-requests":
      return "Too many attempts were made. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "We couldn't reach the sign-in service. Check your connection and try again.";
    case "auth/missing-email":
      return "Enter your email address first so we can send a reset link.";
    default:
      return error instanceof Error && error.message
        ? error.message
        : "We couldn't complete that request right now. Please try again.";
  }
}
