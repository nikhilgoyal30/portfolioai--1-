
import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, name, error, containerClassName = '', className = '', ...props }) => {
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-textPrimary mb-1">
          {label}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        rows={4}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-surface text-textPrimary ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default TextArea;