const {
    cert,
    getApp,
    getApps,
    initializeApp,
} = require("firebase-admin/app");
const { getAuth, } = require("firebase-admin/auth");

function parseServiceAccountFromEnv() {
    const encodedCredential = process.env.FIREBASE_ADMIN_CREDENTIAL_BASE64;

    if (!encodedCredential) {
        throw new Error(
            "Missing FIREBASE_ADMIN_CREDENTIAL_BASE64. Encode your Firebase Admin service account JSON as Base64 and set it in the server environment.",
        );
    }

    try {
        const decodedCredential = Buffer
            .from(encodedCredential, "base64")
            .toString("utf8");

        return JSON.parse(decodedCredential);
    } catch (error) {
        throw new Error(
            `Invalid FIREBASE_ADMIN_CREDENTIAL_BASE64 value. ${error instanceof Error ? error.message : "The credential could not be parsed."}`,
        );
    }
}

const isTestEnvironment = process.env.NODE_ENV === "test";

const app = isTestEnvironment
    ? null
    : (
        getApps().length
            ? getApp()
            : initializeApp({
                credential: cert(parseServiceAccountFromEnv()),
            })
    );

module.exports = {
    app,
    auth: isTestEnvironment
        ? {
            verifyIdToken: async () => {
                throw new Error("Firebase auth must be mocked in tests.");
            },
        }
        : getAuth(app),
};
