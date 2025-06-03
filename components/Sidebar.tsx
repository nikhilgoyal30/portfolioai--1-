
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../constants'; // Corrected import path
import { NavItem } from '../types';

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-surface text-textPrimary flex flex-col shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary">PortfolioAI</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {NAVIGATION_ITEMS.map((item: NavItem) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg hover:bg-primary-light hover:text-white transition-colors duration-200 ease-in-out
               ${isActive ? 'bg-primary text-white shadow-md' : 'text-textSecondary hover:text-textPrimary'}`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-textSecondary text-center">&copy; 2024 PortfolioAI</p>
      </div>
    </div>
  );
};

export default Sidebar;
