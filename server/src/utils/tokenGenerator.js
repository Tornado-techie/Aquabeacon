const crypto = require('crypto');

/**
 * Generate a secure, URL-safe tracking token
 * @param {number} length - Length of the token in bytes (default: 32)
 * @returns {string} - Hex-encoded tracking token
 */
function generateTrackingToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a secure, user-friendly tracking token
 * @returns {string} - Alphanumeric tracking token (e.g., "AQ2025-ABC123-DEF456")
 */
function generateFriendlyTrackingToken() {
  const currentYear = new Date().getFullYear();
  const randomPart1 = crypto.randomBytes(3).toString('hex').toUpperCase();
  const randomPart2 = crypto.randomBytes(3).toString('hex').toUpperCase();
  
  return `AQ${currentYear}-${randomPart1}-${randomPart2}`;
}

/**
 * Generate complaint ID with retry logic
 * @param {mongoose.Model} ComplaintModel - The Complaint model
 * @param {number} maxRetries - Maximum number of retries (default: 5)
 * @returns {Promise<string>} - Generated complaint ID
 */
async function generateComplaintId(ComplaintModel, maxRetries = 5) {
  const currentYear = new Date().getFullYear();
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Find the highest complaint number for the current year
      const lastComplaint = await ComplaintModel
        .findOne({ 
          complaintId: new RegExp(`^WQ-${currentYear}-`) 
        })
        .sort({ complaintId: -1 })
        .select('complaintId')
        .lean();
      
      let nextNumber = 1;
      if (lastComplaint && lastComplaint.complaintId) {
        const match = lastComplaint.complaintId.match(/WQ-\d{4}-(\d{6})/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      
      // Format: WQ-2025-000001
      const complaintId = `WQ-${currentYear}-${nextNumber.toString().padStart(6, '0')}`;
      
      // Check if this ID already exists (race condition protection)
      const existingComplaint = await ComplaintModel.findOne({ complaintId }).lean();
      if (!existingComplaint) {
        return complaintId;
      }
      
      // If it exists, try again with a slight delay
      await new Promise(resolve => setTimeout(resolve, 10 * attempt));
    } catch (error) {
      console.error(`Attempt ${attempt + 1} to generate complaint ID failed:`, error);
      if (attempt === maxRetries - 1) {
        throw new Error(`Failed to generate unique complaint ID after ${maxRetries} attempts`);
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 50 * attempt));
    }
  }
  
  throw new Error('Failed to generate complaint ID');
}

/**
 * Generate a secure tracking reference that's easy to share
 * @returns {string} - 12-character alphanumeric reference
 */
function generateTrackingReference() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate tracking token format
 * @param {string} token - Token to validate
 * @returns {boolean} - True if valid
 */
function validateTrackingToken(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Check for complaint ID format (WQ-YYYY-XXXXXX)
  if (/^WQ-\d{4}-\d{6}$/.test(token)) {
    return true;
  }
  
  // Check for hex format (64 characters)
  if (/^[a-f0-9]{64}$/i.test(token)) {
    return true;
  }
  
  // Check for friendly format (AQ2025-ABCDEF-123456)
  if (/^AQ\d{4}-[A-F0-9]{6}-[A-F0-9]{6}$/i.test(token)) {
    return true;
  }
  
  // Check for tracking reference (12 alphanumeric)
  if (/^[A-Z0-9]{12}$/.test(token)) {
    return true;
  }
  
  return false;
}

/**
 * Generate all tracking identifiers for a complaint
 * @param {mongoose.Model} ComplaintModel - The Complaint model
 * @returns {Promise<Object>} - Object containing all generated tokens
 */
async function generateComplaintTokens(ComplaintModel) {
  const complaintId = await generateComplaintId(ComplaintModel);
  const trackingToken = generateTrackingToken();
  const friendlyToken = generateFriendlyTrackingToken();
  const trackingReference = generateTrackingReference();
  
  return {
    complaintId,
    trackingToken,
    friendlyToken,
    trackingReference
  };
}

module.exports = {
  generateTrackingToken,
  generateFriendlyTrackingToken,
  generateComplaintId,
  generateTrackingReference,
  validateTrackingToken,
  generateComplaintTokens
};