import React, { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { US_STATES } from '../data/states';

const StateSelector = ({ selectedState, onStateChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleStateSelect = (state) => {
    onStateChange(state);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full card-gradient p-4 rounded-lg flex items-center justify-between text-left hover:bg-white/20 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <MapPin className="w-5 h-5 text-accent" />
          <span className="font-medium">
            {selectedState || "Select Your State"}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 card-gradient rounded-lg shadow-modal max-h-60 overflow-y-auto z-50">
          {US_STATES.map((state) => (
            <button
              key={state}
              onClick={() => handleStateSelect(state)}
              className="w-full p-3 text-left hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              {state}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StateSelector;