import React, { useState, useEffect } from 'react';
import { Attorney } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { ViewState } from '../App';
import { 
  Search, 
  Filter, 
  Star, 
  ShieldCheck, 
  Clock, 
  Award, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  Sparkles,
  Gavel,
  ArrowRight
} from 'lucide-react';

interface AttorneyMarketplaceProps {
  onViewChange?: (view: ViewState) => void;
}

export const AttorneyMarketplace: React.FC<AttorneyMarketplaceProps> = ({ onViewChange }) => {
  const { t, language, dir } = useLanguage();
  const { attorneys } = useData();
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [rfeSeverity, setRfeSeverity] = useState<'low'|'medium'|'high'|null>(null);

  useEffect(() => {
    // Check local storage for RFE analysis to provide context
    const savedState = localStorage.getItem('immi_rfe_state');
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            if (parsed.analysis && parsed.analysis.severity) {
                setRfeSeverity(parsed.analysis.severity);
                // If high severity, default filter to RFE Response
                if (parsed.analysis.severity === 'high') {
                    setSpecialtyFilter('RFE Response');
                }
            }
        } catch (e) {
            console.error('Error reading RFE state', e);
        }
    }
  }, []);

  const filteredAttorneys = attorneys.filter(attorney => {
    const matchSpecialty = specialtyFilter === 'All' || attorney.specialties.includes(specialtyFilter);
    const matchLanguage = languageFilter === 'All' || attorney.languages.some(l => 
        l.toLowerCase().includes(languageFilter.toLowerCase()) || 
        (languageFilter === 'Chinese' && l.includes('Chinese'))
    );
    return matchSpecialty && matchLanguage;
  });

  // Sort attorneys: RFE specialists first if severity is high
  const sortedAttorneys = [...filteredAttorneys].sort((a, b) => {
      if (rfeSeverity === 'high') {
          const aHas = a.specialties.includes('RFE Response');
          const bHas = b.specialties.includes('RFE Response');
          if (aHas && !bHas) return -1;
          if (!aHas && bHas) return 1;
      }
      return 0; 
  });

  const uniqueSpecialties = Array.from(new Set(attorneys.flatMap(a => a.specialties)));
  const uniqueLanguages = Array.from(new Set(attorneys.flatMap(a => a.languages)));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('findExpert')}</h1>
          <p className="text-slate-500 mt-2">{t('marketDesc')}</p>
        </div>
        <div className="flex gap-3">
             <div className="relative">
                <select 
                    value={specialtyFilter}
                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                >
                    <option value="All">{t('allSpecialties')}</option>
                    {uniqueSpecialties.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <Filter className={`absolute ${dir === 'rtl' ? 'left-3' : 'right-3'} top-3 w-4 h-4 text-slate-400 pointer-events-none`} />
             </div>
             <div className="relative">
                <select 
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                >
                    <option value="All">{t('allLanguages')}</option>
                    {uniqueLanguages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <Search className={`absolute ${dir === 'rtl' ? 'left-3' : 'right-3'} top-3 w-4 h-4 text-slate-400 pointer-events-none`} />
             </div>
        </div>
      </div>

      {/* RFE Context Banner */}
      {rfeSeverity === 'high' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
                <h3 className="font-bold text-amber-900 text-sm">{t('rfeMatch')}</h3>
                <p className="text-amber-700 text-xs mt-1">
                    Your recent RFE analysis indicated high complexity. We have prioritized attorneys with RFE success records.
                </p>
            </div>
            <button 
                onClick={() => setRfeSeverity(null)} // Dismiss
                className="ml-auto text-amber-500 hover:text-amber-700"
            >
                <span className="sr-only">Dismiss</span>
                ×
            </button>
        </div>
      )}

      {/* Attorney Recruitment CTA */}
      {onViewChange && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between shadow-lg">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                      <Gavel className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                      <h3 className="font-bold text-lg">Are you an Immigration Attorney?</h3>
                      <p className="text-sm text-slate-300">Join our partner network. Get pre-screened leads and manage cases efficiently.</p>
                  </div>
              </div>
              <button 
                onClick={() => onViewChange('attorney-signup')}
                className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                  Apply to Partner <ArrowRight className="w-4 h-4" />
              </button>
          </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedAttorneys.map((attorney) => (
            <div key={attorney.id} className={`bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all group ${rfeSeverity === 'high' && attorney.specialties.includes('RFE Response') ? 'border-amber-300 ring-4 ring-amber-50' : 'border-slate-200'}`}>
                {rfeSeverity === 'high' && attorney.specialties.includes('RFE Response') && (
                    <div className="bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1 flex items-center gap-1 justify-center">
                        <Sparkles className="w-3 h-3" /> Recommended for RFE
                    </div>
                )}
                <div className="p-6">
                    <div className="flex gap-4 mb-4">
                        <img 
                            src={attorney.image} 
                            alt={attorney.name}
                            className="w-16 h-16 rounded-xl object-cover border border-slate-100 shadow-sm"
                        />
                        <div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <h3 className="font-bold text-slate-900 leading-tight">{attorney.name}</h3>
                                {attorney.isVerified && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                            </div>
                            <p className="text-xs text-slate-500 mb-1">{attorney.firm}</p>
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-xs font-bold text-slate-700">{attorney.rating}</span>
                                <span className="text-xs text-slate-400">({attorney.reviewCount} {t('reviews')})</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex flex-wrap gap-2">
                            {attorney.specialties.map(spec => (
                                <span key={spec} className={`px-2 py-1 text-xs rounded-md font-medium ${rfeSeverity === 'high' && spec === 'RFE Response' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                                    {spec}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                            <span className="flex items-center gap-1">
                                <Award className="w-3 h-3 text-blue-500" />
                                {t('successRate')}: <span className="font-bold text-slate-900">{attorney.successRate}%</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-green-500" />
                                {t('nextAvailable')}: <span className="font-bold text-slate-900">{attorney.nextAvailable}</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">{t('startsAt')}</p>
                            <p className="text-lg font-bold text-slate-900">${attorney.priceStart}</p>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {t('bookConsult')}
                        </button>
                    </div>
                </div>
                {/* Languages Footer */}
                <div className="bg-slate-50 px-6 py-2 border-t border-slate-100 flex gap-3 text-xs text-slate-500">
                    {attorney.languages.map(lang => (
                        <span key={lang} className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            {lang}
                        </span>
                    ))}
                </div>
            </div>
        ))}
        {sortedAttorneys.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No attorneys match your filters.</p>
            </div>
        )}
      </div>
    </div>
  );
};