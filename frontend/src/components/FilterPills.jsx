import React from 'react';

/**
 * FilterPills Component
 * Displays filter options as clickable pill buttons
 * 
 * NEW-DEFECT-004 FIXED: Added aria-pressed to all buttons
 * - Each filter button has aria-pressed={selected === filter.value}
 * - Reset button has aria-pressed={selected === ''}
 */
export default function FilterPills({ 
  filters = [], 
  selected = '', 
  onChange,
  showReset = true 
}) {
  const handleFilterClick = (value) => {
    if (onChange) {
      onChange(value === selected ? '' : value);
    }
  };

  const handleReset = () => {
    if (onChange) {
      onChange('');
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Filter Pills - NEW-DEFECT-004: Added aria-pressed */}
      {filters.map((filter) => {
        const isSelected = selected === filter.value;
        return (
          <button
            key={filter.value}
            onClick={() => handleFilterClick(filter.value)}
            aria-pressed={isSelected}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
              ${isSelected 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
              }
            `}
          >
            {filter.label}
            {isSelected && (
              <span className="ml-1" aria-hidden="true">&#10003;</span>
            )}
          </button>
        );
      })}

      {/* Reset Button - NEW-DEFECT-004: Added aria-pressed */}
      {showReset && (
        <button
          onClick={handleReset}
          aria-pressed={selected === ''}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400
            ${selected === ''
              ? 'bg-transparent border border-gray-400 text-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
            }
          `}
        >
          Reset filters
        </button>
      )}
    </div>
  );
}
