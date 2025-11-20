/**
 * Global Environment Configuration
 *
 * This file provides a centralized location for accessing environment variables
 * across the frontend application. Import constants from here instead of
 * accessing import.meta.env directly.
 */

import { getRequiredEnv, getOptionalEnv } from './env.validation';

// ========================================
// API Configuration (Required)
// ========================================
export const API_BASE_URL = getRequiredEnv('VITE_API_BASE_URL');

// ========================================
// Application Configuration (Optional)
// ========================================
export const APP_NAME = getOptionalEnv(
  'VITE_APP_NAME',
  'Brooklin Pub Admin Dashboard',
);
export const APP_VERSION = getOptionalEnv('VITE_APP_VERSION', '1.0.0');

// ========================================
// Feature Flags (Optional)
// ========================================
export const ENABLE_DEBUG =
  (getOptionalEnv('VITE_ENABLE_DEBUG') || 'false') === 'true';
export const ENABLE_ANALYTICS =
  (getOptionalEnv('VITE_ENABLE_ANALYTICS') || 'false') === 'true';

// ========================================
// Environment Info
// ========================================
export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;
export const NODE_ENV = import.meta.env.MODE;
