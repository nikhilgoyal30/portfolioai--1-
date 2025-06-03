
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out">
      <div className={`bg-surface rounded-lg shadow-xl p-6 w-full ${sizeClasses[size]} transform transition-all duration-300 ease-in-out scale-95 animate-modal-appear`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-textPrimary">{title}</h3>
          <button
            onClick={onClose}
            className="text-textSecondary hover:text-textPrimary transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div>{children}</div>
      </div>
      <style>{`
        @keyframes modal-appear {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-modal-appear { animation: modal-appear 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Modal;
