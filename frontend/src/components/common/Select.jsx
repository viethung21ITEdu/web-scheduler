import React, { useState } from 'react';

/**
 * Reusable component to display and select items from a list
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of items to display
 * @param {function} props.renderItem - Function to render each item
 * @param {function} props.onItemSelect - Function called when an item is selected
 * @param {function} props.getItemKey - Function to get a unique key for each item
 * @param {boolean} props.multiSelect - Whether multiple items can be selected
 * @param {Array} props.selectedItems - Array of selected items (for controlled component)
 * @param {string} props.emptyMessage - Message to display when no items are available
 * @param {string} props.title - Title text for the select component
 * @param {string} props.selectAllLabel - Label for the "select all" checkbox
 * @param {string} props.className - Additional CSS classes
 */
const Select = ({
  items = [],
  renderItem,
  onItemSelect,
  getItemKey = (item) => item.id,
  multiSelect = false,
  selectedItems = [],
  emptyMessage = 'Không có kết quả nào',
  title = 'Danh sách tìm được',
  selectAllLabel = 'Chọn tất cả',
  className = '',
}) => {
  const [selected, setSelected] = useState(selectedItems);
  const [selectAll, setSelectAll] = useState(false);

  // Handle item selection
  const handleItemSelect = (item) => {
    let newSelected;
    
    if (multiSelect) {
      const itemKey = getItemKey(item);
      const isSelected = selected.some(
        (selectedItem) => getItemKey(selectedItem) === itemKey
      );
      
      if (isSelected) {
        newSelected = selected.filter(
          (selectedItem) => getItemKey(selectedItem) !== itemKey
        );
      } else {
        newSelected = [...selected, item];
      }
      
      setSelected(newSelected);
    } else {
      newSelected = [item];
      setSelected(newSelected);
    }
    
    if (onItemSelect) {
      onItemSelect(multiSelect ? newSelected : item);
    }
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const newSelected = newSelectAll ? [...items] : [];
    setSelected(newSelected);
    
    if (onItemSelect) {
      onItemSelect(newSelected);
    }
  };

  // Check if an item is selected
  const isItemSelected = (item) => {
    const itemKey = getItemKey(item);
    return selected.some((selectedItem) => getItemKey(selectedItem) === itemKey);
  };

  return (
    <div className={`bg-gray-100 rounded-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center px-3 py-1 border-b border-gray-300">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        
        {multiSelect && items.length > 0 && (
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
            <span className="text-sm text-gray-600">{selectAllLabel}</span>
          </label>
        )}
      </div>
      
      {/* Items list */}
      <div className="bg-gray-100 min-h-[200px] overflow-y-auto">
        {items.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <li 
                key={getItemKey(item)}
                className="px-3 py-1 hover:bg-gray-200 transition-colors cursor-pointer"
                onClick={() => handleItemSelect(item)}
              >
                <div className="flex items-center space-x-2">
                  {multiSelect && (
                    <input
                      type="checkbox"
                      checked={isItemSelected(item)}
                      onChange={() => handleItemSelect(item)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                  )}
                  
                  {renderItem ? (
                    renderItem(item, isItemSelected(item))
                  ) : (
                    <span>{JSON.stringify(item)}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-full p-4">
            <p className="text-gray-500 text-center">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Select;