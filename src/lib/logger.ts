import { Logtail } from "@logtail/next";

// Fallback to console in development or if token is missing
const isProduction = process.env.NODE_ENV === "production";
const hasToken = !!process.env.LOGTAIL_SOURCE_TOKEN;

// Initialize Logtail if in production and token is available
export const logtail = hasToken ? new Logtail(process.env.LOGTAIL_SOURCE_TOKEN!) : null;

export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    if (logtail) {
      logtail.info(message, context);
    } else {
      console.log(`[INFO] ${message}`, context ? context : '');
    }
  },
  warn: (message: string, context?: Record<string, any>) => {
    if (logtail) {
      logtail.warn(message, context);
    } else {
      console.warn(`[WARN] ${message}`, context ? context : '');
    }
  },
  error: (message: string, error?: any, context?: Record<string, any>) => {
    const errorDetails = error instanceof Error ? { errorName: error.name, errorMessage: error.message, stack: error.stack } : { error };
    if (logtail) {
      logtail.error(message, { ...errorDetails, ...context });
    } else {
      console.error(`[ERROR] ${message}`, errorDetails, context ? context : '');
    }
  }
};
