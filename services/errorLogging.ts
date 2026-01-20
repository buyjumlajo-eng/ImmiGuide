import * as Sentry from "@sentry/react";

export const initErrorLogging = () => {
  // Check for DSN in environment variables
  if (process.env.SENTRY_DSN) {
    try {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
        // We recommend adjusting this value in production.
        tracesSampleRate: 1.0,
      });
      console.log("Sentry initialized successfully");
    } catch (e) {
      console.error("Failed to initialize Sentry:", e);
    }
  } else {
    console.warn("Sentry DSN not found. Error logging is disabled.");
  }
};

export const logError = (error: Error, context?: Record<string, any>) => {
    console.error("Logged Error:", error);
    if (process.env.SENTRY_DSN) {
        Sentry.captureException(error, { extra: context });
    }
};