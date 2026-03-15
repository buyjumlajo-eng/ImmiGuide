import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { analyzeCaseRisk } from '../services/geminiService';
import { RiskProfile } from '../types';
import { 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  AlertOctagon, 
  Loader2, 
  ArrowRight,
  RefreshCw,
  TrendingUp,
  FileSearch,
  DollarSign,
  Heart,
  Calendar,
  Lock,
  X
} from 'lucide-react';

export const RiskAnalyzer: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<RiskProfile | null>(null);

  // Form State
  const [formData, setFormData] = useState({
      formType: 'I-130 + I-485 (Concurrent)',
      petitionerStatus: 'US Citizen',
      beneficiaryEntry: 'Legal (Visa)',
      criminalHistory: 'None',
      householdSize: '2',
      annualIncome: '',
      marriageDate: '',
      relationshipEvidence: 'Strong (Joint Lease, Bank, Photos)',
      priorImmigrationViolations: 'None'
  });

  // --- Feedback State ---
  const [error, setError] = useState<string | null>(null);

  // Clear feedback after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleAnalyze = async () => {
      setIsAnalyzing(true);
      try {
          const profile = await analyzeCaseRisk(formData, language);
          setResult(profile);
      } catch (e: any) {
          console.error(e);
          setError(e.message || "Failed to analyze risk.");
      } finally {
          setIsAnalyzing(false);
      }
  };

  const getRiskColor = (level: string) => {
      switch(level) {
          case 'Low': return 'text-green-600 bg-green-50 border-green-200';
          case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
          case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
          case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
          default: return 'text-slate-600 bg-slate-50';
      }
  };

  const getRiskIcon = (level: string) => {
      switch(level) {
          case 'Low': return <CheckCircle className="w-8 h-8 text-green-600" />;
          case 'Medium': return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
          case 'High': return <AlertOctagon className="w-8 h-8 text-orange-600" />;
          case 'Critical': return <ShieldAlert className="w-8 h-8 text-red-600" />;
          default: return null;
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-20 relative">
      {/* Toast Notifications */}
      {error && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          <div className="bg-red-50 text-red-800 border border-red-200 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-sm font-medium">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-3 flex items-center justify-center gap-3">
              <FileSearch className="w-8 h-8 text-indigo-600" />
              Pre-Filing Risk Analyzer
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto">
              Scan your case facts for "Red Flags" before you file. Our AI checks for common denial triggers like income requirements, inadmissibility, and status issues.
          </p>
      </div>

      {!result ? (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-indigo-900 p-6 text-white text-center">
                  <h2 className="font-bold text-lg">Case Intake Questionnaire</h2>
                  <p className="text-indigo-200 text-sm">Tell us about your situation.</p>
              </div>
              
              <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Benefit Sought</label>
                          <select 
                            value={formData.formType}
                            onChange={(e) => setFormData({...formData, formType: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                              <option>I-130 (Standalone)</option>
                              <option>I-130 + I-485 (Concurrent)</option>
                              <option>K-1 Fiancé Visa</option>
                              <option>Naturalization (N-400)</option>
                          </select>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Petitioner Status</label>
                          <select 
                            value={formData.petitionerStatus}
                            onChange={(e) => setFormData({...formData, petitionerStatus: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                              <option>US Citizen</option>
                              <option>Permanent Resident (LPR)</option>
                          </select>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Beneficiary Entry Manner</label>
                          <select 
                            value={formData.beneficiaryEntry}
                            onChange={(e) => setFormData({...formData, beneficiaryEntry: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                              <option value="Legal (Visa)">Legal Entry (With Visa/Inspection)</option>
                              <option value="Illegal (EWI)">Illegal Entry (Without Inspection)</option>
                              <option value="Parole">Parole</option>
                          </select>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                              <Lock className="w-4 h-4 text-slate-400" /> Criminal History
                          </label>
                          <select 
                            value={formData.criminalHistory}
                            onChange={(e) => setFormData({...formData, criminalHistory: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                              <option value="None">None</option>
                              <option value="Traffic Only">Minor Traffic Only</option>
                              <option value="Arrested (No Conviction)">Arrested (No Conviction)</option>
                              <option value="Misdemeanor">Misdemeanor</option>
                              <option value="Felony">Felony</option>
                          </select>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-slate-400" /> Annual Household Income
                          </label>
                          <input 
                            type="number"
                            value={formData.annualIncome}
                            onChange={(e) => setFormData({...formData, annualIncome: e.target.value})}
                            placeholder="e.g. 45000"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Household Size</label>
                          <select 
                            value={formData.householdSize}
                            onChange={(e) => setFormData({...formData, householdSize: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                              {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" /> Marriage Date (If applicable)
                          </label>
                          <input 
                            type="date"
                            value={formData.marriageDate}
                            onChange={(e) => setFormData({...formData, marriageDate: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                              <Heart className="w-4 h-4 text-slate-400" /> Relationship Evidence
                          </label>
                          <select 
                            value={formData.relationshipEvidence}
                            onChange={(e) => setFormData({...formData, relationshipEvidence: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                              <option>Strong (Joint Lease, Bank, Photos)</option>
                              <option>Medium (Photos, Affidavits)</option>
                              <option>Weak (Little to no documentation)</option>
                          </select>
                      </div>
                  </div>

                  <div className="flex justify-center">
                      <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !formData.annualIncome}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-lg"
                      >
                          {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldAlert className="w-6 h-6" />}
                          {isAnalyzing ? "Running Legal Scan..." : "Analyze Risk Profile"}
                      </button>
                  </div>
              </div>
          </div>
      ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
              {/* Score Card */}
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 flex flex-col md:flex-row items-center gap-8">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-8 border-slate-100"></div>
                      <div 
                        className={`absolute inset-0 rounded-full border-8 border-t-transparent ${result.approvalOdds > 75 ? 'border-green-500' : result.approvalOdds > 50 ? 'border-yellow-500' : 'border-red-500'}`}
                        style={{ transform: 'rotate(-45deg)' }} // Simple static visualization for now
                      ></div>
                      <div className="text-center">
                          <span className="text-4xl font-bold text-slate-900">{result.approvalOdds}%</span>
                          <span className="block text-xs text-slate-500 font-bold uppercase mt-1">Odds</span>
                      </div>
                  </div>
                  
                  <div className="flex-1">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border mb-4 font-bold ${getRiskColor(result.riskLevel)}`}>
                          {getRiskIcon(result.riskLevel)}
                          {result.riskLevel} Risk Detected
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                          Based on the provided facts, your case has a <strong>{result.riskLevel}</strong> risk profile. 
                          {result.riskLevel === 'Critical' || result.riskLevel === 'High' 
                            ? " There are significant barriers to approval that likely require legal intervention or waivers." 
                            : " Your case appears straightforward, but ensure all documentation is perfect."}
                      </p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Red Flags */}
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                      <h3 className="font-bold text-red-900 text-lg mb-4 flex items-center gap-2">
                          <AlertOctagon className="w-5 h-5" /> Critical Red Flags
                      </h3>
                      {result.redFlags.length > 0 ? (
                          <ul className="space-y-3">
                              {result.redFlags.map((flag, i) => (
                                  <li key={i} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></div>
                                      <span className="text-red-800 text-sm font-medium">{flag}</span>
                                  </li>
                              ))}
                          </ul>
                      ) : (
                          <p className="text-green-700 text-sm italic">No critical flags detected.</p>
                      )}
                  </div>

                  {/* Action Plan */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                      <h3 className="font-bold text-indigo-900 text-lg mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" /> Recommended Actions
                      </h3>
                      <ul className="space-y-3">
                          {result.actionPlan.map((action, i) => (
                              <li key={i} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0 mt-0.5">
                                      {i + 1}
                                  </div>
                                  <span className="text-indigo-900 text-sm">{action}</span>
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>

              {/* Warning/Strengths */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white border border-slate-200 rounded-2xl p-6">
                       <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                           <AlertTriangle className="w-4 h-4 text-yellow-500" /> Warnings
                       </h3>
                       <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                           {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                       </ul>
                   </div>
                   <div className="bg-white border border-slate-200 rounded-2xl p-6">
                       <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                           <CheckCircle className="w-4 h-4 text-green-500" /> Strengths
                       </h3>
                       <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                           {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                       </ul>
                   </div>
              </div>

              <div className="flex justify-center pt-6">
                  <button 
                    onClick={() => setResult(null)}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors"
                  >
                      <RefreshCw className="w-4 h-4" /> Start New Analysis
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};