// Utility functions for group operations

/**
 * Trigger refresh group data across all components
 * @param {string} groupId - ID của nhóm
 * @param {string} action - Loại hành động (add, remove, leave)
 */
export const triggerGroupMemberChange = (groupId, action = 'change') => {
  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('groupMemberChanged', {
    detail: { groupId, action }
  }));
  
  // Also call direct refresh if available
  if (typeof window.refreshGroupData === 'function') {
    window.refreshGroupData();
  }
};

/**
 * Manually refresh group data (for debugging)
 */
export const manualRefreshGroupData = () => {
  if (typeof window.refreshGroupData === 'function') {
    window.refreshGroupData();
  } else {
    console.warn('⚠️ No refresh function available');
  }
};

// Expose to window for debugging
if (typeof window !== 'undefined') {
  window.triggerGroupMemberChange = triggerGroupMemberChange;
  window.manualRefreshGroupData = manualRefreshGroupData;
} 