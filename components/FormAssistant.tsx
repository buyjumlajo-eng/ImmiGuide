import React, { useState, useEffect } from 'react';
import { getFieldHelp, validateFormInput } from '../services/geminiService';
import { FormFieldHelp, ValidationResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  HelpCircle, 
  AlertCircle, 
  Loader2, 
  Wand2, 
  CheckCircle2, 
  Lightbulb,
  XCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

// --- Reusable Smart Input Components ---

interface SmartFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  onFocus: () => void;
  onBlur?: () => void;
  type?: string;
  placeholder?: string;
  validation?: ValidationResult;
  isValidating?: boolean;
  isActive?: boolean;
}

const SmartInput: React.FC<SmartFieldProps> = ({ 
  id, label, value, onChange, onFocus, onBlur, type = "text", placeholder, validation, isValidating, isActive 
}) => {
  const { dir } = useLanguage();
  return (
    <div className={`mb-4 group relative transition-all duration-500 ${isActive ? 'scale-[1.02]' : ''}`}>
      <label htmlFor={id} className="block text-sm font-semibold mb-1.5 flex justify-between items-center transition-colors">
        <span className={`flex items-center gap-2 ${isActive ? 'text-indigo-600' : 'text-slate-700'}`}>
            {label}
            {isActive && <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />}
        </span>
        {isValidating && <span className="text-xs text-blue-500 flex items-center"><Loader2 className={`w-3 h-3 ${dir === 'rtl' ? 'ml-1' : 'mr-1'} animate-spin`}/> Checking...</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full p-3 rounded-xl border-2 transition-all duration-300 outline-none 
            ${validation?.severity === 'error' ? 'border-red-300 bg-red-50 focus:border-red-500' : 
              validation?.severity === 'warning' ? 'border-amber-300 bg-amber-50 focus:border-amber-500' :
              validation?.severity === 'success' ? 'border-green-300 bg-green-50 focus:border-green-500' :
              isActive ? 'border-indigo-400 bg-indigo-50/30 ring-4 ring-indigo-100 shadow-lg shadow-indigo-100' :
              'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
            }`}
        />
        {validation && (
           <div className={`absolute ${dir === 'rtl' ? 'left-3' : 'right-3'} top-3.5`}>
             {validation.severity === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
             {validation.severity === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500" />}
             {validation.severity === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
           </div>
        )}
      </div>
      {validation && (validation.severity === 'error' || validation.severity === 'warning') && (
        <div className={`mt-2 text-xs p-2 rounded-lg flex items-start gap-2 ${
            validation.severity === 'error' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
        }`}>
            {validation.severity === 'error' ? <XCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" />}
            <div>
                <p className="font-semibold">{validation.message}</p>
                {validation.suggestion && <p className="mt-1 opacity-90">Suggestion: "{validation.suggestion}"</p>}
            </div>
        </div>
      )}
    </div>
  );
};

const SmartTextArea: React.FC<SmartFieldProps> = ({ 
    id, label, value, onChange, onFocus, onBlur, placeholder, validation, isValidating, isActive 
  }) => {
    const { dir } = useLanguage();
    return (
      <div className={`mb-4 group transition-all duration-500 ${isActive ? 'scale-[1.02]' : ''}`}>
        <label htmlFor={id} className="block text-sm font-semibold mb-1.5 flex justify-between items-center transition-colors">
            <span className={`flex items-center gap-2 ${isActive ? 'text-indigo-600' : 'text-slate-700'}`}>
                {label}
                {isActive && <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />}
            </span>
            {isValidating && <span className="text-xs text-blue-500 flex items-center"><Loader2 className={`w-3 h-3 ${dir === 'rtl' ? 'ml-1' : 'mr-1'} animate-spin`}/> Checking...</span>}
        </label>
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={4}
          className={`w-full p-3 rounded-xl border-2 transition-all duration-300 outline-none resize-none
            ${validation?.severity === 'error' ? 'border-red-300 bg-red-50 focus:border-red-500' : 
              validation?.severity === 'warning' ? 'border-amber-300 bg-amber-50 focus:border-amber-500' :
              isActive ? 'border-indigo-400 bg-indigo-50/30 ring-4 ring-indigo-100 shadow-lg shadow-indigo-100' :
              'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
            }`}
        />
        {validation && (validation.severity === 'error' || validation.severity === 'warning') && (
        <div className={`mt-2 text-xs p-2 rounded-lg flex items-start gap-2 ${
            validation.severity === 'error' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
        }`}>
            {validation.severity === 'error' ? <XCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" />}
            <div>
                <p className="font-semibold">{validation.message}</p>
                {validation.suggestion && <p className="mt-1 opacity-90">Try: "{validation.suggestion}"</p>}
            </div>
        </div>
      )}
      </div>
    );
  };

// --- Main Form Assistant Component ---

export const FormAssistant: React.FC = () => {
  const { t, language, dir } = useLanguage();

  // Form State
  const [formData, setFormData] = useState({
    address: '123 Main St, Apt 4',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    dateFrom: '2020-01-01',
    dateTo: '',
    criminalHistory: 'no',
    criminalDetails: ''
  });

  const [activeFieldId, setActiveFieldId] = useState<string>('address');
  const [validations, setValidations] = useState<Record<string, ValidationResult>>({});
  const [validatingFields, setValidatingFields] = useState<Record<string, boolean>>({});
  
  // AI Helper State
  const [helperData, setHelperData] = useState<Record<string, FormFieldHelp>>({});
  const [loadingHelp, setLoadingHelp] = useState(false);

  // Definitions for context-aware help
  const fieldDefinitions: Record<string, { fullQuestion: string, contextHint: string }> = {
    address: { 
        fullQuestion: "Physical Address History: Street Address", 
        contextHint: "USCIS requires where you physically slept. PO Boxes are generally rejected for physical address." 
    },
    city: { fullQuestion: "City or Town", contextHint: "" },
    zip: { fullQuestion: "Zip Code", contextHint: "" },
    dateFrom: { fullQuestion: "Date Residence Began", contextHint: "Check for gaps with previous addresses." },
    dateTo: { fullQuestion: "Date Residence Ended", contextHint: "Use 'Present' or leave blank if you still live here." },
    criminalDetails: { 
        fullQuestion: "Have you EVER been arrested, cited, charged, or detained for any reason by any law enforcement official?", 
        contextHint: "Include traffic tickets if the fine was over $500 or involved drugs/alcohol. 'Detained' includes border stops." 
    }
  };

  // --- Handlers ---

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation on change so user doesn't see stale errors
    if (validations[field]) {
        setValidations(prev => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }
  };

  const handleBlur = async (field: string) => {
    // Note: We validate even empty fields to flag missing requirements
    const value = formData[field as keyof typeof formData];

    setValidatingFields(prev => ({ ...prev, [field]: true }));
    
    // Construct context string from other fields
    const context = JSON.stringify(formData);
    const label = fieldDefinitions[field]?.fullQuestion || field;

    const result = await validateFormInput(label, value, context, language);
    
    setValidations(prev => ({ ...prev, [field]: result }));
    setValidatingFields(prev => ({ ...prev, [field]: false }));
  };

  const loadAiHelp = async (fieldId: string) => {
    setLoadingHelp(true);
    const def = fieldDefinitions[fieldId];
    if (def) {
        const data = await getFieldHelp(def.fullQuestion, def.contextHint, language);
        setHelperData(prev => ({ ...prev, [fieldId]: data }));
    }
    setLoadingHelp(false);
  };

  // Auto-load help when field is focused
  useEffect(() => {
    if (activeFieldId) {
        // Debounce slightly to avoid spamming API on rapid tabbing
        const timer = setTimeout(() => {
            loadAiHelp(activeFieldId);
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [activeFieldId, language]);

  return (
    <div className="max-w-6xl mx-auto lg:h-[calc(100vh-8rem)] h-auto flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 lg:pb-0">
      
      {/* LEFT COLUMN: The Form */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-8 overflow-y-visible lg:overflow-y-auto custom-scrollbar h-auto lg:h-full order-2 lg:order-1">
        <div className="mb-8 flex items-center justify-between">
            <div>
                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Form I-130 &bull; Part 4 &bull; Address History</span>
                <div className="w-32 bg-slate-100 h-1 mt-2 rounded-full">
                    <div className="w-2/3 bg-blue-600 h-1 rounded-full"></div>
                </div>
            </div>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">
                Auto-Save On
            </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2 font-serif">{t('whereLived')}</h2>
        <p className="text-slate-500 mb-8 text-sm">{t('physAddress')}</p>

        {/* Section 1: Address */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-8 transition-colors duration-500">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                <div className={`w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}>1</div>
                Current Physical Address
            </h3>
            
            <SmartInput 
                id="address" label="Street Address" 
                value={formData.address} onChange={(v) => handleInputChange('address', v)}
                onFocus={() => setActiveFieldId('address')}
                onBlur={() => handleBlur('address')}
                isActive={activeFieldId === 'address'}
                validation={validations.address} isValidating={validatingFields.address}
                placeholder="123 Example St"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SmartInput 
                    id="city" label="City" 
                    value={formData.city} onChange={(v) => handleInputChange('city', v)}
                    onFocus={() => setActiveFieldId('city')}
                    onBlur={() => handleBlur('city')}
                    isActive={activeFieldId === 'city'}
                    validation={validations.city} isValidating={validatingFields.city}
                />
                <div className="grid grid-cols-2 gap-4">
                     <SmartInput 
                        id="state" label="State" 
                        value={formData.state} onChange={(v) => handleInputChange('state', v)}
                        onFocus={() => setActiveFieldId('state')}
                        onBlur={() => handleBlur('state')}
                        isActive={activeFieldId === 'state'}
                        validation={validations.state} isValidating={validatingFields.state}
                    />
                    <SmartInput 
                        id="zip" label="Zip Code" 
                        value={formData.zip} onChange={(v) => handleInputChange('zip', v)}
                        onFocus={() => setActiveFieldId('zip')}
                        onBlur={() => handleBlur('zip')}
                        isActive={activeFieldId === 'zip'}
                        validation={validations.zip} isValidating={validatingFields.zip}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                 <SmartInput 
                    id="dateFrom" label="Date From" type="date"
                    value={formData.dateFrom} onChange={(v) => handleInputChange('dateFrom', v)}
                    onFocus={() => setActiveFieldId('dateFrom')}
                    onBlur={() => handleBlur('dateFrom')}
                    isActive={activeFieldId === 'dateFrom'}
                    validation={validations.dateFrom} isValidating={validatingFields.dateFrom}
                />
                 <SmartInput 
                    id="dateTo" label="Date To" type="date"
                    value={formData.dateTo} onChange={(v) => handleInputChange('dateTo', v)}
                    onFocus={() => setActiveFieldId('dateTo')}
                    onBlur={() => handleBlur('dateTo')}
                    isActive={activeFieldId === 'dateTo'}
                    validation={validations.dateTo} isValidating={validatingFields.dateTo}
                    placeholder="Present"
                />
            </div>
            
            <div className="flex justify-end mt-4">
                <button 
                    onClick={() => {
                        handleBlur('address');
                        handleBlur('zip');
                        handleBlur('dateTo');
                    }}
                    className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    Run Smart Check
                </button>
            </div>
        </div>

        {/* Section 2: Criminal History (High Context Need) */}
        <div className="bg-red-50 rounded-xl p-6 border border-red-100 mb-8">
            <h3 className="font-bold text-red-900 mb-4 flex items-center">
                 <div className={`w-6 h-6 bg-red-200 rounded-full flex items-center justify-center text-xs ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}>2</div>
                 Legal & Criminal History
            </h3>
            
            <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-800 mb-2 leading-relaxed">
                    Have you EVER been arrested, cited, charged, or detained for any reason by any law enforcement official?
                </label>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <button 
                        onClick={() => {
                            handleInputChange('criminalHistory', 'yes');
                            setActiveFieldId('criminalDetails');
                        }}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${formData.criminalHistory === 'yes' ? 'border-red-600 bg-red-100 text-red-900' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                        Yes
                    </button>
                    <button 
                         onClick={() => {
                            handleInputChange('criminalHistory', 'no');
                            setActiveFieldId('criminalDetails');
                         }}
                         className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${formData.criminalHistory === 'no' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                        No
                    </button>
                </div>
            </div>

            {formData.criminalHistory === 'yes' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <SmartTextArea 
                         id="criminalDetails" label="Provide Details (Date, Place, Outcome)"
                         value={formData.criminalDetails} onChange={(v) => handleInputChange('criminalDetails', v)}
                         onFocus={() => setActiveFieldId('criminalDetails')}
                         onBlur={() => handleBlur('criminalDetails')}
                         isActive={activeFieldId === 'criminalDetails'}
                         validation={validations.criminalDetails} isValidating={validatingFields.criminalDetails}
                         placeholder="e.g., I was detained at the border in 2018 for..."
                    />
                    <div className="flex justify-end">
                         <button 
                            onClick={() => handleBlur('criminalDetails')}
                            className="text-xs font-bold text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Validate Legal Explanation
                        </button>
                    </div>
                </div>
            )}
        </div>

        <div className="flex justify-end pb-10 lg:pb-0">
            <button className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center">
                {t('saveContinue')} <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'mr-2 rotate-180' : 'ml-2'}`} />
            </button>
        </div>
      </div>

      {/* RIGHT COLUMN: The AI Copilot */}
      <div className="w-full lg:w-96 flex-shrink-0 flex flex-col gap-4 order-1 lg:order-2 mb-6 lg:mb-0">
        
        {/* Helper Card */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl flex-1 flex flex-col transition-all duration-300 border-2 border-indigo-500/30 ring-4 ring-indigo-500/10 min-h-[300px] lg:min-h-0">
            <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <Wand2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-none">{t('aiHelper')}</h3>
                        <p className="text-xs text-slate-400 mt-1">Smart Assistant</p>
                    </div>
                </div>
                {activeFieldId && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/20 rounded text-[10px] font-bold text-indigo-200 border border-indigo-500/30 animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                        LIVE CONTEXT
                    </div>
                )}
            </div>

            {!helperData[activeFieldId] && loadingHelp ? (
                <div className="flex-1 flex flex-col justify-center items-center text-center opacity-70">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-400" />
                    <p className="text-sm">{t('analyzeField')}</p>
                </div>
            ) : !helperData[activeFieldId] ? (
                 <div className="flex-1 flex flex-col justify-center items-center text-center opacity-50">
                    <HelpCircle className="w-12 h-12 mb-4 text-indigo-400" />
                    <p className="text-sm">{t('focusField')}</p>
                </div>
            ) : (
                <div className={`flex-1 overflow-y-auto custom-scrollbar p${dir === 'rtl' ? 'l' : 'r'}-2 space-y-6 animate-in slide-in-from-${dir === 'rtl' ? 'left' : 'right'}-2`}>
                    {/* Translation */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-yellow-400" />
                            <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider">{t('whatMean')}</h4>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-200">
                            {helperData[activeFieldId].plainEnglish}
                        </p>
                    </div>

                    {/* Risks */}
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <h4 className="text-xs font-bold text-red-200 uppercase tracking-wider">{t('commonTraps')}</h4>
                        </div>
                        <ul className="text-sm space-y-2 text-slate-300 list-disc list-inside">
                            {helperData[activeFieldId].risks.map((risk, i) => (
                                <li key={i}>{risk}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Example */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider">{t('exampleAns')}</h4>
                        </div>
                        <div className={`bg-black/30 rounded-lg p-3 text-sm text-green-100 italic border-${dir === 'rtl' ? 'r' : 'l'}-2 border-green-500 font-mono`}>
                            "{helperData[activeFieldId].example}"
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 h-auto hidden lg:block">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('formHealth')}</h4>
             <div className="space-y-3">
                 <div className="flex items-center justify-between text-sm">
                     <span className="text-slate-600">{t('fieldsCompleted')}</span>
                     <span className="font-bold text-slate-900">4/12</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                     <span className="text-slate-600">{t('validationErrors')}</span>
                     <span className={`font-bold ${Object.values(validations).some((v: ValidationResult) => v.severity === 'error') ? 'text-red-600' : 'text-green-600'}`}>
                        {Object.values(validations).filter((v: ValidationResult) => v.severity === 'error').length}
                     </span>
                 </div>
                 <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                     <div className="bg-green-500 h-full rounded-full" style={{ width: '33%' }}></div>
                 </div>
             </div>
        </div>

      </div>

    </div>
  );
};