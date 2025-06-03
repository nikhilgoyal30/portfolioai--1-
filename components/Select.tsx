
import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  containerClassName?: string;
}

const Select: React.FC<SelectProps> = ({ label, name, error, options, containerClassName = '', className = '', ...props }) => {
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-textPrimary mb-1">
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        className={`w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;
