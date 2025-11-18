/**
 * Admin Configuration
 * Controls admin access and features throughout the application
 */

/**
 * Check if admin functionality is enabled
 * This can be controlled via environment variables or build-time configuration
 */
export function isAdminEnabled() {
  // Enable admin in development by default
  if (import.meta.env.DEV) {
    return true;
  }
  
  // In production, check environment variable
  return import.meta.env.VITE_ENABLE_ADMIN === 'true';
}

/**
 * Get admin configuration settings
 */
export function getAdminConfig() {
  return {
    enabled: isAdminEnabled(),
    requiresAuthCode: import.meta.env.VITE_ADMIN_REQUIRES_AUTH_CODE !== 'false', // Default to true
    maxLoginAttempts: parseInt(import.meta.env.VITE_ADMIN_MAX_LOGIN_ATTEMPTS) || 5,
    sessionTimeout: parseInt(import.meta.env.VITE_ADMIN_SESSION_TIMEOUT) || 3600000, // 1 hour in ms
  };
}

/**
 * Admin feature flags
 */
export const adminFeatures = {
  userManagement: import.meta.env.VITE_ADMIN_FEATURE_USER_MANAGEMENT !== 'false',
  systemAnalytics: import.meta.env.VITE_ADMIN_FEATURE_ANALYTICS !== 'false',
  dataExport: import.meta.env.VITE_ADMIN_FEATURE_DATA_EXPORT !== 'false',
  systemLogs: import.meta.env.VITE_ADMIN_FEATURE_SYSTEM_LOGS !== 'false',
  configurationManagement: import.meta.env.VITE_ADMIN_FEATURE_CONFIG_MGMT !== 'false',
};

/**
 * Check if a specific admin feature is enabled
 */
export function isAdminFeatureEnabled(featureName) {
  if (!isAdminEnabled()) {
    return false;
  }
  
  return adminFeatures[featureName] ?? false;
}

export default {
  isAdminEnabled,
  getAdminConfig,
  adminFeatures,
  isAdminFeatureEnabled,
};