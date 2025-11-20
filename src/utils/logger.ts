// A small wrapper to prevent console logging in production builds
// DEVELOPMENT LOGGING: To enable browser console logs during local development,
// set VITE_ENABLE_DEBUG=true in your .env or .env.local file. Default is false.
const isDev = import.meta.env.DEV as boolean;
const enableDebug = (import.meta.env.VITE_ENABLE_DEBUG as string) === 'true';
const shouldLog = isDev && enableDebug;

export const logger = {
  debug: (...args: any[]) => {
    if (shouldLog) console.debug(...args);
  },
  log: (...args: any[]) => {
    if (shouldLog) console.log(...args);
  },
  info: (...args: any[]) => {
    if (shouldLog) console.info(...args);
  },
  warn: (...args: any[]) => {
    if (shouldLog) console.warn(...args);
  },
  error: (...args: any[]) => {
    if (shouldLog) console.error(...args);
  },
};

export default logger;
