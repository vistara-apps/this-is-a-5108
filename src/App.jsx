import React, { useState, useEffect } from 'react';
import { Shield, Book, MessageSquare, Video, Share2, MapPin, Star, Settings } from 'lucide-react';

// Components
import AppHeader from './components/AppHeader';
import Card from './components/Card';
import Button from './components/Button';
import StateSelector from './components/StateSelector';
import ScriptDisplay from './components/ScriptDisplay';
import RecordButton from './components/RecordButton';
import ShareButton from './components/ShareButton';

// Data and utilities
import { RIGHTS_DATA, DE_ESCALATION_SCRIPTS } from './data/states';
import { generatePersonalizedScript, generateRightsSummary } from './utils/aiService';
import { useGeolocation } from './hooks/useGeolocation';

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedState, setSelectedState] = useState('');
  const [selectedScript, setSelectedScript] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { location, getCurrentLocation } = useGeolocation();

  // Auto-detect state based on location (simplified)
  useEffect(() => {
    if (location && !selectedState) {
      // In production, use reverse geocoding API
      setSelectedState('California'); // Default for demo
    }
  }, [location, selectedState]);

  const handleGetLocation = () => {
    getCurrentLocation();
  };

  const renderHomeView = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gradient">
          Know Your Rights
        </h2>
        <p className="text-white/70 max-w-md mx-auto">
          Your pocket guide to police interactions. Get instant, state-specific legal guidance and de-escalation tools.
        </p>
      </div>

      {/* State Selection */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-accent" />
          <span>Select Your State</span>
        </h3>
        <StateSelector 
          selectedState={selectedState}
          onStateChange={setSelectedState}
        />
        {!selectedState && (
          <Button
            onClick={handleGetLocation}
            variant="secondary"
            className="w-full mt-3"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Auto-Detect Location
          </Button>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card 
          variant="interactive"
          onClick={() => setCurrentView('rights')}
          className="text-center space-y-3"
        >
          <Book className="w-8 h-8 text-accent mx-auto" />
          <h3 className="font-semibold">Know Your Rights</h3>
          <p className="text-sm text-white/70">
            State-specific legal information
          </p>
        </Card>

        <Card 
          variant="interactive"
          onClick={() => setCurrentView('scripts')}
          className="text-center space-y-3"
        >
          <MessageSquare className="w-8 h-8 text-accent mx-auto" />
          <h3 className="font-semibold">De-escalation Scripts</h3>
          <p className="text-sm text-white/70">
            What to say during interactions
          </p>
        </Card>

        <Card 
          variant="interactive"
          onClick={() => setCurrentView('record')}
          className="text-center space-y-3"
        >
          <Video className="w-8 h-8 text-accent mx-auto" />
          <h3 className="font-semibold">Record Interaction</h3>
          <p className="text-sm text-white/70">
            Document with audio/video
          </p>
        </Card>

        <Card 
          variant="interactive"
          onClick={() => setCurrentView('share')}
          className="text-center space-y-3"
        >
          <Share2 className="w-8 h-8 text-accent mx-auto" />
          <h3 className="font-semibold">Share Summary</h3>
          <p className="text-sm text-white/70">
            Send info to trusted contacts
          </p>
        </Card>
      </div>

      {/* Premium Features */}
      {!isSubscribed && (
        <Card className="border-accent/50">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-accent">Upgrade to Premium</h3>
            </div>
            <p className="text-sm text-white/70">
              Get expanded script library, offline access, and advanced recording features for $5/month.
            </p>
            <Button onClick={() => setIsSubscribed(true)}>
              Start Free Trial
            </Button>
          </div>
        </Card>
      )}
    </div>
  );

  const renderRightsView = () => {
    if (!selectedState) {
      return (
        <div className="text-center space-y-4">
          <p className="text-white/70">Please select your state first to view relevant rights information.</p>
          <Button onClick={() => setCurrentView('home')}>
            Select State
          </Button>
        </div>
      );
    }

    const rightsData = RIGHTS_DATA[selectedState];
    
    return (
      <div className="space-y-6">
        <Card>
          <h2 className="text-xl font-bold text-accent mb-4">
            {rightsData?.title || `${selectedState} Police Interaction Rights`}
          </h2>
          
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="whitespace-pre-line text-white/90 leading-relaxed">
              {rightsData?.content || `
**Your Rights in ${selectedState}:**
• You have the right to remain silent
• You can refuse searches without a warrant
• You have the right to record police interactions
• You can ask "Am I free to leave?"
• You have the right to an attorney

**Important Notes:**
• Laws may vary by local jurisdiction
• Always remain calm and respectful
• Do not physically resist
• Ask for clarification if needed

**For the most current legal information, consult with a local attorney.**
              `}
            </div>
          </div>
          
          {rightsData?.lastUpdated && (
            <p className="text-xs text-white/50 mt-4">
              Last updated: {rightsData.lastUpdated}
            </p>
          )}
        </Card>

        <div className="flex space-x-3">
          <Button onClick={() => setCurrentView('scripts')}>
            View Scripts
          </Button>
          <Button 
            onClick={() => setCurrentView('share')}
            variant="secondary"
          >
            Share Rights
          </Button>
        </div>
      </div>
    );
  };

  const renderScriptsView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-accent mb-2">
          De-escalation Scripts
        </h2>
        <p className="text-white/70 text-sm">
          Pre-written scripts designed to help you communicate effectively during police interactions.
        </p>
      </div>

      <div className="grid gap-4">
        <Card 
          variant="interactive"
          onClick={() => setSelectedScript(DE_ESCALATION_SCRIPTS.traffic_stop)}
        >
          <h3 className="font-semibold mb-2">Traffic Stop</h3>
          <p className="text-sm text-white/70">
            Script for vehicle traffic stops and checkpoints
          </p>
        </Card>

        <Card 
          variant="interactive"
          onClick={() => setSelectedScript(DE_ESCALATION_SCRIPTS.pedestrian_stop)}
        >
          <h3 className="font-semibold mb-2">Pedestrian Stop</h3>
          <p className="text-sm text-white/70">
            Script for stops while walking or in public spaces
          </p>
        </Card>

        {isSubscribed && (
          <>
            <Card variant="interactive">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Home Search</h3>
                  <p className="text-sm text-white/70">
                    Script for home visits and warrant situations
                  </p>
                </div>
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
            </Card>

            <Card variant="interactive">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Custom AI Script</h3>
                  <p className="text-sm text-white/70">
                    Generate personalized scripts for specific situations
                  </p>
                </div>
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
            </Card>
          </>
        )}
      </div>

      {selectedScript && (
        <ScriptDisplay 
          script={selectedScript}
          variant="multilingual"
        />
      )}
    </div>
  );

  const renderRecordView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-accent mb-2">
          Record Interaction
        </h2>
        <p className="text-white/70 text-sm">
          Document your interaction for legal protection and evidence.
        </p>
      </div>

      <Card>
        <RecordButton />
      </Card>

      <Card>
        <h3 className="font-semibold mb-3">Important Recording Notes:</h3>
        <ul className="space-y-2 text-sm text-white/70">
          <li>• Recording police is legal in most public spaces</li>
          <li>• Inform the officer you are recording</li>
          <li>• Keep your distance and don't interfere</li>
          <li>• Save recordings immediately</li>
          <li>• Share with trusted contacts if needed</li>
        </ul>
      </Card>
    </div>
  );

  const renderShareView = () => {
    const generateSummary = async () => {
      return await generateRightsSummary(selectedState, {
        timestamp: new Date().toISOString(),
        location: selectedState
      });
    };

    const [summary, setSummary] = useState('');

    useEffect(() => {
      generateSummary().then(setSummary);
    }, [selectedState]);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-accent mb-2">
            Share Rights Summary
          </h2>
          <p className="text-white/70 text-sm">
            Quickly share important information with trusted contacts.
          </p>
        </div>

        <Card>
          <h3 className="font-semibold mb-3">Generated Summary:</h3>
          <div className="bg-black/20 p-4 rounded-lg text-sm font-mono whitespace-pre-line text-white/90">
            {summary}
          </div>
        </Card>

        <ShareButton 
          content={summary}
          fileName={`rights-summary-${selectedState}-${Date.now()}`}
        />
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'rights':
        return renderRightsView();
      case 'scripts':
        return renderScriptsView();
      case 'record':
        return renderRecordView();
      case 'share':
        return renderShareView();
      default:
        return renderHomeView();
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'rights':
        return 'Know Your Rights';
      case 'scripts':
        return 'De-escalation Scripts';
      case 'record':
        return 'Record Interaction';
      case 'share':
        return 'Share Summary';
      default:
        return 'KnowYourRights AI';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <AppHeader 
        title={getViewTitle()}
        showBack={currentView !== 'home'}
        onBack={() => setCurrentView('home')}
        showMenu={true}
        onMenu={() => setShowMenu(!showMenu)}
      />

      <main className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {renderCurrentView()}
      </main>

      {/* Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowMenu(false)}>
          <div className="absolute top-0 right-0 w-80 max-w-[90vw] h-full card-gradient p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-accent">Menu</h3>
              
              <div className="space-y-2">
                <button 
                  onClick={() => { setCurrentView('home'); setShowMenu(false); }}
                  className="w-full p-3 text-left rounded-lg hover:bg-white/10 transition-colors"
                >
                  Home
                </button>
                <button 
                  onClick={() => { setCurrentView('rights'); setShowMenu(false); }}
                  className="w-full p-3 text-left rounded-lg hover:bg-white/10 transition-colors"
                >
                  Know Your Rights
                </button>
                <button 
                  onClick={() => { setCurrentView('scripts'); setShowMenu(false); }}
                  className="w-full p-3 text-left rounded-lg hover:bg-white/10 transition-colors"
                >
                  De-escalation Scripts
                </button>
                <button 
                  onClick={() => { setCurrentView('record'); setShowMenu(false); }}
                  className="w-full p-3 text-left rounded-lg hover:bg-white/10 transition-colors"
                >
                  Record Interaction
                </button>
                <button 
                  onClick={() => { setCurrentView('share'); setShowMenu(false); }}
                  className="w-full p-3 text-left rounded-lg hover:bg-white/10 transition-colors"
                >
                  Share Summary
                </button>
              </div>

              <hr className="border-white/20" />

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3">
                  <span>Premium Status</span>
                  <span className={`text-sm ${isSubscribed ? 'text-green-400' : 'text-white/70'}`}>
                    {isSubscribed ? 'Active' : 'Free'}
                  </span>
                </div>
                
                {!isSubscribed && (
                  <Button 
                    onClick={() => setIsSubscribed(true)}
                    className="w-full"
                  >
                    Upgrade to Premium
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;