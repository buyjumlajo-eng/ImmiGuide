import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Compass, ShieldCheck, FileText, BrainCircuit, Loader2 } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Left Side: Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center order-2 md:order-1">
          <div className="flex items-center gap-2 mb-8">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Compass className="w-6 h-6 text-white" />
             </div>
             <span className="text-2xl font-bold text-slate-800">ImmiGuide</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Simplify your <br/>
            <span className="text-blue-600">Immigration Journey</span>
          </h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Your AI-powered companion for US immigration. Decode RFEs, get strategic advice, and fill forms with confidence.
          </p>

          <button
            onClick={login}
            disabled={isLoading}
            className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-3 group"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
          
          <div className="mt-6 text-center text-xs text-slate-400">
             By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>

        {/* Right Side: Feature Showcase */}
        <div className="bg-blue-600 p-8 md:p-12 text-white flex flex-col justify-between order-1 md:order-2 relative overflow-hidden">
           {/* Decor */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
           
           <div className="relative z-10">
               <h2 className="text-2xl font-bold mb-8">Why ImmiGuide?</h2>
               
               <div className="space-y-6">
                   <div className="flex items-start gap-4">
                       <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                           <FileText className="w-5 h-5 text-white" />
                       </div>
                       <div>
                           <h3 className="font-bold text-lg">Smart Form Helper</h3>
                           <p className="text-blue-100 text-sm leading-relaxed">Real-time error checking and plain-English explanations for complex questions.</p>
                       </div>
                   </div>

                   <div className="flex items-start gap-4">
                       <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                           <BrainCircuit className="w-5 h-5 text-white" />
                       </div>
                       <div>
                           <h3 className="font-bold text-lg">RFE Decoder</h3>
                           <p className="text-blue-100 text-sm leading-relaxed">Upload letters from USCIS to understand exactly what they need and how to respond.</p>
                       </div>
                   </div>

                   <div className="flex items-start gap-4">
                       <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                           <ShieldCheck className="w-5 h-5 text-white" />
                       </div>
                       <div>
                           <h3 className="font-bold text-lg">Attorney Marketplace</h3>
                           <p className="text-blue-100 text-sm leading-relaxed">Connect with vetted experts tailored to your specific case needs.</p>
                       </div>
                   </div>
               </div>
           </div>

           <div className="relative z-10 mt-12 pt-6 border-t border-white/20">
               <div className="flex items-center gap-3">
                   <div className="flex -space-x-2">
                       <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-blue-600"></div>
                       <div className="w-8 h-8 rounded-full bg-green-400 border-2 border-blue-600"></div>
                       <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center text-blue-600 text-[10px] font-bold">+2k</div>
                   </div>
                   <p className="text-sm font-medium">Join 2,000+ families today</p>
               </div>
           </div>
        </div>

      </div>
    </div>
  );
};