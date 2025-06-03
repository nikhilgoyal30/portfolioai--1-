
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '', titleClassName = '', bodyClassName = '' }) => {
  return (
    <div className={`bg-surface rounded-lg shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className={`p-4 border-b border-gray-200 ${titleClassName}`}>
          <h3 className="text-lg font-semibold text-textPrimary">{title}</h3>
        </div>
      )}
      <div className={`p-4 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
