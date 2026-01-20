import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { FormAssistant } from './components/FormAssistant';
import { RFEDecoder } from './components/RFEDecoder';
import { StrategyAdvisor } from './components/StrategyAdvisor';
import { AttorneyMarketplace } from './components/AttorneyMarketplace';
import { DocumentVault } from './components/DocumentVault';
import { LetterGenerator } from './components/LetterGenerator';
import { TranslationCenter } from './components/TranslationCenter';
import { AdminPanel } from './components/AdminPanel';
import { CaseLawExplorer } from './components/CaseLawExplorer';
import { InterviewSimulator } from './components/InterviewSimulator';
import { KnowledgeCenter } from './components/KnowledgeCenter';
import { AttorneyOnboarding } from './components/AttorneyOnboarding'; 
import { RiskAnalyzer } from './components/RiskAnalyzer';
import { Paywall } from './components/Paywall'; 
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { AuthScreen } from './components/AuthScreen';
import { LegalModal } from './components/LegalModal';
import { Loader2 } from 'lucide-react';
import { SubscriptionTier } from './types';

// Updated view router state
export type ViewState = 'dashboard' | 'forms' | 'documents' | 'letters' | 'rfe' | 'strategy' | 'marketplace' | 'translations' | 'admin' | 'caselaw' | 'interview' | 'knowledge' | 'attorney-signup' | 'risk';

const InnerApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [showLegal, setShowLegal] = useState(false);
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
      // Check if user has accepted terms
      const accepted = localStorage.getItem('immi_tos_accepted');
      if (!accepted) {
          setShowLegal(true);
      }
  }, []);

  const handleAcceptTerms = () => {
      localStorage.setItem('immi_tos_accepted', 'true');
      setShowLegal(false);
  };

  // Helper to check if user has access to a specific view
  const hasAccess = (view: ViewState, tier: SubscriptionTier = 'free'): boolean => {
      if (view === 'admin') return true;
      if (view === 'attorney-signup') return true; 
      
      if (view === 'dashboard' || view === 'marketplace' || view === 'knowledge' || view === 'risk') return true;

      if (tier === 'one_form') {
          return view === 'forms';
      }

      if (tier === 'monthly' || tier === 'annual') {
          return true;
      }

      return false;
  };

  // Show loading spinner while checking auth session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (showLegal) {
      return <LegalModal onAccept={handleAcceptTerms} />;
  }

  // Show Login Screen if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Show Main App if authenticated
  const renderView = () => {
    // Check permissions
    if (!hasAccess(currentView, user?.subscriptionTier)) {
        return <Paywall />;
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} />;
      case 'forms':
        return <FormAssistant />;
      case 'documents':
        return <DocumentVault />;
      case 'letters':
        return <LetterGenerator />;
      case 'rfe':
        return <RFEDecoder onViewChange={setCurrentView} />;
      case 'strategy':
        return <StrategyAdvisor />;
      case 'marketplace':
        return <AttorneyMarketplace onViewChange={setCurrentView} />;
      case 'translations':
        return <TranslationCenter />;
      case 'admin':
        return <AdminPanel />;
      case 'caselaw':
        return <CaseLawExplorer />;
      case 'interview':
        return <InterviewSimulator />;
      case 'knowledge':
        return <KnowledgeCenter />;
      case 'risk':
        return <RiskAnalyzer />;
      case 'attorney-signup':
        return <AttorneyOnboarding onViewChange={setCurrentView} />;
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <LanguageProvider>
          <InnerApp />
        </LanguageProvider>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
