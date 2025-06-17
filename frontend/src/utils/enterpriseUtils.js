// Utility functions for enterprise-related operations

export const getEnterpriseTypeLabel = (type) => {
  const typeMap = {
    'cafe': 'Cafe',
    'restaurant': 'Nhà hàng',
    'library': 'Thư viện',
    'cinema': 'Rạp phim',
    'other': 'Khác'
  };
  return typeMap[type] || type;
};

export const ENTERPRISE_TYPES = [
  { value: 'cafe', label: 'Cafe' },
  { value: 'restaurant', label: 'Nhà hàng' },
  { value: 'library', label: 'Thư viện' },
  { value: 'cinema', label: 'Rạp phim' },
  { value: 'other', label: 'Khác' }
]; 