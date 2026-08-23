const crypto = require('crypto');

/**
 * Generates unique transaction ID formatted like TD26-A1B2C3
 */
const generateTransactionId = () => {
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  const timestampPart = Date.now().toString(36).slice(-3).toUpperCase();
  return `TD26-${randomHex}${timestampPart}`;
};

module.exports = generateTransactionId;
