import React, { useRef, useCallback } from 'react';

/**
 * FilterPills Component
 * Displays filter options as clickable pill buttons
 * 
 * DEPLOYMENT-CONFIG-002 FIXED: Added proper ARIA tablist accessibility
 * - Container has role="tablist" with aria-label
 * - Each button has role="tab" with aria-selected
 * - Keyboard navigation: Arrow keys, Home, End
 */
export default function FilterPills({ 
  filters = [], 
  selected = '', 
  onChange,
  showReset = true 
}) {
  const buttonRefs = useRef([]);

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

  // Keyboard navigation for accessibility
  const handleKeyDown = useCallback((event, index) => {
    const allButtons = showReset 
      ? [...filters.map(f => f.value), 'reset']
      : filters.map(f => f.value);
    const currentIndex = index;
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        newIndex = currentIndex < allButtons.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : allButtons.length - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = allButtons.length - 1;
        break;
      default:
        return;
    }

    buttonRefs.current[newIndex]?.focus();
  }, [filters.length, showReset]);

  return (
    <div 
      role="tablist" 
      aria-label="Filter options"
      className="flex flex-wrap gap-2 items-center"
    >
      {/* Filter Pills - DEPLOYMENT-CONFIG-002: role="tab" with aria-selected */}
      {filters.map((filter, index) => {
        const isSelected = selected === filter.value;
        return (
          <button
            key={filter.value}
            ref={el => buttonRefs.current[index] = el}
            role="tab"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => handleFilterClick(filter.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
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

      {/* Reset Button - DEPLOYMENT-CONFIG-002: role="tab" with aria-selected */}
      {showReset && (
        <button
          ref={el => buttonRefs.current[filters.length] = el}
          role="tab"
          aria-selected={selected === ''}
          tabIndex={selected === '' ? 0 : -1}
          onClick={handleReset}
          onKeyDown={(e) => handleKeyDown(e, filters.length)}
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
