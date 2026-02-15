import React from 'react'

function FilterPills({ filters, selected, onSelect }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onSelect('')}
        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
          selected === ''
            ? 'bg-transparent border-gray-500 text-gray-300'
            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300'
        }`}
      >
        Reset filters
      </button>
      {filters.map((filter) => {
        const isActive = selected === filter.value
        return (
          <button
            key={filter.value}
            onClick={() => onSelect(isActive ? '' : filter.value)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'bg-red-500 text-white'
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
            }`}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}

export default FilterPills
