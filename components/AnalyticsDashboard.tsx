import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { analyzeCaseRisk } from '../services/geminiService';
import { RiskProfile } from '../types';
import { 
  TrendingUp, 
  Activity, 
  PieChart, 
  BarChart2, 
  RefreshCw, 
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Sliders
} from 'lucide-react';

// --- Simple SVG Chart Components ---

const ProgressBar: React.FC<{ value: number; color: string; label: string }> = ({ value, color, label }) => (
  <div className="mb-4">
    <div className="flex justify-between text-xs font-semibold mb-1">
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-800">{value}%</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
      <div 
        className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${color}`} 
        style={{ width: `${value}%` }}
      ></div>
    </div>
  </div>
);

const LineChart: React.FC<{ data: number[] }> = ({ data }) => {
  const max = Math.max(...data, 100);
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (val / max) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      {/* Grid Lines */}
      <line x1="0" y1="25" x2="100" y2="25" stroke="#e2e8f0" strokeWidth="0.5" />
      <line x1="0" y1="50" x2="100" y2="50" stroke="#e2e8f0" strokeWidth="0.5" />
      <line x1="0" y1="75" x2="100" y2="75" stroke="#e2e8f0" strokeWidth="0.5" />
      
      {/* Line */}
      <polyline 
        fill="none" 
        stroke="#4f46e5" 
        strokeWidth="2" 
        points={points} 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="drop-shadow-md"
      />
      {/* Area */}
      <polygon 
        fill="url(#gradient)" 
        points={`0,100 ${points} 100,100`} 
        opacity="0.2"
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Dots */}
      {data.map((val, i) => {
         const x = (i / (data.length - 1)) * 100;
         const y = 100 - (val / max) * 100;
         return (
             <circle key={i} cx={x} cy={y} r="2" fill="white" stroke="#4f46e5" strokeWidth="1" />
         );
      })}
    </svg>
  );
};

// --- Mock Historical Data ---
const MOCK_HISTORY = [45, 48, 52, 58, 65, 72, 78];

export const AnalyticsDashboard: React.FC = () => {
  const { language } = useLanguage();
  const [isSimulating, setIsSimulating] = useState(false);
  const [baseProfile, setBaseProfile] = useState<RiskProfile | null>(null);
  const [simulatedProfile, setSimulatedProfile] = useState<RiskProfile | null>(null);
  
  // Simulation Factors
  const [factors, setFactors] = useState({
      incomeLevel: 45000,
      hasJointLease: true,
      hasJointBank: true,
      hasPhotos: true,
      hasAffidavits: false,
      yearsMarried: 1
  });

  // Initial Analysis
  useEffect(() => {
      runSimulation(false);
  }, []);

  const runSimulation = async (isUpdate: boolean) => {
      setIsSimulating(true);
      
      // Construct prompt data based on sliders/toggles
      const caseData = {
          formType: 'I-130 + I-485',
          annualIncome: factors.incomeLevel,
          relationshipEvidence: [
              factors.hasJointLease ? 'Joint Lease' : null,
              factors.hasJointBank ? 'Joint Bank Account' : null,
              factors.hasPhotos ? 'Photos' : null,
              factors.hasAffidavits ? 'Affidavits' : null
          ].filter(Boolean).join(', ') || 'None',
          marriageLength: `${factors.yearsMarried} years`,
          criminalHistory: 'None' // Assuming clean for base simulation
      };

      try {
          const result = await analyzeCaseRisk(caseData, language);
          
          if (!isUpdate) {
              setBaseProfile(result);
              setSimulatedProfile(result);
          } else {
              setSimulatedProfile(result);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsSimulating(false);
      }
  };

  const getDelta = () => {
      if (!baseProfile || !simulatedProfile) return 0;
      return simulatedProfile.approvalOdds - baseProfile.approvalOdds;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-indigo-600" />
            Analytics & Success Prediction
          </h1>
          <p className="text-slate-500 mt-1">Real-time simulation of your case strength based on evidence and financials.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200">
            <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin text-indigo-600' : ''}`} />
            Last updated: Just now
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 rounded-xl">
                      <Target className="w-6 h-6 text-indigo-600" />
                  </div>
                  {getDelta() !== 0 && (
                      <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${getDelta() > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {getDelta() > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                          {Math.abs(getDelta())}%
                      </span>
                  )}
              </div>
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Approval Probability</h3>
              <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-bold text-slate-900">
                      {simulatedProfile?.approvalOdds || 0}%
                  </span>
                  <span className="text-sm text-slate-400">confidence</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${simulatedProfile?.approvalOdds || 0}%` }}></div>
              </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-green-50 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
              </div>
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Case Trajectory</h3>
              <div className="h-20 mt-2 relative">
                  <LineChart data={simulatedProfile ? [...MOCK_HISTORY, simulatedProfile.approvalOdds] : MOCK_HISTORY} />
              </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                      <PieChart className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                      simulatedProfile?.riskLevel === 'Low' ? 'bg-green-100 text-green-700 border-green-200' :
                      simulatedProfile?.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      'bg-red-100 text-red-700 border-red-200'
                  }`}>
                      {simulatedProfile?.riskLevel || 'Loading'} Risk
                  </span>
              </div>
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Risk Assessment</h3>
              <p className="text-slate-700 text-sm mt-2 line-clamp-3">
                  {simulatedProfile?.warnings[0] || "No major warnings detected."}
              </p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Simulation Controls */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white lg:col-span-1 shadow-xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-lg">Simulator Engine</h3>
              </div>
              
              <div className="space-y-6">
                  <div>
                      <label className="flex justify-between text-sm font-bold text-slate-300 mb-2">
                          <span>Annual Income</span>
                          <span className="text-indigo-400">${factors.incomeLevel.toLocaleString()}</span>
                      </label>
                      <input 
                        type="range" 
                        min="0" 
                        max="100000" 
                        step="5000"
                        value={factors.incomeLevel}
                        onChange={(e) => setFactors({...factors, incomeLevel: parseInt(e.target.value)})}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                  </div>

                  <div>
                      <label className="flex justify-between text-sm font-bold text-slate-300 mb-2">
                          <span>Marriage Duration</span>
                          <span className="text-indigo-400">{factors.yearsMarried} Years</span>
                      </label>
                      <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        step="1"
                        value={factors.yearsMarried}
                        onChange={(e) => setFactors({...factors, yearsMarried: parseInt(e.target.value)})}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                  </div>

                  <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-300 block mb-2">Evidence Checklist</label>
                      
                      {[
                          { key: 'hasJointLease', label: 'Joint Lease/Deed' },
                          { key: 'hasJointBank', label: 'Joint Bank Account' },
                          { key: 'hasPhotos', label: 'Photos Together' },
                          { key: 'hasAffidavits', label: 'Sworn Affidavits' }
                      ].map((item) => (
                          <div 
                            key={item.key}
                            onClick={() => setFactors({...factors, [item.key]: !factors[item.key as keyof typeof factors]})}
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                                factors[item.key as keyof typeof factors] 
                                ? 'bg-indigo-600 border-indigo-500 text-white' 
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                              <span className="text-sm font-medium">{item.label}</span>
                              {factors[item.key as keyof typeof factors] && <CheckCircle2 className="w-4 h-4" />}
                          </div>
                      ))}
                  </div>

                  <button 
                    onClick={() => runSimulation(true)}
                    disabled={isSimulating}
                    className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 mt-4"
                  >
                      {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-indigo-600 fill-current" />}
                      Recalculate Odds
                  </button>
              </div>
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* Strength Breakdown */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-slate-400" /> Case Strength Factors
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                          <ProgressBar 
                            label="Financial Support" 
                            value={Math.min(100, (factors.incomeLevel / 25000) * 100)} 
                            color="bg-green-500" 
                          />
                          <ProgressBar 
                            label="Evidence Quality" 
                            value={[factors.hasJointBank, factors.hasJointLease, factors.hasPhotos, factors.hasAffidavits].filter(Boolean).length * 25} 
                            color="bg-blue-500" 
                          />
                          <ProgressBar 
                            label="Relationship Durability" 
                            value={Math.min(100, factors.yearsMarried * 20)} 
                            color="bg-purple-500" 
                          />
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">AI Insights</h4>
                          <ul className="space-y-2">
                              {simulatedProfile?.strengths.slice(0, 3).map((s, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                      {s}
                                  </li>
                              ))}
                              {simulatedProfile?.warnings.slice(0, 2).map((w, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                      {w}
                                  </li>
                              ))}
                          </ul>
                      </div>
                  </div>
              </div>

              {/* Action Plan */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-4">Recommended Optimization Steps</h3>
                  <div className="space-y-3">
                      {simulatedProfile?.actionPlan.slice(0, 4).map((action, i) => (
                          <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                                  {i + 1}
                              </div>
                              <p className="text-sm text-slate-700 font-medium">{action}</p>
                          </div>
                      ))}
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
};