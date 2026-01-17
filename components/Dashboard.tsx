import React, { useState } from 'react';
import { ViewState } from '../App';
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  FileText,
  ShieldAlert,
  Briefcase,
  Sparkles,
  Loader2,
  Calendar,
  Globe,
  Info,
  CheckCircle,
  X
} from 'lucide-react';
import { CaseStat, PredictionResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { predictCaseTimeline } from '../services/geminiService';

interface DashboardProps {
  onViewChange: (view: ViewState) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const { t, dir, language } = useLanguage();
  const { announcements, deleteAnnouncement } = useData();
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  
  // Mock data for the "Worry Tracker"
  const caseStat: CaseStat = {
    daysPending: 145,
    averageDays: 168,
    percentile: 73,
    status: 'Normal'
  };

  const handlePredict = async () => {
      setIsPredicting(true);
      try {
          // Simulate input for now (in a real app, these would come from the form state)
          const result = await predictCaseTimeline({
              formType: "I-130 Petition for Alien Relative",
              serviceCenter: "Potomac Service Center",
              priorityDate: "2023-10-15"
          }, language);
          setPrediction(result);
      } catch (e) {
          console.error(e);
      } finally {
          setIsPredicting(false);
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-2">
        <h1 className="text-3xl font-bold text-slate-900">{t('welcome')}</h1>
        <p className="text-slate-500 mt-2">{t('managing')}</p>
      </header>

      {/* Admin Announcements Section */}
      {announcements.length > 0 && (
          <div className="space-y-3">
              {announcements.map(ann => (
                  <div 
                    key={ann.id} 
                    className={`rounded-xl p-4 border flex items-start gap-3 shadow-sm animate-in slide-in-from-top-2 ${
                        ann.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                        ann.type === 'success' ? 'bg-green-50 border-green-200 text-green-900' :
                        'bg-blue-50 border-blue-200 text-blue-900'
                    }`}
                  >
                      <div className="shrink-0 mt-0.5">
                          {ann.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-600" /> :
                           ann.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                           <Info className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                          <h4 className="font-bold text-sm">{ann.title}</h4>
                          <p className="text-xs mt-1 opacity-90">{ann.content}</p>
                      </div>
                      <button onClick={() => deleteAnnouncement(ann.id)} className="shrink-0 opacity-50 hover:opacity-100">
                          <X className="w-4 h-4" />
                      </button>
                  </div>
              ))}
          </div>
      )}

      {/* Hero: Prediction Engine (Worry Tracker Upgrade) */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 relative overflow-hidden">
        {/* Background gradient for premium feel */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                {t('caseTimeline')}
                </h2>
                <p className="text-sm text-slate-500 mt-1">{t('waitNormal')}</p>
            </div>
            {!prediction ? (
                <button 
                    onClick={handlePredict}
                    disabled={isPredicting}
                    className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                    {isPredicting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-yellow-300" />}
                    {isPredicting ? "Analyzing..." : "AI Predict Approval"}
                </button>
            ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 mt-4 md:mt-0 animate-in fade-in">
                    <CheckCircle2 className={`w-4 h-4 ${dir === 'rtl' ? 'ml-1.5' : 'mr-1.5'}`} />
                    {t('onTrack')}
                </span>
            )}
            </div>

            <div className="relative pt-6 pb-2">
            {/* Progress Bar Background */}
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                {/* Average Marker */}
                <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-slate-400 h-full" style={{ left: '60%' }}></div>
                
                {/* User Progress */}
                <div className={`h-full bg-blue-600 rounded-full relative transition-all duration-1000 ease-out`} style={{ width: '45%' }}>
                    <div className={`absolute ${dir === 'rtl' ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-600 rounded-full shadow-sm`}></div>
                </div>
            </div>

            {/* Labels */}
            <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                <span>Filed (0 d)</span>
                <span className="text-slate-400">Avg (168 d)</span>
                <span>Max (240 d)</span>
            </div>
            
            {/* Prediction Result Panel */}
            {prediction && (
                <div className="mt-6 bg-indigo-50 rounded-xl p-6 border border-indigo-100 animate-in slide-in-from-top-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-100 rounded-xl shrink-0">
                            <Calendar className="w-6 h-6 text-indigo-700" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-indigo-900 mb-1">
                                Estimated Approval: <span className="text-blue-600">{prediction.estimatedDate}</span>
                            </h3>
                            <p className="text-sm text-indigo-700 mb-3 font-medium">
                                Confidence: {prediction.confidence}%
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {prediction.factors.map((factor, i) => (
                                    <span key={i} className="text-xs bg-white/60 px-2 py-1 rounded-md text-indigo-800 border border-indigo-100">
                                        {factor}
                                    </span>
                                ))}
                            </div>
                            <p className="text-sm text-slate-600 italic bg-white p-3 rounded-lg border border-indigo-100">
                                "{prediction.recommendation}"
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {!prediction && (
                <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-blue-900">{t('dontWorry')}</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            {t('daysPending').replace('{days}', caseStat.daysPending.toString())}
                        </p>
                    </div>
                </div>
            )}
            </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <h2 className="text-xl font-bold text-slate-900">{t('quickActions')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Card 1: Form Help */}
        <div 
            onClick={() => onViewChange('forms')}
            className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
        >
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('continueForm')}</h3>
            <p className="text-sm text-slate-500 mb-4">{t('formDesc')}</p>
            <div className="flex items-center text-sm font-semibold text-indigo-600">
                <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'mr-1 rotate-180' : 'ml-1'} group-hover:translate-x-1 transition-transform`} />
            </div>
        </div>

        {/* Card 2: RFE Help (The Crisis Tool) */}
        <div 
            onClick={() => onViewChange('rfe')}
            className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
            <div className={`absolute top-0 ${dir === 'rtl' ? 'left-0 rounded-br-xl' : 'right-0 rounded-bl-xl'} bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700`}>
                Priority
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
                <ShieldAlert className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('rfeTitle')}</h3>
            <p className="text-sm text-slate-500 mb-4">{t('rfeDesc')}</p>
            <div className="flex items-center text-sm font-semibold text-amber-600">
                <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'mr-1 rotate-180' : 'ml-1'} group-hover:translate-x-1 transition-transform`} />
            </div>
        </div>

        {/* Card 3: Translations (New) */}
        <div 
            onClick={() => onViewChange('translations')}
            className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-pink-300 hover:shadow-md transition-all cursor-pointer"
        >
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-200 transition-colors">
                <Globe className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Translations</h3>
            <p className="text-sm text-slate-500 mb-4">Instant AI or Certified Official copies.</p>
            <div className="flex items-center text-sm font-semibold text-pink-600">
                <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'mr-1 rotate-180' : 'ml-1'} group-hover:translate-x-1 transition-transform`} />
            </div>
        </div>

        {/* Card 4: Marketplace */}
        <div 
            onClick={() => onViewChange('marketplace')}
            className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
        >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('marketTitle')}</h3>
            <p className="text-sm text-slate-500 mb-4">{t('marketDesc')}</p>
            <div className="flex items-center text-sm font-semibold text-purple-600">
                <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'mr-1 rotate-180' : 'ml-1'} group-hover:translate-x-1 transition-transform`} />
            </div>
        </div>

      </div>
    </div>
  );
};
