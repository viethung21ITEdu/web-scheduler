// Backend validation utilities

// Regular expressions for validation
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
const HTML_REGEX = /<[^>]*>/g;
const ICON_REGEX = /[\u{1F000}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u;
const DANGEROUS_CHARS_REGEX = /[<>'"&%$#@!*()]/;

/**
 * Kiểm tra xem chuỗi có chứa emoji/icon không
 */
const containsEmoji = (value) => {
  return EMOJI_REGEX.test(value) || ICON_REGEX.test(value);
};

/**
 * Kiểm tra xem chuỗi có chứa HTML tags không
 */
const containsHTML = (value) => {
  return HTML_REGEX.test(value);
};

/**
 * Kiểm tra xem chuỗi có chứa ký tự đặc biệt nguy hiểm không
 */
const containsDangerousChars = (value) => {
  return DANGEROUS_CHARS_REGEX.test(value);
};

/**
 * Validate username
 */
const validateUsername = (username) => {
  if (!username || !username.trim()) {
    return { isValid: false, message: 'Tên người dùng không được để trống' };
  }

  if (username.length < 3 || username.length > 30) {
    return { isValid: false, message: 'Tên người dùng phải có từ 3-30 ký tự' };
  }

  if (containsEmoji(username)) {
    return { isValid: false, message: 'Tên người dùng không được chứa emoji hoặc icon' };
  }

  if (containsHTML(username)) {
    return { isValid: false, message: 'Tên người dùng không được chứa thẻ HTML' };
  }

  if (containsDangerousChars(username)) {
    return { isValid: false, message: 'Tên người dùng không được chứa ký tự đặc biệt nguy hiểm' };
  }

  // Chỉ cho phép chữ cái, số, dấu gạch dưới và dấu chấm
  const validUsernameRegex = /^[a-zA-Z0-9._]+$/;
  if (!validUsernameRegex.test(username)) {
    return { isValid: false, message: 'Tên người dùng chỉ được chứa chữ cái, số, dấu gạch dưới (_) và dấu chấm (.)' };
  }

  return { isValid: true };
};

/**
 * Validate enterprise name
 */
const validateEnterpriseName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, message: 'Tên doanh nghiệp không được để trống' };
  }

  if (name.length < 2 || name.length > 100) {
    return { isValid: false, message: 'Tên doanh nghiệp phải có từ 2-100 ký tự' };
  }

  if (containsEmoji(name)) {
    return { isValid: false, message: 'Tên doanh nghiệp không được chứa emoji hoặc icon' };
  }

  if (containsHTML(name)) {
    return { isValid: false, message: 'Tên doanh nghiệp không được chứa thẻ HTML' };
  }

  if (containsDangerousChars(name)) {
    return { isValid: false, message: 'Tên doanh nghiệp không được chứa ký tự đặc biệt nguy hiểm' };
  }

  return { isValid: true };
};

/**
 * Validate full name
 */
const validateFullName = (fullName) => {
  if (!fullName || !fullName.trim()) {
    return { isValid: false, message: 'Họ tên không được để trống' };
  }

  if (fullName.length < 2 || fullName.length > 50) {
    return { isValid: false, message: 'Họ tên phải có từ 2-50 ký tự' };
  }

  if (containsEmoji(fullName)) {
    return { isValid: false, message: 'Họ tên không được chứa emoji hoặc icon' };
  }

  if (containsHTML(fullName)) {
    return { isValid: false, message: 'Họ tên không được chứa thẻ HTML' };
  }

  if (containsDangerousChars(fullName)) {
    return { isValid: false, message: 'Họ tên không được chứa ký tự đặc biệt nguy hiểm' };
  }

  // Cho phép chữ cái, số, khoảng trắng và ký tự tiếng Việt
  const validNameRegex = /^[a-zA-ZÀ-ỹ0-9\s.]+$/;
  if (!validNameRegex.test(fullName)) {
    return { isValid: false, message: 'Họ tên chỉ được chứa chữ cái, số, khoảng trắng và dấu chấm' };
  }

  return { isValid: true };
};

/**
 * Validate email
 */
const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, message: 'Email không được để trống' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Email không hợp lệ' };
  }

  if (containsHTML(email)) {
    return { isValid: false, message: 'Email không được chứa thẻ HTML' };
  }

  return { isValid: true };
};

/**
 * Sanitize input - loại bỏ HTML và ký tự nguy hiểm
 */
const sanitizeInput = (input) => {
  if (!input) return '';
  
  return input
    .replace(HTML_REGEX, '') // Loại bỏ HTML tags
    .replace(/[<>'"&%$#@!*()]/g, '') // Loại bỏ ký tự nguy hiểm
    .trim();
};

/**
 * Middleware để validate user input
 */
const validateUserInput = (req, res, next) => {
  const { username, full_name, email, enterprise_name } = req.body;
  
  // Validate username
  if (username) {
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return res.status(400).json({ message: usernameValidation.message });
    }
  }
  
  // Validate full_name
  if (full_name) {
    const fullNameValidation = validateFullName(full_name);
    if (!fullNameValidation.isValid) {
      return res.status(400).json({ message: fullNameValidation.message });
    }
  }
  
  // Validate email
  if (email) {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.message });
    }
  }
  
  // Validate enterprise_name
  if (enterprise_name) {
    const enterpriseNameValidation = validateEnterpriseName(enterprise_name);
    if (!enterpriseNameValidation.isValid) {
      return res.status(400).json({ message: enterpriseNameValidation.message });
    }
  }
  
  next();
};

module.exports = {
  validateUsername,
  validateEnterpriseName,
  validateFullName,
  validateEmail,
  sanitizeInput,
  validateUserInput,
  containsEmoji,
  containsHTML,
  containsDangerousChars
}; 