// Utility functions for form validation

// Regular expressions for validation
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
const HTML_REGEX = /<[^>]*>/g;
const ICON_REGEX = /[\u{1F000}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u;
const SPECIAL_CHARS_REGEX = /[<>'"&%$#@!*()]/;

/**
 * Kiểm tra xem chuỗi có chứa emoji/icon không
 * @param {string} value - Giá trị cần kiểm tra
 * @returns {boolean} - true nếu chứa emoji/icon
 */
export const containsEmoji = (value) => {
  return EMOJI_REGEX.test(value) || ICON_REGEX.test(value);
};

/**
 * Kiểm tra xem chuỗi có chứa HTML tags không
 * @param {string} value - Giá trị cần kiểm tra
 * @returns {boolean} - true nếu chứa HTML
 */
export const containsHTML = (value) => {
  return HTML_REGEX.test(value);
};

/**
 * Kiểm tra xem chuỗi có chứa ký tự đặc biệt nguy hiểm không
 * @param {string} value - Giá trị cần kiểm tra
 * @returns {boolean} - true nếu chứa ký tự nguy hiểm
 */
export const containsDangerousChars = (value) => {
  return SPECIAL_CHARS_REGEX.test(value);
};

/**
 * Validate username - không cho phép emoji, HTML, ký tự đặc biệt
 * @param {string} username - Username cần validate
 * @returns {string|null} - Error message hoặc null nếu hợp lệ
 */
export const validateUsername = (username) => {
  if (!username || !username.trim()) {
    return 'Tên người dùng không được để trống';
  }

  if (username.length < 3) {
    return 'Tên người dùng phải có ít nhất 3 ký tự';
  }

  if (username.length > 30) {
    return 'Tên người dùng không được quá 30 ký tự';
  }

  if (containsEmoji(username)) {
    return 'Tên người dùng không được chứa emoji hoặc icon';
  }

  if (containsHTML(username)) {
    return 'Tên người dùng không được chứa thẻ HTML';
  }

  if (containsDangerousChars(username)) {
    return 'Tên người dùng không được chứa ký tự đặc biệt như <, >, \', ", &, %, $, #, @, !, *, (, )';
  }

  // Chỉ cho phép chữ cái, số, dấu gạch dưới và dấu chấm
  const validUsernameRegex = /^[a-zA-Z0-9._]+$/;
  if (!validUsernameRegex.test(username)) {
    return 'Tên người dùng chỉ được chứa chữ cái, số, dấu gạch dưới (_) và dấu chấm (.)';
  }

  return null;
};

/**
 * Validate enterprise name - không cho phép emoji, HTML, ký tự đặc biệt nguy hiểm
 * @param {string} name - Enterprise name cần validate
 * @returns {string|null} - Error message hoặc null nếu hợp lệ
 */
export const validateEnterpriseName = (name) => {
  if (!name || !name.trim()) {
    return 'Tên doanh nghiệp không được để trống';
  }

  if (name.length < 2) {
    return 'Tên doanh nghiệp phải có ít nhất 2 ký tự';
  }

  if (name.length > 100) {
    return 'Tên doanh nghiệp không được quá 100 ký tự';
  }

  if (containsEmoji(name)) {
    return 'Tên doanh nghiệp không được chứa emoji hoặc icon';
  }

  if (containsHTML(name)) {
    return 'Tên doanh nghiệp không được chứa thẻ HTML';
  }

  if (containsDangerousChars(name)) {
    return 'Tên doanh nghiệp không được chứa ký tự đặc biệt như <, >, \', ", &, %, $, #, @, !, *, (, )';
  }

  return null;
};

/**
 * Validate full name - không cho phép emoji, HTML, ký tự đặc biệt nguy hiểm
 * @param {string} fullName - Full name cần validate
 * @returns {string|null} - Error message hoặc null nếu hợp lệ
 */
export const validateFullName = (fullName) => {
  if (!fullName || !fullName.trim()) {
    return 'Họ tên không được để trống';
  }

  if (fullName.length < 2) {
    return 'Họ tên phải có ít nhất 2 ký tự';
  }

  if (fullName.length > 50) {
    return 'Họ tên không được quá 50 ký tự';
  }

  if (containsEmoji(fullName)) {
    return 'Họ tên không được chứa emoji hoặc icon';
  }

  if (containsHTML(fullName)) {
    return 'Họ tên không được chứa thẻ HTML';
  }

  if (containsDangerousChars(fullName)) {
    return 'Họ tên không được chứa ký tự đặc biệt như <, >, \', ", &, %, $, #, @, !, *, (, )';
  }

  // Cho phép chữ cái, số, khoảng trắng và một số ký tự tiếng Việt
  const validNameRegex = /^[a-zA-ZÀ-ỹ0-9\s.]+$/;
  if (!validNameRegex.test(fullName)) {
    return 'Họ tên chỉ được chứa chữ cái, số, khoảng trắng và dấu chấm';
  }

  return null;
};

/**
 * Sanitize input - loại bỏ HTML và ký tự nguy hiểm
 * @param {string} input - Input cần sanitize
 * @returns {string} - Input đã được làm sạch
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  
  return input
    .replace(HTML_REGEX, '') // Loại bỏ HTML tags
    .replace(/[<>'"&%$#@!*()]/g, '') // Loại bỏ ký tự nguy hiểm
    .trim();
};

/**
 * Validate email
 * @param {string} email - Email cần validate
 * @returns {string|null} - Error message hoặc null nếu hợp lệ
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email không được để trống';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email không hợp lệ';
  }

  if (containsHTML(email)) {
    return 'Email không được chứa thẻ HTML';
  }

  return null;
};

/**
 * Validate phone number
 * @param {string} phone - Phone number cần validate
 * @returns {string|null} - Error message hoặc null nếu hợp lệ
 */
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return 'Số điện thoại không được để trống';
  }

  const phoneRegex = /^[0-9]{10,11}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return 'Số điện thoại không hợp lệ (10-11 số)';
  }

  return null;
};

/**
 * Validate password
 * @param {string} password - Password cần validate
 * @returns {string|null} - Error message hoặc null nếu hợp lệ
 */
export const validatePassword = (password) => {
  if (!password) {
    return 'Mật khẩu không được để trống';
  }

  if (password.length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự';
  }

  if (containsHTML(password)) {
    return 'Mật khẩu không được chứa thẻ HTML';
  }

  return null;
}; 