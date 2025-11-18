/**
 * Utility helper functions for the AquaBeacon client application
 */

/**
 * Format date to a readable string
 * @param {Date|string} date - The date to format
 * @param {string} format - Date format (optional)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format) => {
  if (!date) return '';
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  if (format === 'yyyy-MM-dd') {
    return dateObj.toISOString().split('T')[0];
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format currency value
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'KES')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'KES') => {
  if (typeof amount !== 'number') return '';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Truncate text to specified length
 * @param {string} text - The text to truncate
 * @param {number} length - Maximum length
 * @param {string} ellipsis - Custom ellipsis string
 * @returns {string} Truncated text with ellipsis if needed
 */
export const truncateText = (text, length = 100, ellipsis = '...') => {
  if (!text) return text;
  if (text.length <= length) return text;
  return text.substring(0, length) + ellipsis;
};

/**
 * Generate random ID
 * @param {string} prefix - Optional prefix
 * @param {number} length - ID length (default: 9)
 * @returns {string} Random alphanumeric ID
 */
export const generateId = (prefix = null, length = 9) => {
  const id = Math.random().toString(36).substr(2, length);
  return prefix ? `${prefix}_${id}` : id;
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if string is valid email
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(deepClone);
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Format phone number
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') return '';
  
  // Remove all non-digits
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Handle Kenyan numbers
  if (cleaned.startsWith('254')) {
    return `+${cleaned}`;
  }
  
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `+254${cleaned.substring(1)}`;
  }
  
  // Handle international numbers
  if (cleaned.length >= 10) {
    return `+${cleaned}`;
  }
  
  return '';
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} True if password is strong
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeWords = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

// Keep the old isValidEmail for backward compatibility
export const isValidEmail = validateEmail;