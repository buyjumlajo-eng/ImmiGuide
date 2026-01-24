import React from 'react';
import { ViewState } from '../App';
import { 
  LayoutDashboard, 
  FileText, 
  ShieldAlert, 
  Compass, 
  Menu,
  LogOut,
  User,
  Languages,
  ChevronUp,
  Briefcase,
  FolderLock,
  PenTool,
  Globe,
  ShieldCheck,
  Gavel,
  Mic2,
  Lock,
  Zap,
  Crown,
  BookOpen,
  FileSearch,
  BarChart2,
  Database,
  HardDrive
} from 'lucide-react';
import { ChatWidget } from './ChatWidget';
import { useLanguage } from '../contexts/LanguageContext';
import { Language, SubscriptionTier } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = React.useState(false);
  const langMenuRef = React.useRef<HTMLDivElement>(null);
  const { t, language, setLanguage, dir } = useLanguage();
  const { user, logout } = useAuth();

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [langMenuRef]);

  // Helper to determine if an item is locked based on user tier
  const isLocked = (view: ViewState): boolean => {
      if (!user) return true;
      const tier = user.subscriptionTier;
      
      // Free: Dashboard, Marketplace, Knowledge, Risk
      if (view === 'dashboard' || view === 'marketplace' || view === 'knowledge' || view === 'risk') return false;

      // One Form: Adds Forms
      if (tier === 'one_form') {
          return view !== 'forms'; // Everything else locked
      }

      // Pro: Everything open
      if (tier === 'monthly' || tier === 'annual') return false;
      
      // Default (Free): Lock everything else
      return true;
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => {
    const locked = isLocked(view);
    
    return (
        <button
        onClick={() => {
            onViewChange(view);
            setIsMobileMenuOpen(false);
        }}
        className={`flex items-center w-full px-4 py-3 mb-1 text-sm font-medium transition-colors rounded-lg group justify-between ${
            currentView === view
            ? 'bg-blue-50 text-blue-700'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
        >
        <div className="flex items-center">
            <Icon className={`w-5 h-5 ${dir === 'rtl' ? 'ml-3' : 'mr-3'} ${currentView === view ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
            {label}
        </div>
        {locked && <Lock className="w-3 h-3 text-slate-300" />}
        </button>
    );
  };

  const languageLabels: Record<Language, string> = {
      en: 'English',
      es: 'Español',
      zh: '中文',
      ar: 'العربية',
      fr: 'Français',
      pt: 'Português',
      hi: 'हिंदी'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" dir={dir}>
      {/* Sidebar - Desktop */}
      <aside className={`hidden md:flex flex-col w-64 bg-white border-${dir === 'rtl' ? 'l' : 'r'} border-slate-200 fixed h-full z-20 ${dir === 'rtl' ? 'right-0' : 'left-0'}`}>
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">Visa Guide AI</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Beta 1.0</div>
              
              {/* Connection Status Indicator */}
              {supabase ? (
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold border border-green-200" title="Connected to Supabase">
                      <Database className="w-3 h-3" /> Online
                  </div>
              ) : (
                  <div className="flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200" title="Using Local Storage (Demo Mode)">
                      <HardDrive className="w-3 h-3" /> Local
                  </div>
              )}
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            <NavItem view="dashboard" icon={LayoutDashboard} label={t('dashboard')} />
            <NavItem view="analytics" icon={BarChart2} label="Advanced Analytics" />
            <NavItem view="risk" icon={FileSearch} label="Risk Analyzer" />
            <NavItem view="knowledge" icon={BookOpen} label="Knowledge Center" />
            <NavItem view="forms" icon={FileText} label={t('formAssistant')} />
            <NavItem view="caselaw" icon={Gavel} label="Case Law Explorer" />
            <NavItem view="interview" icon={Mic2} label="Interview Sim" />
            <NavItem view="documents" icon={FolderLock} label="Secure Vault" />
            <NavItem view="translations" icon={Globe} label="Translations" />
            <NavItem view="letters" icon={PenTool} label="Letter Builder" />
            <NavItem view="rfe" icon={ShieldAlert} label={t('rfeDecoder')} />
            <NavItem view="strategy" icon={Compass} label={t('strategy')} />
            <NavItem view="marketplace" icon={Briefcase} label={t('marketplace')} />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
            {/* Upgrade CTA */}
            {user?.subscriptionTier === 'free' && (
                <button 
                    onClick={() => onViewChange('strategy')} // Redirects to locked content -> Paywall
                    className="w-full bg-slate-900 text-white p-3 rounded-xl flex items-center justify-center gap-2 mb-2 hover:scale-105 transition-transform shadow-lg shadow-slate-200"
                >
                    <Zap className="w-4 h-4 text-yellow-400 fill-current" />
                    <div className="text-left leading-none">
                        <div className="text-xs font-bold">Upgrade Plan</div>
                        <div className="text-[10px] text-slate-400">Unlock All Features</div>
                    </div>
                </button>
            )}

             <button
                onClick={() => onViewChange('admin')}
                className={`flex items-center w-full px-4 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors ${currentView === 'admin' ? 'bg-indigo-50' : ''}`}
            >
                <ShieldCheck className={`w-4 h-4 ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`} />
                Admin Panel
            </button>

            {/* Language Selector */}
            <div className="relative" ref={langMenuRef}>
                <button 
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    className={`flex items-center w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-transparent ${isLangMenuOpen ? 'bg-slate-50 border-slate-200' : ''}`}
                >
                    <Languages className={`w-4 h-4 ${dir === 'rtl' ? 'ml-3' : 'mr-3'} text-slate-400`} />
                    <span className="flex-1 text-start uppercase font-semibold text-slate-700">{language}</span>
                    <ChevronUp className={`w-4 h-4 text-slate-400 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isLangMenuOpen && (
                    <div className={`absolute bottom-full ${dir === 'rtl' ? 'right-0' : 'left-0'} mb-2 w-full bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in zoom-in-95 duration-200`}>
                        {(Object.keys(languageLabels) as Language[]).map((lang) => (
                            <button
                                key={lang}
                                onClick={() => {
                                    setLanguage(lang);
                                    setIsLangMenuOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-50 flex items-center transition-colors ${language === lang ? 'bg-blue-50/50' : ''}`}
                            >
                                <span className="uppercase font-bold w-8 text-slate-700">{lang}</span>
                                <span className="text-xs text-slate-500">
                                    {languageLabels[lang]}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

          <button className="flex items-center w-full px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
            {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className={`w-5 h-5 rounded-full ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`} />
            ) : (
                <User className={`w-4 h-4 ${dir === 'rtl' ? 'ml-3' : 'mr-3'} text-slate-400`} />
            )}
            {user?.name || t('profile')}
          </button>
          <button 
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            <LogOut className={`w-4 h-4 ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`} />
            {t('signOut')}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-slate-200 z-30 px-4 py-3 flex items-center justify-between">
         <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">Visa Guide AI</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
            <Menu className="w-6 h-6" />
          </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-20 px-4 overflow-y-auto">
           <nav className="space-y-2">
            <NavItem view="dashboard" icon={LayoutDashboard} label={t('dashboard')} />
            <NavItem view="analytics" icon={BarChart2} label="Advanced Analytics" />
            <NavItem view="risk" icon={FileSearch} label="Risk Analyzer" />
            <NavItem view="knowledge" icon={BookOpen} label="Knowledge Center" />
            <NavItem view="forms" icon={FileText} label={t('formAssistant')} />
            <NavItem view="caselaw" icon={Gavel} label="Case Law Explorer" />
            <NavItem view="interview" icon={Mic2} label="Interview Sim" />
            <NavItem view="documents" icon={FolderLock} label="Secure Vault" />
            <NavItem view="translations" icon={Globe} label="Translations" />
            <NavItem view="letters" icon={PenTool} label="Letter Builder" />
            <NavItem view="rfe" icon={ShieldAlert} label={t('rfeDecoder')} />
            <NavItem view="strategy" icon={Compass} label={t('strategy')} />
            <NavItem view="marketplace" icon={Briefcase} label={t('marketplace')} />
            <NavItem view="admin" icon={ShieldCheck} label="Admin Panel" />
          </nav>
          <div className="mt-8 pt-8 border-t border-slate-100 pb-8">
             <div className="flex items-center gap-3 mb-6 p-2 bg-slate-50 rounded-lg">
                {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                    <User className="w-8 h-8 text-slate-400" />
                )}
                <div>
                    <div className="font-bold text-sm text-slate-900">{user?.name}</div>
                    <div className="text-xs text-slate-500">{user?.email}</div>
                </div>
             </div>

             <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Language</label>
             <div className="grid grid-cols-2 gap-2 mb-6">
                 {(Object.keys(languageLabels) as Language[]).map((lang) => (
                    <button
                        key={lang}
                        onClick={() => {
                            setLanguage(lang);
                            setIsMobileMenuOpen(false);
                        }}
                        className={`p-3 rounded-lg border text-sm uppercase font-bold flex items-center justify-center transition-all ${
                            language === lang 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                    >
                        {lang}
                    </button>
                ))}
             </div>

             <button 
                onClick={logout}
                className="w-full py-3 text-red-600 font-bold border border-red-200 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
             >
                 <LogOut className="w-4 h-4" /> {t('signOut')}
             </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 ${dir === 'rtl' ? 'md:mr-64' : 'md:ml-64'} pt-20 md:pt-0 min-h-screen`}>
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Global Support Agent */}
      <ChatWidget onNavigate={onViewChange} />
    </div>
  );
};