import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SubscriptionTier } from '../types';
import { CheckCircle2, ShieldCheck, Zap, Star, Loader2, Lock } from 'lucide-react';

export const Paywall: React.FC = () => {
  const { upgradeSubscription, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handlePurchase = async (tier: SubscriptionTier) => {
    setIsProcessing(tier);
    await upgradeSubscription(tier);
    setIsProcessing(null);
  };

  const FeatureItem = ({ text }: { text: string }) => (
    <li className="flex items-start gap-2 text-sm text-slate-600">
      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
      <span>{text}</span>
    </li>
  );

  return (
    <div className="max-w-6xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <Lock className="w-4 h-4" /> Premium Feature Locked
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Unlock Your Immigration Success</h1>
        <p className="text-slate-500 text-lg">
          Choose a plan to access advanced AI tools, RFE analysis, and strategic guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        
        {/* Pay Per Use */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">One-Time Form</h3>
            <p className="text-sm text-slate-500 mt-1">Single form assistance</p>
            <div className="mt-4 flex items-baseline">
              <span className="text-3xl font-bold text-slate-900">$29.00</span>
              <span className="text-slate-400 ml-1">/form</span>
            </div>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <FeatureItem text="Access to AI Form Assistant" />
            <FeatureItem text="Real-time error checking" />
            <FeatureItem text="Export to PDF" />
            <li className="flex items-start gap-2 text-sm text-slate-400">
               <Lock className="w-4 h-4 mt-0.5" /> <span>RFE Decoder (Locked)</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-400">
               <Lock className="w-4 h-4 mt-0.5" /> <span>Strategy Advisor (Locked)</span>
            </li>
          </ul>

          <button
            onClick={() => handlePurchase('one_form')}
            disabled={!!isProcessing}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {isProcessing === 'one_form' ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Buy One Form'}
          </button>
        </div>

        {/* Annual (Best Value) */}
        <div className="bg-slate-900 rounded-2xl p-8 border-2 border-blue-500 shadow-xl relative flex flex-col transform md:-translate-y-4">
          <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
            BEST VALUE
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" /> Annual Pro
            </h3>
            <p className="text-sm text-slate-400 mt-1">Billed annually ($359.88)</p>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold text-white">$29.99</span>
              <span className="text-slate-400 ml-1">/mo</span>
            </div>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-2 text-sm text-white font-medium">
              <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <span>Everything in Monthly</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Save 40% vs Monthly</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Priority Support</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Unlimited Document Storage</span>
            </li>
             <li className="flex items-start gap-2 text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Full RFE & Interview Access</span>
            </li>
          </ul>

          <button
            onClick={() => handlePurchase('annual')}
            disabled={!!isProcessing}
            className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/50 disabled:opacity-50 flex items-center justify-center gap-2"
          >
             {isProcessing === 'annual' ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-4 h-4 fill-current" /> Upgrade Annually</>}
          </button>
        </div>

        {/* Monthly */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Monthly Pro</h3>
            <p className="text-sm text-slate-500 mt-1">Cancel anytime</p>
            <div className="mt-4 flex items-baseline">
              <span className="text-3xl font-bold text-slate-900">$49.99</span>
              <span className="text-slate-400 ml-1">/mo</span>
            </div>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
             <FeatureItem text="Unlimited Form Assistant" />
             <FeatureItem text="RFE Decoder (AI Analysis)" />
             <FeatureItem text="Strategy Advisor Chat" />
             <FeatureItem text="Interview Simulator" />
             <FeatureItem text="Case Law Explorer" />
             <FeatureItem text="Legal Cover Letter Generator" />
          </ul>

          <button
            onClick={() => handlePurchase('monthly')}
            disabled={!!isProcessing}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {isProcessing === 'monthly' ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Subscribe Monthly'}
          </button>
        </div>

      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Secure Payment processed by Stripe. No hidden fees.
        </p>
      </div>
    </div>
  );
};
