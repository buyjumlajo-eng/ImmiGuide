import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LegalDocViewer } from './LegalDocViewer';
import { 
  Compass, 
  ShieldCheck, 
  FileText, 
  BrainCircuit, 
  Loader2, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  Star, 
  Zap,
  TrendingUp,
  X,
  Lock,
  Globe,
  Briefcase,
  AlertTriangle,
  ChevronDown,
  MessageSquare,
  FileCheck,
  Search
} from 'lucide-react';

// --- Custom Animations & Styles ---
const AnimationStyles = () => (
  <style>{`
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
      100% { transform: translateY(0px); }
    }
    @keyframes float-delayed {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
      100% { transform: translateY(0px); }
    }
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.05); }
    }
    @keyframes scan {
      0% { top: 0%; opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite 2s; }
    .animate-scan { animation: scan 3s linear infinite; }
    .bg-grid-pattern {
        background-size: 40px 40px;
        background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    }
    .glass-card {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.5);
    }
    .glass-card-dark {
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
  `}</style>
);

// --- Components ---

const LoginModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { login, isLoading } = useAuth();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-white/20">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                    <X className="w-5 h-5" />
                </button>
                <div className="p-10 text-center">
                    <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-200 rotate-3">
                        <Compass className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-3">Welcome to Visa Guide AI</h2>
                    <p className="text-slate-500 mb-10 text-lg">Your AI companion for the American Dream.</p>
                    <button
                        onClick={login}
                        disabled={isLoading}
                        className="w-full bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-slate-800 font-bold py-5 px-6 rounded-2xl transition-all flex items-center justify-center gap-4 group relative overflow-hidden text-lg"
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> : (
                            <>
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                                <span>Continue with Google</span>
                                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all absolute right-6 text-blue-600 translate-x-[-10px] group-hover:translate-x-0" />
                            </>
                        )}
                    </button>
                    <p className="text-xs text-slate-400 mt-6">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
};

const SectionHeader: React.FC<{ title: string; subtitle: string; align?: 'left' | 'center' }> = ({ title, subtitle, align = 'center' }) => (
    <div className={`mb-16 ${align === 'center' ? 'text-center' : 'text-left'} max-w-4xl mx-auto px-6`}>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
            {title}
        </h2>
        <p className="text-xl text-slate-500 leading-relaxed">
            {subtitle}
        </p>
    </div>
);

// --- Main Page ---

