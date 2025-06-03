
import React from 'react';
import { useLocation } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../constants'; // Corrected import path

const Header: React.FC = () => {
  const location = useLocation();
  const currentNavItem = NAVIGATION_ITEMS.find(item => item.path === location.pathname);
  const pageTitle = currentNavItem ? currentNavItem.name : "PortfolioAI";

  return (
    <header className="bg-surface shadow-sm p-4 border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center">
        <h2 className="text-xl font-semibold text-textPrimary">{pageTitle}</h2>
        {/* Placeholder for user profile/actions */}
        <div>
          {/* Example: <UserCircleIcon className="w-8 h-8 text-gray-500" /> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
