import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  ChevronRight,
  Lock,
  Globe,
  Users
} from 'lucide-react';

// --- Custom Animations ---
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
    @keyframes drift {
      0% { transform: translateX(0px); }
      50% { transform: translateX(20px); }
      100% { transform: translateX(0px); }
    }
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite 2s; }
    .animate-drift { animation: drift 10s ease-in-out infinite; }
    .animate-blob { animation: blob 10s infinite; }
    .animate-shimmer { animation: shimmer 8s linear infinite; }
    .bg-grid-pattern {
        background-size: 40px 40px;
        background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    }
  `}</style>
);

// --- Login Modal ---
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
                    <h2 className="text-3xl font-bold text-slate-900 mb-3">Welcome to ImmiGuide</h2>
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
                </div>
            </div>
        </div>
    );
};

// --- Landing Page ---
export const AuthScreen: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
      const handleScroll = () => setScrolled(window.scrollY > 50);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-900 overflow-x-hidden selection:bg-blue-500 selection:text-white">
      <AnimationStyles />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

      {/* --- Navigation --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-slate-900/90 backdrop-blur-xl border-b border-white/10 py-4 shadow-lg' : 'bg-transparent py-8'}`}>
          <div className="container mx-auto px-6 lg:px-12 flex justify-between items-center">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Compass className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white tracking-tight">ImmiGuide</span>
              </div>
              <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                  <a href="#features" className="hover:text-white transition-colors">Features</a>
                  <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
                  <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              </div>
              <div className="flex items-center gap-4">
                  <button onClick={() => setShowLogin(true)} className="text-white font-semibold hover:text-blue-200 transition-colors hidden sm:block">Sign In</button>
                  <button 
                    onClick={() => setShowLogin(true)}
                    className="bg-white text-blue-900 px-6 py-3 rounded-full font-bold transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  >
                      Get Started
                  </button>
              </div>
          </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="relative min-h-screen flex items-center pt-20 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-slate-900">
              <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
              {/* Blobs */}
              <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
              <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-32 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000"></div>
          </div>

          <div className="container mx-auto px-6 lg:px-12 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-300 text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                      <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                      New: 2025 Forms & Fee Updates
                  </div>
                  
                  <h1 className="text-6xl lg:text-8xl font-bold text-white leading-[1.1] mb-8 tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                      The American Dream, <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-shimmer bg-[length:200%_100%]">
                          Simplified.
                      </span>
                  </h1>
                  
                  <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                      Navigate complex immigration laws with the world's most advanced AI. 
                      Auto-fill forms, decode RFEs, and predict your approval odds instantly.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                      <button 
                        onClick={() => setShowLogin(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl text-xl font-bold transition-all shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] hover:-translate-y-1 flex items-center justify-center gap-3"
                      >
                          Start Free <ArrowRight className="w-6 h-6" />
                      </button>
                      <button className="px-10 py-5 rounded-2xl text-xl font-bold text-white border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-3">
                          <Play className="w-6 h-6 fill-white" /> Demo Video
                      </button>
                  </div>

                  <div className="mt-12 flex items-center justify-center lg:justify-start gap-6 text-slate-400 animate-in fade-in duration-1000 delay-500">
                      <div className="flex -space-x-4">
                          {[1,2,3,4].map(i => (
                              <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden">
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
                          <p className="text-sm font-medium text-slate-300">Trusted by 10,000+ applicants</p>
                      </div>
                  </div>
              </div>

              {/* --- Hero Visual: The "App" --- */}
              <div className="relative hidden lg:block animate-float">
                  {/* Backdrop Glow */}
                  <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full"></div>
                  
                  {/* Main Interface Card */}
                  <div className="relative bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-700">
                      {/* Fake Browser Header */}
                      <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                          <div className="flex gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                          </div>
                          <div className="ml-4 px-4 py-1 bg-black/20 rounded-full text-xs text-slate-400 font-mono flex items-center gap-2">
                              <Lock className="w-3 h-3" /> immiguide.ai/dashboard
                          </div>
                      </div>

                      {/* Dashboard Mockup Content */}
                      <div className="grid grid-cols-2 gap-6">
                          {/* Left Col: Case Status */}
                          <div className="bg-slate-900/50 rounded-2xl p-5 border border-white/5">
                              <div className="flex items-center gap-3 mb-4">
                                  <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                                      <TrendingUp className="w-6 h-6" />
                                  </div>
                                  <div>
                                      <div className="text-xs text-slate-400 uppercase font-bold">Approval Odds</div>
                                      <div className="text-xl font-bold text-white">High (94%)</div>
                                  </div>
                              </div>
                              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500 w-[94%] shadow-[0_0_10px_#22c55e]"></div>
                              </div>
                          </div>

                          {/* Right Col: Next Action */}
                          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
                              <div className="text-xs font-bold text-blue-200 uppercase mb-1">Next Action</div>
                              <div className="font-bold text-lg mb-2">Review Form I-130</div>
                              <div className="flex -space-x-2 mb-3">
                                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border-2 border-transparent">
                                      <CheckCircle2 className="w-5 h-5 text-white" />
                                  </div>
                              </div>
                              <div className="text-xs bg-black/20 inline-block px-2 py-1 rounded">Due in 2 days</div>
                          </div>

                          {/* Bottom: Chat / AI */}
                          <div className="col-span-2 bg-slate-900/50 rounded-2xl p-5 border border-white/5 flex gap-4 items-center">
                              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                                  <BrainCircuit className="w-6 h-6 text-white" />
                              </div>
                              <div className="text-sm text-slate-300">
                                  <span className="text-indigo-400 font-bold">AI Insight:</span> based on current processing times at Potomac Center, your estimated approval is <span className="text-white font-bold underline decoration-indigo-500">March 15, 2025</span>.
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Floating Notification */}
                  <div className="absolute -right-12 top-1/3 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-float-delayed z-20 max-w-[250px]">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                          <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                          <div className="font-bold text-slate-900 text-sm">Form Validated</div>
                          <div className="text-xs text-slate-500">0 errors found in I-130. Ready to export.</div>
                      </div>
                  </div>
              </div>
          </div>
      </header>

      {/* --- Value Proposition Sections (Full Width) --- */}
      
      {/* Feature 1: The Form Assistant */}
      <section id="features" className="py-32 bg-white relative overflow-hidden">
          <div className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-20 items-center">
              <div className="order-2 lg:order-1 relative">
                  {/* Interactive Form Mockup */}
                  <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 p-8 relative z-10">
                      <div className="space-y-6">
                          <div>
                              <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Current Physical Address</label>
                              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border-2 border-green-500/50">
                                  <FileText className="text-slate-400 w-5 h-5" />
                                  <span className="text-slate-900 font-medium">123 Maple Street, New York, NY</span>
                                  <CheckCircle2 className="w-6 h-6 text-green-500 ml-auto" />
                              </div>
                              <div className="flex items-center gap-2 mt-2 text-green-600 text-sm font-bold animate-pulse">
                                  <Zap className="w-4 h-4" /> AI Verified: No gaps in 5-year history
                              </div>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Criminal History</label>
                              <div className="p-4 bg-red-50 rounded-xl border-2 border-red-100 flex gap-4">
                                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold">!</div>
                                  <div>
                                      <span className="text-slate-900 font-bold block">Traffic Violation (2019)</span>
                                      <span className="text-slate-500 text-xs">AI Suggestion: Disclose this event. It is likely harmless but failure to disclose is fraud.</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                      {/* Floating Tooltip */}
                      <div className="absolute -right-8 top-12 bg-slate-900 text-white p-4 rounded-xl shadow-2xl w-64 animate-float">
                          <div className="flex gap-2 mb-2">
                              <BrainCircuit className="w-5 h-5 text-blue-400" />
                              <span className="font-bold text-sm">Real-time Legal Check</span>
                          </div>
                          <p className="text-xs text-slate-300">I'm cross-referencing your answer with 8 CFR § 316.10...</p>
                      </div>
                  </div>
                  {/* Decorative blobs */}
                  <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
              </div>
              
              <div className="order-1 lg:order-2">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-8 text-blue-600">
                      <FileText className="w-8 h-8" />
                  </div>
                  <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">Smart Forms that <br/> <span className="text-blue-600">Think Like Lawyers</span>.</h2>
                  <p className="text-xl text-slate-600 leading-relaxed mb-8">
                      Stop guessing. Our AI guides you field-by-field, translating legalese into plain English and validating your answers against USCIS rules in real-time.
                  </p>
                  <ul className="space-y-4">
                      {["Instant Error Detection", "Auto-Generate Addendums", "Multi-Language Support"].map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-lg font-medium text-slate-700">
                              <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4" />
                              </div>
                              {item}
                          </li>
                      ))}
                  </ul>
              </div>
          </div>
      </section>

      {/* Feature 2: RFE Decoder */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
          <div className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-20 items-center">
              <div>
                  <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-8 text-amber-600">
                      <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">Scary Letter? <br/> <span className="text-amber-600">Consider it Handled.</span></h2>
                  <p className="text-xl text-slate-600 leading-relaxed mb-8">
                      The "Request for Evidence" (RFE) is the #1 cause of anxiety. Upload a photo of the letter, and our AI will analyze it, explain it, and draft the legal response for you.
                  </p>
                  <button onClick={() => setShowLogin(true)} className="text-blue-600 font-bold text-lg flex items-center gap-2 hover:gap-4 transition-all">
                      Try RFE Decoder <ArrowRight className="w-5 h-5" />
                  </button>
              </div>

              <div className="relative">
                  {/* Scanner Visual */}
                  <div className="relative z-10 bg-slate-900 rounded-3xl p-2 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                      <div className="bg-slate-800 rounded-2xl overflow-hidden relative">
                          <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_20px_#22c55e] z-20 animate-[scan_2s_ease-in-out_infinite]"></div>
                          <div className="p-8 opacity-50 blur-[1px]">
                              <div className="h-4 bg-slate-600 rounded w-3/4 mb-4"></div>
                              <div className="h-4 bg-slate-600 rounded w-full mb-4"></div>
                              <div className="h-4 bg-slate-600 rounded w-5/6 mb-4"></div>
                              <div className="h-32 bg-slate-700 rounded w-full mb-4"></div>
                          </div>
                          
                          {/* Overlay Result */}
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <div className="bg-white p-6 rounded-2xl shadow-xl max-w-xs text-center transform scale-100 animate-[blob_3s_infinite]">
                                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                      <CheckCircle2 className="w-6 h-6" />
                                  </div>
                                  <h4 className="font-bold text-slate-900">Analysis Complete</h4>
                                  <p className="text-sm text-slate-500 mt-1">USCIS is asking for "Proof of Joint Assets".</p>
                                  <button className="mt-4 w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-lg">Generate Response Letter</button>
                              </div>
                          </div>
                      </div>
                  </div>
                  {/* Decorative Elements */}
                  <div className="absolute -right-10 -top-10 w-64 h-64 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
              </div>
          </div>
      </section>

      {/* --- Trust / Stats Ticker --- */}
      <section className="py-20 bg-slate-900 border-y border-white/10 overflow-hidden">
          <div className="container mx-auto px-6 text-center mb-12">
              <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">Powering Immigration Success Stories</p>
          </div>
          <div className="relative flex overflow-x-hidden">
              <div className="py-12 animate-marquee whitespace-nowrap flex gap-32 items-center">
                  {[1,2,3,4,5,6].map((i) => (
                      <React.Fragment key={i}>
                          <div className="text-4xl font-bold text-white opacity-50">Visa<span className="text-blue-500">Journey</span></div>
                          <div className="text-4xl font-bold text-white opacity-50">Legal<span className="text-green-500">Zoom</span></div>
                          <div className="text-4xl font-bold text-white opacity-50">Boundless</div>
                          <div className="text-4xl font-bold text-white opacity-50">USCIS<span className="text-slate-500">Tracker</span></div>
                      </React.Fragment>
                  ))}
              </div>
          </div>
      </section>

      {/* --- Pricing --- */}
      <section id="pricing" className="py-32 bg-white relative">
          <div className="container mx-auto px-6 lg:px-12">
              <div className="text-center max-w-3xl mx-auto mb-20">
                  <h2 className="text-5xl font-bold text-slate-900 mb-6">Simple, transparent pricing.</h2>
                  <p className="text-xl text-slate-500">Immigration lawyers cost $300/hour. ImmiGuide costs less than a nice dinner.</p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {/* Free Tier */}
                  <div className="bg-slate-50 rounded-3xl p-10 border border-slate-200 hover:border-slate-300 transition-all flex flex-col">
                      <div className="mb-8">
                          <h3 className="text-xl font-bold text-slate-900 mb-2">Explorer</h3>
                          <div className="text-4xl font-bold text-slate-900 mb-2">$0</div>
                          <p className="text-slate-500">Forever free resources to get you started.</p>
                      </div>
                      <ul className="space-y-4 mb-10 flex-1">
                          {["Official Form Downloads", "Case Timeline Tracker", "Basic Risk Assessment", "Community Forum"].map((item, i) => (
                              <li key={i} className="flex items-center gap-3 text-slate-700">
                                  <CheckCircle2 className="w-5 h-5 text-slate-400" /> {item}
                              </li>
                          ))}
                      </ul>
                      <button onClick={() => setShowLogin(true)} className="w-full py-4 rounded-xl font-bold border-2 border-slate-200 text-slate-700 hover:bg-white transition-all">
                          Start Free
                      </button>
                  </div>

                  {/* Pro Tier - Featured */}
                  <div className="bg-slate-900 rounded-3xl p-10 border-2 border-blue-500 shadow-2xl relative transform lg:-translate-y-6 flex flex-col">
                      <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-bl-xl rounded-tr-2xl">
                          MOST POPULAR
                      </div>
                      <div className="mb-8">
                          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                              Pro <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          </h3>
                          <div className="text-5xl font-bold text-white mb-2">$29<span className="text-lg text-slate-400 font-normal">/mo</span></div>
                          <p className="text-slate-400">Everything needed to file with confidence.</p>
                      </div>
                      <ul className="space-y-4 mb-10 flex-1">
                          {[
                              "AI Form Auto-Fill & Validation", 
                              "Unlimited RFE Decoding", 
                              "Priority Strategy Chat", 
                              "Interview Simulator",
                              "10GB Secure Document Vault"
                          ].map((item, i) => (
                              <li key={i} className="flex items-center gap-3 text-white font-medium">
                                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                                  </div>
                                  {item}
                              </li>
                          ))}
                      </ul>
                      <button onClick={() => setShowLogin(true)} className="w-full py-4 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/30">
                          Get Started
                      </button>
                  </div>

                  {/* Attorney Tier */}
                  <div className="bg-white rounded-3xl p-10 border border-slate-200 hover:border-slate-300 transition-all flex flex-col">
                      <div className="mb-8">
                          <h3 className="text-xl font-bold text-slate-900 mb-2">Review</h3>
                          <div className="text-4xl font-bold text-slate-900 mb-2">$249</div>
                          <p className="text-slate-500">One-time expert review before you file.</p>
                      </div>
                      <ul className="space-y-4 mb-10 flex-1">
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

      {/* --- Footer --- */}
      <footer className="bg-slate-900 text-slate-400 pt-20 pb-10 border-t border-white/10">
          <div className="container mx-auto px-6 lg:px-12">
              <div className="grid md:grid-cols-4 gap-12 mb-16">
                  <div className="col-span-2">
                      <div className="flex items-center gap-2 text-white mb-6">
                          <Compass className="w-8 h-8 text-blue-500" />
                          <span className="text-2xl font-bold">ImmiGuide</span>
                      </div>
                      <p className="text-lg leading-relaxed max-w-sm">
                          Democratizing legal access with Artificial Intelligence. 
                          We believe the American Dream should be accessible to everyone, regardless of budget.
                      </p>
                  </div>
                  <div>
                      <h4 className="text-white font-bold mb-6">Platform</h4>
                      <ul className="space-y-4">
                          <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Attorney Network</a></li>
                      </ul>
                  </div>
                  <div>
                      <h4 className="text-white font-bold mb-6">Legal</h4>
                      <ul className="space-y-4">
                          <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Disclaimer</a></li>
                      </ul>
                  </div>
              </div>
              <div className="pt-8 border-t border-white/5 text-center text-sm">
                  <p>&copy; 2024 ImmiGuide AI. Not a law firm. Not affiliated with USCIS.</p>
              </div>
          </div>
      </footer>
    </div>
  );
};