export const AuthScreen: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [viewDoc, setViewDoc] = useState<'privacy' | 'terms' | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
      const handleScroll = () => setScrolled(window.scrollY > 50);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-blue-500 selection:text-white">
      <AnimationStyles />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      {viewDoc && <LegalDocViewer docType={viewDoc} onClose={() => setViewDoc(null)} />}

      {/* --- Navigation --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-slate-900/90 backdrop-blur-xl border-b border-white/10 py-4 shadow-lg' : 'bg-transparent py-6'}`}>
          <div className="container mx-auto px-6 lg:px-12 flex justify-between items-center">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Compass className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white tracking-tight">Visa Guide AI</span>
              </div>
              <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                  <a href="#features" className="hover:text-white transition-colors">Platform</a>
                  <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
                  <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              </div>
              <div className="flex items-center gap-4">
                  <button onClick={() => setShowLogin(true)} className="text-white font-semibold hover:text-blue-200 transition-colors hidden sm:block">Sign In</button>
                  <button 
                    onClick={() => setShowLogin(true)}
                    className="bg-white text-blue-900 px-6 py-2.5 rounded-full font-bold transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] shadow-lg"
                  >
                      Get Started
                  </button>
              </div>
          </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-slate-900">
          <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
          {/* Animated Blobs */}
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-float"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-float-delayed"></div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-300 text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                      <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                      New: 2025 Forms & Fee Updates Included
                  </div>
                  
                  <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-8 tracking-tight">
                      The American Dream, <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                          Decoded.
                      </span>
                  </h1>
                  
                  <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                      Navigate complex immigration laws with the world's most advanced AI. 
                      Auto-fill forms, decode RFEs, and predict your approval odds instantly.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                      <button 
                        onClick={() => setShowLogin(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] hover:-translate-y-1 flex items-center justify-center gap-3"
                      >
                          Start Your Application <ArrowRight className="w-5 h-5" />
                      </button>
                      <button className="px-8 py-4 rounded-2xl text-lg font-bold text-white border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-3">
                          <Play className="w-5 h-5 fill-white" /> Watch Demo
                      </button>
                  </div>

                  <div className="mt-12 flex items-center justify-center lg:justify-start gap-6 text-slate-400">
                      <div className="flex -space-x-4">
                          {[1,2,3,4].map(i => (
                              <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden">
                                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                              </div>
                          ))}
                      </div>
                      <div className="text-left">
                          <div className="flex items-center gap-1 text-yellow-400">
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                          </div>
                          <p className="text-sm font-medium text-slate-300">Used by 10,000+ applicants</p>
                      </div>
                  </div>
              </div>

              {/* --- Hero Visual: The "App" --- */}
              <div className="relative hidden lg:block animate-float">
                  <div className="glass-card-dark rounded-3xl p-6 shadow-2xl transform rotate-[-2deg] border border-white/10">
                      {/* Fake Header */}
                      <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                          <div className="flex gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                          </div>
                          <div className="ml-auto px-3 py-1 bg-blue-500/20 rounded text-xs text-blue-300 font-mono">
                              Case Analysis: Approved
                          </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-4">
                          <div className="flex gap-4 items-start">
                              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                                  <BrainCircuit className="w-6 h-6 text-white" />
                              </div>
                              <div className="bg-slate-800/80 p-4 rounded-xl rounded-tl-none border border-white/5 text-sm text-slate-300">
                                  <p>I've analyzed your I-130 petition. Everything looks good, but the "Joint Residence" dates have a 2-day gap.</p>
                              </div>
                          </div>
                          <div className="flex gap-4 items-center justify-end">
                              <div className="bg-blue-600 p-3 rounded-xl rounded-tr-none text-sm text-white">
                                  How do I fix that?
                              </div>
                              <div className="w-8 h-8 rounded-full bg-slate-500 overflow-hidden">
                                  <img src="https://i.pravatar.cc/100?img=12" alt="User" />
                              </div>
                          </div>
                          <div className="flex gap-4 items-start">
                              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                                  <BrainCircuit className="w-6 h-6 text-white" />
                              </div>
                              <div className="bg-slate-800/80 p-4 rounded-xl rounded-tl-none border border-white/5 text-sm text-slate-300">
                                  <p>I can draft an addendum letter to explain the lease transition. Would you like me to do that?</p>
                                  <div className="mt-3 flex gap-2">
                                      <button className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-xs font-bold border border-green-500/30">Generate Letter</button>
                                      <button className="bg-white/10 text-white px-3 py-1 rounded text-xs font-bold">Ignore Warning</button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Floating Notification */}
                  <div className="absolute -right-8 top-1/2 bg-white text-slate-900 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-float-delayed z-20">
                      <div className="bg-green-100 p-2 rounded-lg">
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                          <p className="text-xs text-slate-500 font-bold uppercase">Success Odds</p>
                          <p className="text-lg font-bold">96% - High</p>
                      </div>
                  </div>
              </div>
          </div>
      </header>

      {/* --- Problem Statement --- */}
      <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-6 text-center max-w-4xl">
              <span className="text-red-500 font-bold tracking-widest uppercase text-sm mb-2 block">The Reality</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">
                  One mistake can cost you <span className="text-red-600">months</span> of delay.
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                  <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                      <AlertTriangle className="w-10 h-10 text-orange-500 mx-auto mb-4" />
                      <h3 className="font-bold text-lg mb-2">Complex Forms</h3>
                      <p className="text-slate-500 text-sm">USCIS forms are confusing, redundant, and change frequently.</p>
                  </div>
                  <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                      <FileText className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                      <h3 className="font-bold text-lg mb-2">Hidden Requirements</h3>
                      <p className="text-slate-500 text-sm">Instructions are hundreds of pages long. It's easy to miss a checkbox.</p>
                  </div>
                  <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                      <ShieldCheck className="w-10 h-10 text-red-500 mx-auto mb-4" />
                      <h3 className="font-bold text-lg mb-2">High Legal Fees</h3>
                      <p className="text-slate-500 text-sm">Lawyers charge $3,000+ just to fill out the same paperwork.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* --- Feature 1: Smart Forms --- */}
      <section id="features" className="py-32 bg-white overflow-hidden">
          <div className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-20 items-center">
              <div className="order-2 lg:order-1 relative">
                  {/* Visual Mockup */}
                  <div className="relative bg-slate-50 rounded-3xl border border-slate-200 p-8 shadow-2xl z-10">
                      <div className="space-y-6">
                          <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Beneficiary Address</label>
                              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-green-500/50 shadow-sm">
                                  <FileText className="text-slate-400 w-5 h-5" />
                                  <span className="text-slate-900 font-medium">123 Maple Street, New York, NY</span>
                                  <CheckCircle2 className="w-6 h-6 text-green-500 ml-auto" />
                              </div>
                              <div className="flex items-center gap-2 mt-2 text-green-600 text-xs font-bold animate-pulse">
                                  <BrainCircuit className="w-4 h-4" /> AI Verified: No gaps in 5-year history
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Criminal History</label>
                              <div className="p-4 bg-red-50 rounded-xl border-2 border-red-100 flex gap-4">
                                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold">!</div>
                                  <div>
                                      <span className="text-slate-900 font-bold block text-sm">Traffic Violation (2019)</span>
                                      <span className="text-slate-500 text-xs">AI Insight: You must disclose this, even if minor. Failure to disclose is visa fraud.</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                      {/* Floating Tooltip */}
                      <div className="absolute -right-12 top-10 bg-slate-900 text-white p-4 rounded-xl shadow-2xl w-64 animate-float">
                          <div className="flex gap-2 mb-2">
                              <Search className="w-4 h-4 text-blue-400" />
                              <span className="font-bold text-xs">Real-time Legal Check</span>
                          </div>
                          <p className="text-xs text-slate-300">Cross-referencing answer with 8 CFR § 316.10...</p>
                      </div>
                  </div>
                  {/* Blob */}
                  <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
              </div>
              
              <div className="order-1 lg:order-2">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                      <FileText className="w-7 h-7" />
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Smart Forms that <br/> <span className="text-blue-600">Think Like Lawyers</span>.</h2>
                  <p className="text-lg text-slate-600 leading-relaxed mb-8">
                      Stop guessing. Our AI guides you field-by-field, translating legalese into plain English and validating your answers against USCIS rules in real-time.
                  </p>
                  <ul className="space-y-4">
                      {["Instant Error Detection", "Auto-Generate Addendums", "Multi-Language Support"].map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-lg font-medium text-slate-700">
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                              {item}
                          </li>
                      ))}
                  </ul>
              </div>
          </div>
      </section>

      {/* --- Feature 2: RFE Decoder --- */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600 rounded-full mix-blend-multiply filter blur-[150px] opacity-20"></div>
          
          <div className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-20 items-center relative z-10">
              <div>
                  <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 border border-indigo-500/30">
                      <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">Scary Letter? <br/> <span className="text-indigo-400">Consider it Handled.</span></h2>
                  <p className="text-lg text-slate-400 leading-relaxed mb-8">
                      Receiving a "Request for Evidence" (RFE) is stressful. Upload a photo of the letter, and our AI will decode it, explain what they want, and draft the legal response for you.
                  </p>
                  <button onClick={() => setShowLogin(true)} className="text-white font-bold text-lg flex items-center gap-2 hover:gap-4 transition-all">
                      Try RFE Decoder <ArrowRight className="w-5 h-5 text-indigo-400" />
                  </button>
              </div>

              <div className="relative">
                  {/* Scanner Visual */}
                  <div className="relative z-10 bg-slate-800 rounded-3xl p-3 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 border border-slate-700">
                      <div className="bg-slate-900 rounded-2xl overflow-hidden relative h-[400px] flex flex-col">
                          <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_20px_#22c55e] z-20 animate-scan"></div>
                          
                          {/* Document Content */}
                          <div className="p-8 opacity-60 blur-[1px] space-y-4">
                              <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                              <div className="h-4 bg-slate-700 rounded w-full"></div>
                              <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                              <div className="h-32 bg-slate-700 rounded w-full mt-8"></div>
                          </div>
                          
                          {/* Overlay Result */}
                          <div className="absolute bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-xl p-6 border-t border-slate-700 animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-500">
                              <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-white text-sm">Analysis Complete</h4>
                                      <p className="text-xs text-slate-400 mt-1">USCIS is asking for "Proof of Joint Assets".</p>
                                      <button className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors">
                                          Draft Response Letter
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* --- Feature 3: Risk Analyzer --- */}
      <section className="py-32 bg-white">
          <div className="container mx-auto px-6 lg:px-12 text-center">
              <SectionHeader 
                title="Know Your Odds Before You File" 
                subtitle="Don't waste money on a denied application. Our Risk Analyzer scans your case facts for red flags like income gaps, criminal history, or status violations." 
              />

              <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 mt-16">
                  {/* Card 1: Low Risk */}
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1">
                      <div className="w-20 h-20 mx-auto rounded-full border-8 border-slate-50 flex items-center justify-center mb-6 relative">
                          <div className="absolute inset-0 rounded-full border-8 border-green-500 border-t-transparent -rotate-45"></div>
                          <span className="font-bold text-2xl text-slate-900">92%</span>
                      </div>
                      <h3 className="font-bold text-lg mb-2">High Approval Odds</h3>
                      <p className="text-sm text-slate-500">Standard case. Documentation is key.</p>
                  </div>

                  {/* Card 2: Flags */}
                  <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl scale-110 z-10 relative">
                      <div className="absolute -top-4 -right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce">
                          3 Issues Found
                      </div>
                      <AlertTriangle className="w-12 h-12 mx-auto mb-6 text-yellow-400" />
                      <h3 className="font-bold text-lg mb-2">Risk Detection</h3>
                      <ul className="text-left text-sm space-y-3 mt-4 text-slate-300">
                          <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-500" /> Income below 125% Poverty Line</li>
                          <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-500" /> Gap in physical address history</li>
                      </ul>
                      <button className="mt-6 w-full py-2 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-200">
                          View Fixes
                      </button>
                  </div>

                  {/* Card 3: Action Plan */}
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1">
                      <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-600">
                          <TrendingUp className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Action Plan</h3>
                      <p className="text-sm text-slate-500">Step-by-step guide to mitigate your risks and strengthen your petition.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* --- Bento Grid (Secondary Features) --- */}
      <section id="solutions" className="py-24 bg-slate-50">
          <div className="container mx-auto px-6 lg:px-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Everything else you need</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
                  {/* Large Card: Marketplace */}
                  <div className="md:col-span-2 row-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                      <div className="relative z-10">
                          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                              <Briefcase className="w-6 h-6" />
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900 mb-2">Attorney Marketplace</h3>
                          <p className="text-slate-500 mb-6 max-w-md">
                              Sometimes you just need a human. Connect with vetted, top-rated immigration lawyers for a 15-minute consultation or full representation.
                          </p>
                          <div className="flex gap-4">
                              <div className="flex -space-x-3">
                                  {[1,2,3].map(i => (
                                      <img key={i} src={`https://i.pravatar.cc/100?img=${i+20}`} className="w-10 h-10 rounded-full border-2 border-white" alt="Attorney" />
                                  ))}
                              </div>
                              <div className="text-sm self-center font-bold text-slate-700">
                                  50+ Verified Experts Available
                              </div>
                          </div>
                      </div>
                      <div className="absolute right-0 bottom-0 w-64 h-64 bg-purple-50 rounded-full translate-x-1/3 translate-y-1/3 group-hover:scale-110 transition-transform"></div>
                  </div>

                  {/* Card: Translations */}
                  <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden group">
                      <div className="relative z-10">
                          <Globe className="w-8 h-8 mb-4 text-blue-200" />
                          <h3 className="text-xl font-bold mb-1">Translations</h3>
                          <p className="text-blue-100 text-sm">Certified & AI translations for birth certificates, affidavits, and more.</p>
                      </div>
                      <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                  </div>

                  {/* Card: Document Vault */}
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                      <Lock className="w-8 h-8 mb-4 text-green-500" />
                      <h3 className="text-xl font-bold text-slate-900 mb-1">Secure Vault</h3>
                      <p className="text-slate-500 text-sm">Bank-level encryption for your sensitive documents. Local-first privacy.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* --- How It Works --- */}
      <section className="py-24 bg-white border-t border-slate-100">
          <div className="container mx-auto px-6 lg:px-12">
              <SectionHeader title="Your Journey to Approval" subtitle="We've mapped out the entire process so you never feel lost." />
              
              <div className="grid md:grid-cols-4 gap-8 relative">
                  {[
                      { icon: BrainCircuit, title: "1. Check Eligibility", desc: "Use our Risk Analyzer to spot issues early." },
                      { icon: FileText, title: "2. Auto-Fill Forms", desc: "Answer simple questions, we generate the PDF." },
                      { icon: ShieldCheck, title: "3. Review & File", desc: "Our AI checks for errors before you print." },
                      { icon: CheckCircle2, title: "4. Track Status", desc: "Get real-time updates and interview prep." }
                  ].map((step, idx) => (
                      <div key={idx} className="relative z-10">
                          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-blue-200 transition-colors h-full">
                              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-blue-600 font-bold text-xl">
                                  {step.icon ? <step.icon className="w-6 h-6" /> : idx + 1}
                              </div>
                              <h3 className="font-bold text-lg text-slate-900 mb-2">{step.title}</h3>
                              <p className="text-slate-500 text-sm">{step.desc}</p>
                          </div>
                          {idx < 3 && (
                              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-slate-200 z-0 transform -translate-y-1/2"></div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* --- Pricing --- */}
      <section id="pricing" className="py-32 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="container mx-auto px-6 lg:px-12 relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-20">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, transparent pricing.</h2>
                  <p className="text-xl text-slate-400">Immigration lawyers cost $300/hour. Visa Guide AI costs less than a nice dinner.</p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {/* Free Tier */}
                  <div className="bg-slate-800/50 rounded-3xl p-10 border border-slate-700 hover:border-slate-600 transition-all flex flex-col">
                      <div className="mb-8">
                          <h3 className="text-xl font-bold text-white mb-2">Explorer</h3>
                          <div className="text-4xl font-bold text-white mb-2">$0</div>
                          <p className="text-slate-400">Forever free resources to get you started.</p>
                      </div>
                      <ul className="space-y-4 mb-10 flex-1 text-sm">
                          {["Official Form Downloads", "Case Timeline Tracker", "Basic Risk Assessment", "Community Forum"].map((item, i) => (
                              <li key={i} className="flex items-center gap-3 text-slate-300">
                                  <CheckCircle2 className="w-5 h-5 text-slate-500" /> {item}
                              </li>
                          ))}
                      </ul>
                      <button onClick={() => setShowLogin(true)} className="w-full py-4 rounded-xl font-bold border border-slate-600 text-white hover:bg-slate-700 transition-all">
                          Start Free
                      </button>
                  </div>

                  {/* Pro Tier - Featured */}
                  <div className="bg-blue-600 rounded-3xl p-10 shadow-2xl relative transform lg:-translate-y-6 flex flex-col border border-blue-500">
                      <div className="absolute top-0 right-0 bg-white text-blue-600 text-xs font-bold px-4 py-2 rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">
                          Most Popular
                      </div>
                      <div className="mb-8">
                          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                              Pro <Star className="w-4 h-4 text-yellow-300 fill-current" />
                          </h3>
                          <div className="text-5xl font-bold text-white mb-2">$29<span className="text-lg text-blue-200 font-normal">/mo</span></div>
                          <p className="text-blue-100">Everything needed to file with confidence.</p>
                      </div>
                      <ul className="space-y-4 mb-10 flex-1 text-sm font-medium">
                          {[
                              "AI Form Auto-Fill & Validation", 
                              "Unlimited RFE Decoding", 
                              "Priority Strategy Chat", 
                              "Interview Simulator",
                              "10GB Secure Document Vault"
                          ].map((item, i) => (
                              <li key={i} className="flex items-center gap-3 text-white">
                                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                      <CheckCircle2 className="w-4 h-4 text-white" />
                                  </div>
                                  {item}
                              </li>
                          ))}
                      </ul>
                      <button onClick={() => setShowLogin(true)} className="w-full py-4 rounded-xl font-bold bg-white text-blue-600 hover:bg-blue-50 transition-all shadow-lg">
                          Get Started
                      </button>
                  </div>

                  {/* Attorney Tier */}
                  <div className="bg-white rounded-3xl p-10 border border-slate-200 text-slate-900 transition-all flex flex-col">
                      <div className="mb-8">
                          <h3 className="text-xl font-bold text-slate-900 mb-2">Review</h3>
                          <div className="text-4xl font-bold text-slate-900 mb-2">$249</div>
                          <p className="text-slate-500">One-time expert review before you file.</p>
                      </div>
                      <ul className="space-y-4 mb-10 flex-1 text-sm">
                          {[
                              "Includes 1 Month of Pro",
                              "Attorney Document Review",
                              "30-min Video Consultation",
                              "Final Filing Packet Check",
                              "Peace of Mind Guarantee"
                          ].map((item, i) => (
                              <li key={i} className="flex items-center gap-3 text-slate-700">
                                  <CheckCircle2 className="w-5 h-5 text-green-500" /> {item}
                              </li>
                          ))}
                      </ul>
                      <button onClick={() => setShowLogin(true)} className="w-full py-4 rounded-xl font-bold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-all">
                          Book Review
                      </button>
                  </div>
              </div>
          </div>
      </section>

      {/* --- FAQ Section --- */}
      <section className="py-24 bg-white">
          <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
              <SectionHeader title="Frequently Asked Questions" subtitle="Got questions? We've got answers." />
              
              <div className="space-y-4">
                  {[
                      { q: "Is Visa Guide AI a law firm?", a: "No. We are a technology company that uses AI to provide self-help services. We do not provide legal advice or attorney-client privilege. For complex cases, we recommend using our Attorney Marketplace." },
                      { q: "Is my data safe?", a: "Yes. We use bank-level AES-256 encryption. Your documents are stored locally on your device where possible, and only transmitted securely for AI processing." },
                      { q: "Can I cancel my subscription?", a: "Absolutely. You can cancel your monthly subscription at any time from your dashboard settings." },
                      { q: "Does USCIS accept these forms?", a: "Yes. Our AI generates forms on the latest official USCIS templates. However, you must print, sign, and mail them yourself (unless filing online)." }
                  ].map((item, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden">
                          <button 
                            onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                          >
                              <span className="font-bold text-slate-900">{item.q}</span>
                              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                          </button>
                          {activeFaq === i && (
                              <div className="p-6 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50">
                                  {item.a}
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-slate-900 text-slate-400 pt-20 pb-10 border-t border-white/10">
          <div className="container mx-auto px-6 lg:px-12">
              <div className="grid md:grid-cols-4 gap-12 mb-16">
                  <div className="col-span-2">
                      <div className="flex items-center gap-2 text-white mb-6">
                          <Compass className="w-8 h-8 text-blue-500" />
                          <span className="text-2xl font-bold">Visa Guide AI</span>
                      </div>
                      <p className="text-lg leading-relaxed max-w-sm mb-6">
                          Democratizing legal access with Artificial Intelligence. 
                          We believe the American Dream should be accessible to everyone, regardless of budget.
                      </p>
                      <a href="mailto:mail@visaguideai.com" className="text-white hover:text-blue-400 font-bold border-b border-blue-500/30 hover:border-blue-400 pb-0.5 transition-colors">
                          mail@visaguideai.com
                      </a>
                  </div>
                  <div>
                      <h4 className="text-white font-bold mb-6">Platform</h4>
                      <ul className="space-y-4">
                          <li><a href="#" className="hover:text-white transition-colors">Smart Forms</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">RFE Decoder</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Attorney Network</a></li>
                      </ul>
                  </div>
                  <div>
                      <h4 className="text-white font-bold mb-6">Legal</h4>
                      <ul className="space-y-4">
                          <li><button onClick={() => setViewDoc('privacy')} className="hover:text-white transition-colors text-left">Privacy Policy</button></li>
                          <li><button onClick={() => setViewDoc('terms')} className="hover:text-white transition-colors text-left">Terms of Service</button></li>
                          <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Disclaimer</a></li>
                      </ul>
                  </div>
              </div>
              <div className="pt-8 border-t border-white/5 text-center text-sm flex flex-col md:flex-row justify-between items-center gap-4">
                  <p>&copy; 2024 Visa Guide AI. Not a law firm. Not affiliated with USCIS.</p>
                  <div className="flex gap-4">
                      {/* Social icons could go here */}
                  </div>
              </div>
          </div>
      </footer>
    </div>
  );
};