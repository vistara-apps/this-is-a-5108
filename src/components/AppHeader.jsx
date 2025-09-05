import React from 'react';
import { ArrowLeft, Menu, Shield } from 'lucide-react';

const AppHeader = ({ title = "KnowYourRights AI", showBack = false, onBack, showMenu = true, onMenu }) => {
  return (
    <header className="sticky top-0 z-50 glass-effect px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        <div className="flex items-center space-x-3">
          {showBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-accent" />
            <h1 className="text-lg sm:text-xl font-bold text-gradient truncate">
              {title}
            </h1>
          </div>
        </div>
        
        {showMenu && (
          <button
            onClick={onMenu}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;