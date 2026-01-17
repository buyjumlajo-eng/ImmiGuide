import React, { useState } from 'react';
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
import { Paywall } from './components/Paywall'; // Import Paywall
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { AuthScreen } from './components/AuthScreen';
import { Loader2 } from 'lucide-react';
import { SubscriptionTier } from './types';

// Updated view router state
export type ViewState = 'dashboard' | 'forms' | 'documents' | 'letters' | 'rfe' | 'strategy' | 'marketplace' | 'translations' | 'admin' | 'caselaw' | 'interview' | 'knowledge';

const InnerApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const { isAuthenticated, isLoading, user } = useAuth();

  // Helper to check if user has access to a specific view
  const hasAccess = (view: ViewState, tier: SubscriptionTier = 'free'): boolean => {
      // Admin always open (in this demo context)
      if (view === 'admin') return true;
      
      // Free items
      if (view === 'dashboard' || view === 'marketplace' || view === 'knowledge') return true;

      // 'One Form' tier adds access to forms
      if (tier === 'one_form') {
          return view === 'forms';
      }

      // Pro tiers have access to everything
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
        return <AttorneyMarketplace />;
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