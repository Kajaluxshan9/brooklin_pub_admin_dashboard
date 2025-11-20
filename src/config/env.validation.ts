/**
 * Environment Configuration Validator for Admin Dashboard
 * Validates required environment variables at build time and runtime
 */

interface EnvConfig {
  VITE_API_BASE_URL: string;
  VITE_APP_NAME?: string;
  VITE_APP_VERSION?: string;
  VITE_ENABLE_DEBUG?: string;
  VITE_ENABLE_ANALYTICS?: string;
}

import logger from '../utils/logger';

const REQUIRED_ENV_VARS: (keyof EnvConfig)[] = ['VITE_API_BASE_URL'];

const OPTIONAL_ENV_VARS: (keyof EnvConfig)[] = [
  'VITE_APP_NAME',
  'VITE_APP_VERSION',
  'VITE_ENABLE_DEBUG',
  'VITE_ENABLE_ANALYTICS',
];

/**
 * Validates environment variables and throws error if required ones are missing
 */
export function validateEnvironment(): void {
  const missingVars: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const varName of REQUIRED_ENV_VARS) {
    const value = import.meta.env[varName];
    if (!value) {
      missingVars.push(varName);
    }
  }

  // Check for localhost in production
  if (import.meta.env.PROD) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    if (apiUrl && apiUrl.includes('localhost')) {
      warnings.push(
        '⚠️  VITE_API_BASE_URL contains localhost in production build.',
      );
    }
  }

  // Print warnings
  if (warnings.length > 0) {
    logger.warn('\n⚠️  Environment Configuration Warnings:');
    warnings.forEach((warning) => logger.warn(`   ${warning}`));
    logger.warn('');
  }

  // Throw error if required variables are missing
  if (missingVars.length > 0) {
    const errorMessage = `
╔════════════════════════════════════════════════════════════════════╗
║          MISSING ENVIRONMENT VARIABLES - ADMIN DASHBOARD           ║
╚════════════════════════════════════════════════════════════════════╝

The following required environment variables are not set:

${missingVars.map((v) => `  ❌ ${v}`).join('\n')}

Please ensure all required variables are defined in your .env file.
For development: Create .env.local
For production: Create .env.production.local

Example:
  VITE_API_BASE_URL=http://localhost:5000

Optional variables:
${OPTIONAL_ENV_VARS.map((v) => `  📝 ${v}`).join('\n')}

════════════════════════════════════════════════════════════════════
`;
    throw new Error(errorMessage);
  }

  // Success message
  if (import.meta.env.DEV) {
    logger.log('✅ Environment variables validated successfully');
    logger.log(`   API Base URL: ${import.meta.env.VITE_API_BASE_URL}`);
    logger.log(`   Mode: ${import.meta.env.MODE}`);
    logger.log('');
  }
}

/**
 * Get required environment variable with validation
 */
export function getRequiredEnv(key: keyof EnvConfig): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(
      `Environment variable ${key} is required but not set. Please check your .env file.`,
    );
  }
  return value;
}

/**
 * Get optional environment variable with fallback
 */
export function getOptionalEnv(
  key: keyof EnvConfig,
  fallback?: string,
): string | undefined {
  return import.meta.env[key] || fallback;
}
