import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { searchCaseLaw } from '../services/geminiService';
import { CaseLawResult } from '../types';
import { 
  Gavel, 
  Search, 
  BookOpen, 
  Scale, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Bookmark
} from 'lucide-react';

export const CaseLawExplorer: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CaseLawResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseLawResult | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSelectedCase(null);
    try {
        const data = await searchCaseLaw(query, language);
        setResults(data);
    } catch (e) {
        console.error(e);
    } finally {
        setIsSearching(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in pb-20">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-3 flex items-center justify-center gap-3">
            <Gavel className="w-8 h-8 text-indigo-800" />
            Case Law Explorer
        </h1>
        <p className="text-slate-500">
           Search thousands of Board of Immigration Appeals (BIA) and Federal precedents using plain English. 
           Understand how past rulings affect your case.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={handleSearch} className="relative flex items-center">
              <Search className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} w-5 h-5 text-slate-400`} />
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Can I get asylum if I was persecuted for political opinion?"
                className={`w-full ${dir === 'rtl' ? 'pr-12 pl-32' : 'pl-12 pr-32'} py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all`}
              />
              <button 
                type="button"
                onClick={() => handleSearch()}
                disabled={isSearching || !query.trim()}
                className={`absolute ${dir === 'rtl' ? 'left-2' : 'right-2'} bg-indigo-800 hover:bg-indigo-900 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2`}
              >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Research"}
              </button>
          </form>
          <div className="flex gap-2 mt-4 text-sm text-slate-500 justify-center">
              <span>Popular:</span>
              <button onClick={() => {setQuery("Matter of Dhanasar national interest waiver"); handleSearch();}} className="text-indigo-600 hover:underline">NIW Dhanasar</button>
              <span>•</span>
              <button onClick={() => {setQuery("Good Moral Character DUI"); handleSearch();}} className="text-indigo-600 hover:underline">DUI & GMC</button>
              <span>•</span>
              <button onClick={() => {setQuery("Matter of A-R-C-G- domestic violence asylum"); handleSearch();}} className="text-indigo-600 hover:underline">Domestic Violence Asylum</button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Results List */}
          <div className="lg:col-span-1 space-y-4">
              {isSearching ? (
                   [1,2,3].map(i => (
                       <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm animate-pulse">
                           <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                           <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                       </div>
                   ))
              ) : results.length > 0 ? (
                  results.map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedCase(item)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedCase === item ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                      >
                          <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded text-slate-600">{item.year}</span>
                              <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                                  <Scale className="w-3 h-3" /> {item.relevanceScore}% Match
                              </div>
                          </div>
                          <h3 className="font-bold text-slate-900 mb-1 leading-tight">{item.caseName}</h3>
                          <p className="text-xs text-slate-500 font-mono mb-2">{item.citation}</p>
                          <p className="text-xs text-slate-600 mb-3 line-clamp-2">{item.summary}</p>
                          <div className="flex flex-wrap gap-1">
                              {item.tags.slice(0, 2).map(t => (
                                  <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{t}</span>
                              ))}
                          </div>
                      </div>
                  ))
              ) : (
                  <div className="text-center p-8 text-slate-400">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Enter a topic to see legal precedents.</p>
                  </div>
              )}
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-2">
              {selectedCase ? (
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-in slide-in-from-right-4">
                      <div className="bg-indigo-900 p-6 text-white">
                          <div className="flex justify-between items-start">
                              <div>
                                <h2 className="text-2xl font-serif font-bold mb-2">{selectedCase.caseName}</h2>
                                <p className="font-mono text-indigo-300 text-sm">{selectedCase.citation} • {selectedCase.year}</p>
                              </div>
                              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                  <Bookmark className="w-5 h-5 text-white" />
                              </button>
                          </div>
                      </div>
                      <div className="p-8 space-y-8">
                          <div>
                              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Legal Holding Summary</h3>
                              <p className="text-slate-800 leading-relaxed font-medium">
                                  {selectedCase.summary}
                              </p>
                          </div>

                          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
                              <h3 className="text-blue-900 font-bold mb-2 flex items-center gap-2">
                                  <ArrowRight className="w-4 h-4" /> Why this matters to you
                              </h3>
                              <p className="text-blue-800 text-sm leading-relaxed">
                                  {selectedCase.applicationToUser}
                              </p>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                              <span className="text-xs font-bold text-slate-400 mr-2 self-center">KEYWORDS:</span>
                              {selectedCase.tags.map(t => (
                                  <span key={t} className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                                      {t}
                                  </span>
                              ))}
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="h-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-12 min-h-[400px]">
                      <Scale className="w-16 h-16 mb-4 opacity-20" />
                      <p>Select a case to view details</p>
                  </div>
              )}
          </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>
              <strong>Disclaimer:</strong> This tool is for educational research only. Case law changes frequently. 
              Always cite legal precedents under the guidance of a qualified immigration attorney.
          </p>
      </div>
    </div>
  );
};