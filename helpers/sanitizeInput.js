const validator = require('validator');

/**
 * Melakukan sanitasi (escape karakter berbahaya) pada setiap field dalam objek
 * @param {Object} inputObj - objek yang berisi input dari user
 * @returns {Object} - objek yang sudah disanitasi
 */
function sanitizeObject(inputObj) {
  const sanitized = {};
  for (let key in inputObj) {
    if (typeof inputObj[key] === 'string') {
      sanitized[key] = validator.escape(inputObj[key]);
    } else {
      sanitized[key] = inputObj[key]; // biarkan jika bukan string (contoh: file, date, dsb)
    }
  }
  return sanitized;
}

module.exports = sanitizeObject;
