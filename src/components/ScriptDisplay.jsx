import React, { useState } from 'react';
import { Volume2, Copy, Check, Globe } from 'lucide-react';
import Button from './Button';

const ScriptDisplay = ({ script, variant = 'default' }) => {
  const [copiedText, setCopiedText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'spanish' ? 'es-ES' : 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const currentScript = script[selectedLanguage];

  return (
    <div className="space-y-4">
      {variant === 'multilingual' && (
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-accent" />
          <div className="flex bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setSelectedLanguage('english')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                selectedLanguage === 'english' ? 'bg-accent text-white' : 'text-white/70'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSelectedLanguage('spanish')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                selectedLanguage === 'spanish' ? 'bg-accent text-white' : 'text-white/70'
              }`}
            >
              Español
            </button>
          </div>
        </div>
      )}

      <div className="card-gradient p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3 text-accent">
          {currentScript.title}
        </h3>
        
        <div className="space-y-3">
          <p className="text-white/90 leading-relaxed whitespace-pre-line">
            {currentScript.script}
          </p>
          
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSpeak(currentScript.script)}
              className="flex items-center space-x-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen</span>
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCopy(currentScript.script)}
              className="flex items-center space-x-2"
            >
              {copiedText === currentScript.script ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>Copy</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptDisplay;