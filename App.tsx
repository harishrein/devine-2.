import React, { useState } from 'react';
import type { User, Prediction, PredictionCategory } from './types';
import { generateAllPredictions, recordUserDataInSheet } from './services/geminiService';
import WelcomeScreen from './components/WelcomeScreen';
import OnboardingForm from './components/OnboardingForm';
import Dashboard from './components/Dashboard';
import ChatWindow from './components/ChatWindow';
import DreamFinder from './components/DreamFinder';
import PartnerMatch from './components/PartnerMatch';
import Footer from './components/Footer';

type Page = 'welcome' | 'form' | 'dashboard' | 'dreamFinder' | 'partnerMatch';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('welcome');
  const [user, setUser] = useState<User | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleStart = () => setPage('form');
  const handleDreamFinder = () => setPage('dreamFinder');
  const handlePartnerMatch = () => setPage('partnerMatch');
  const handleGoHome = () => setPage('welcome');

  const handleSubmitForm = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date(),
    };
    // In a real app, you would save the user to a database here.
    setUser(newUser);

    // Fire-and-forget request to record user data in Google Sheets
    recordUserDataInSheet(newUser);

    try {
      const generatedPredictions = await generateAllPredictions(newUser);
      setPredictions(generatedPredictions);
      setPage('dashboard');
    } catch (error) {
      console.error("Failed to generate predictions:", error);
      // Handle error state in UI
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderPage = () => {
    switch (page) {
      case 'welcome':
        return <WelcomeScreen onStart={handleStart} onDreamFinder={handleDreamFinder} onPartnerMatch={handlePartnerMatch} />;
      case 'form':
        return <OnboardingForm onSubmit={handleSubmitForm} isLoading={isLoading} />;
      case 'dashboard':
        if (user && predictions.length > 0) {
          return <Dashboard user={user} predictions={predictions} onOpenChat={() => setIsChatOpen(true)} />;
        }
        // Fallback if data is missing
        setPage('form'); 
        return <OnboardingForm onSubmit={handleSubmitForm} isLoading={isLoading} />;
      case 'dreamFinder':
        return <DreamFinder onGoHome={handleGoHome} />;
      case 'partnerMatch':
        return <PartnerMatch onGoHome={handleGoHome} />;
      default:
        return <WelcomeScreen onStart={handleStart} onDreamFinder={handleDreamFinder} onPartnerMatch={handlePartnerMatch} />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-yellow-50 overflow-y-auto relative isolate">
      <div className="stars-bg"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
      <main className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col min-h-screen">
        <div className="flex-grow">
          {renderPage()}
        </div>
        <Footer />
      </main>
      {isChatOpen && user && (
        <ChatWindow user={user} onClose={() => setIsChatOpen(false)} />
      )}
    </div>
  );
};

export default App;
