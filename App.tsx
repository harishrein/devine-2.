import React, { useState } from 'react';
import type { User, Prediction } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import OnboardingForm from './components/OnboardingForm';
import Dashboard from './components/Dashboard';
import ChatWindow from './components/ChatWindow';
import DreamFinder from './components/DreamFinder';
import PartnerMatch from './components/PartnerMatch';
import Footer from './components/Footer';
import { generateAllPredictions, recordUserDataInSheet } from './services/geminiService';

type AppState = 'welcome' | 'onboarding' | 'dashboard' | 'dreamFinder' | 'partnerMatch';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [user, setUser] = useState<User | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = () => setAppState('onboarding');
  const handleDreamFinder = () => setAppState('dreamFinder');
  const handlePartnerMatch = () => setAppState('partnerMatch');
  const handleGoHome = () => setAppState('welcome');

  const handleFormSubmit = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date(),
    };
    setUser(newUser);

    // This is a "fire-and-forget" operation
    recordUserDataInSheet(newUser);
    
    try {
      const preds = await generateAllPredictions(newUser);
      setPredictions(preds);
      setAppState('dashboard');
    } catch (error) {
      console.error("Failed to generate predictions:", error);
      // If fetching fails, show an alert and go back to the welcome screen
      alert("There was an error generating your predictions. Please try again.");
      setAppState('welcome');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChat = () => setIsChatOpen(true);
  const handleCloseChat = () => setIsChatOpen(false);

  const renderContent = () => {
    switch (appState) {
      case 'onboarding':
        return <OnboardingForm onSubmit={handleFormSubmit} isLoading={isLoading} />;
      case 'dashboard':
        if (user && predictions.length > 0) {
          return <Dashboard user={user} predictions={predictions} onOpenChat={handleOpenChat} />;
        }
        // Fallback in case of inconsistent state
        handleGoHome(); 
        return null;
      case 'dreamFinder':
        return <DreamFinder onGoHome={handleGoHome} />;
      case 'partnerMatch':
        return <PartnerMatch onGoHome={handleGoHome} />;
      case 'welcome':
      default:
        return <WelcomeScreen onStart={handleStart} onDreamFinder={handleDreamFinder} onPartnerMatch={handlePartnerMatch} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0c0a1d] to-[#1d1a3d] text-white overflow-x-hidden">
        <div className="stars-bg"></div>
        <main className="relative z-10 flex-grow min-h-screen flex flex-col">
          <div className="flex-grow">
            {renderContent()}
          </div>
          <Footer />
        </main>
        {user && isChatOpen && <ChatWindow user={user} onClose={handleCloseChat} />}
    </div>
  );
};

export default App;
