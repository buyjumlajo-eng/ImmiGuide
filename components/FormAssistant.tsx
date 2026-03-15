import React, { useState, useEffect, useMemo } from 'react';
import { getFieldHelp, validateFormInput } from '../services/geminiService';
import { generateSummaryPDF } from '../services/pdfService';
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
  Sparkles,
  Calendar as CalendarIcon,
  Download,
  FileText,
  Copy,
  LayoutTemplate,
  Search,
  Filter,
  Trash2,
  Save,
  Check
} from 'lucide-react';

// --- Legal Definitions Dictionary ---
const LEGAL_DEFINITIONS: Record<string, string> = {
  "Physical Address": "The specific place where you actually sleep at night. USCIS does not accept P.O. Boxes or work addresses here.",
  "Arrested": "Taken into custody by police or officials, handcuffed, or fingerprinted, even if released shortly after without charges.",
  "Cited": "Given a ticket (like for speeding) or a notice to appear in court, even if you weren't taken to a police station.",
  "Charged": "Formally accused of a crime by a government prosecutor.",
  "Detained": "Held by an officer for questioning (e.g., at a traffic stop, border, or airport) where you were not free to leave.",
  "Law enforcement official": "Any police officer, sheriff, immigration officer (CBP/ICE), or federal agent.",
  "A-Number": "Alien Registration Number (A#). Found on your Green Card or Work Permit. Format: A-123-456-789.",
  "Public Charge": "Someone who is likely to become primarily dependent on the government for subsistence.",
  "Priority Date": "The date your first petition was filed. This determines your place in line for a visa.",
  "EWI": "Entry Without Inspection. Entering the US without being checked by an officer at a port of entry.",
  "Parole": "Permission to enter or remain in the U.S. for a specific purpose, without being formally 'admitted'."
};

// --- Scalable Form Architecture ---

interface FormField {
    id: string; 
    label: string;
    type: 'text' | 'date' | 'select' | 'textarea' | 'radio' | 'email' | 'tel';
    placeholder?: string;
    options?: string[];
    contextHint?: string; 
    fullQuestion?: string; 
    width?: 'full' | 'half' | 'third';
}

interface FormSection {
    id: string;
    title: string;
    fields: FormField[];
}

interface FormConfig {
    id: string;
    code: string;
    title: string;
    category: 'Family' | 'Employment' | 'Humanitarian' | 'Green Card' | 'Citizenship' | 'Misc';
    description: string;
    sections: FormSection[];
}

// --- Common Section Templates (Reuse these!) ---

const SECTION_BIOGRAPHICS: FormSection = {
    id: 'biographics',
    title: 'Biographic Information',
    fields: [
        { id: 'legal_name_last', label: 'Family Name (Last Name)', type: 'text', width: 'half' },
        { id: 'legal_name_first', label: 'Given Name (First Name)', type: 'text', width: 'half' },
        { id: 'legal_name_middle', label: 'Middle Name', type: 'text', width: 'half' },
        { id: 'other_names', label: 'Other Names Used (Maiden, etc.)', type: 'textarea', width: 'full' },
        { id: 'dob', label: 'Date of Birth', type: 'date', width: 'half' },
        { id: 'cob', label: 'Country of Birth', type: 'text', width: 'half' },
        { id: 'coc', label: 'Country of Citizenship', type: 'text', width: 'half' },
        { id: 'a_number', label: 'Alien Registration Number (A-Number)', type: 'text', width: 'half', contextHint: 'Look on Green Card or EAD.' },
        { id: 'ssn', label: 'US Social Security Number', type: 'text', width: 'half' },
        { id: 'uscis_account_num', label: 'USCIS Online Account Number', type: 'text', width: 'half' }
    ]
};

const SECTION_ADDRESS_HISTORY: FormSection = {
    id: 'address_history',
    title: 'Address History (Last 5 Years)',
    fields: [
        { id: 'current_address_street', label: 'Current Physical Address', type: 'text', fullQuestion: 'Physical Address where you sleep', width: 'full' },
        { id: 'current_address_apt', label: 'Apt/Ste/Flr', type: 'text', width: 'third' },
        { id: 'current_address_city', label: 'City', type: 'text', width: 'third' },
        { id: 'current_address_state', label: 'State', type: 'text', width: 'third' },
        { id: 'current_address_zip', label: 'Zip Code', type: 'text', width: 'half' },
        { id: 'current_address_date_from', label: 'Date From', type: 'date', width: 'half' },
        { id: 'prior_address_1', label: 'Previous Address 1', type: 'textarea', width: 'full' }
    ]
};

const SECTION_CONTACT: FormSection = {
    id: 'contact_info',
    title: 'Contact Information',
    fields: [
        { id: 'daytime_phone', label: 'Daytime Telephone', type: 'tel', width: 'half' },
        { id: 'mobile_phone', label: 'Mobile Telephone', type: 'tel', width: 'half' },
        { id: 'email_address', label: 'Email Address', type: 'email', width: 'full' }
    ]
};

const SECTION_CRIMINAL: FormSection = {
    id: 'criminal_history',
    title: 'Criminal History & Security',
    fields: [
        { 
            id: 'criminal_arrested', 
            label: 'Have you EVER been arrested, cited, or detained?', 
            type: 'select', 
            options: ['No', 'Yes'], 
            width: 'full',
            fullQuestion: "Have you EVER been arrested, cited, charged, or detained for any reason by any law enforcement official?",
            contextHint: "Include traffic tickets if fine > $500 or involved drugs/alcohol."
        },
        { 
            id: 'criminal_details', 
            label: 'If Yes, provide details', 
            type: 'textarea', 
            width: 'full' 
        }
    ]
};

// --- Form Database ---

const FORMS_DATABASE: FormConfig[] = [
    // --- Family ---
    {
        id: 'i130', code: 'I-130', category: 'Family',
        title: 'Petition for Alien Relative',
        description: 'Establish relationship to relative.',
        sections: [
            { id: 'i130_p2', title: 'Part 2: Petitioner Info', fields: [...SECTION_BIOGRAPHICS.fields] },
            { id: 'i130_p4', title: 'Part 4: Beneficiary Info', fields: [
                { id: 'beneficiary_name_last', label: 'Beneficiary Last Name', type: 'text', width: 'half' },
                { id: 'beneficiary_name_first', label: 'Beneficiary First Name', type: 'text', width: 'half' },
                ...SECTION_ADDRESS_HISTORY.fields
            ]}
        ]
    },
    {
        id: 'i129f', code: 'I-129F', category: 'Family',
        title: 'Petition for Alien Fiancé(e)',
        description: 'Bring fiancé(e) to US (K-1 Visa).',
        sections: [SECTION_BIOGRAPHICS, SECTION_ADDRESS_HISTORY, {
            id: 'k1_specifics', title: 'Fiancé(e) Specifics', fields: [
                { id: 'met_in_person', label: 'Have you met in person in last 2 years?', type: 'select', options: ['Yes', 'No (Requesting Waiver)'], width: 'full' },
                { id: 'meeting_desc', label: 'Describe the meeting', type: 'textarea', width: 'full' }
            ]
        }]
    },
    { id: 'i130a', code: 'I-130A', category: 'Family', title: 'Supplemental Information for Spouse Beneficiary', description: 'Mandatory supplement for I-130 spousal petitions.', sections: [SECTION_BIOGRAPHICS, SECTION_ADDRESS_HISTORY] },
    
    // --- Green Card ---
    {
        id: 'i485', code: 'I-485', category: 'Green Card',
        title: 'Application to Register Permanent Residence',
        description: 'Apply for a Green Card inside the US.',
        sections: [SECTION_BIOGRAPHICS, SECTION_ADDRESS_HISTORY, SECTION_CRIMINAL]
    },
    { id: 'i90', code: 'I-90', category: 'Green Card', title: 'Application to Replace Permanent Resident Card', description: 'Renew or replace a Green Card.', sections: [SECTION_BIOGRAPHICS] },
    { id: 'i751', code: 'I-751', category: 'Green Card', title: 'Petition to Remove Conditions on Residence', description: 'For 2-year marriage based Green Cards.', sections: [SECTION_BIOGRAPHICS, {
        id: 'i751_basis', title: 'Basis for Petition', fields: [
            { id: 'joint_filing', label: 'Filing Type', type: 'select', options: ['Joint Filing', 'Waiver (Divorce)', 'Waiver (Abuse)'], width: 'full' }
        ]
    }]},

    // --- Employment ---
    { id: 'i765', code: 'I-765', category: 'Employment', title: 'Application for Employment Authorization', description: 'Request a Work Permit (EAD).', sections: [SECTION_BIOGRAPHICS, {
        id: 'ead_cat', title: 'Eligibility Category', fields: [
            { id: 'ead_category_code', label: 'Eligibility Category', type: 'text', placeholder: 'e.g., (c)(9)', width: 'full' }
        ]
    }]},
    { id: 'i140', code: 'I-140', category: 'Employment', title: 'Immigrant Petition for Alien Workers', description: 'Employer petition for foreign worker.', sections: [SECTION_BIOGRAPHICS] },
    { id: 'i129', code: 'I-129', category: 'Employment', title: 'Petition for a Nonimmigrant Worker', description: 'H-1B, L-1, O-1 petitions.', sections: [SECTION_BIOGRAPHICS] },

    // --- Humanitarian ---
    { id: 'i589', code: 'I-589', category: 'Humanitarian', title: 'Application for Asylum and for Withholding of Removal', description: 'Apply for asylum.', sections: [SECTION_BIOGRAPHICS, SECTION_ADDRESS_HISTORY, {
        id: 'asylum_basis', title: 'Basis of Asylum', fields: [
            { id: 'race_checked', label: 'Race', type: 'select', options: ['Yes', 'No'], width: 'half' },
            { id: 'religion_checked', label: 'Religion', type: 'select', options: ['Yes', 'No'], width: 'half' },
            { id: 'political_checked', label: 'Political Opinion', type: 'select', options: ['Yes', 'No'], width: 'half' },
            { id: 'social_checked', label: 'Membership in Particular Social Group', type: 'select', options: ['Yes', 'No'], width: 'half' },
            { id: 'fear_statement', label: 'Statement of Fear', type: 'textarea', width: 'full' }
        ]
    }]},
    { id: 'i821', code: 'I-821', category: 'Humanitarian', title: 'Application for Temporary Protected Status', description: 'TPS Application.', sections: [SECTION_BIOGRAPHICS] },
    { id: 'i918', code: 'I-918', category: 'Humanitarian', title: 'Petition for U Nonimmigrant Status', description: 'For victims of crime.', sections: [SECTION_BIOGRAPHICS, SECTION_CRIMINAL] },
    { id: 'i360', code: 'I-360', category: 'Humanitarian', title: 'Petition for Amerasian, Widow(er), or Special Immigrant', description: 'VAWA and Special Immigrants.', sections: [SECTION_BIOGRAPHICS] },

    // --- Citizenship ---
    { id: 'n400', code: 'N-400', category: 'Citizenship', title: 'Application for Naturalization', description: 'Apply for US Citizenship.', sections: [SECTION_BIOGRAPHICS, SECTION_ADDRESS_HISTORY, SECTION_CRIMINAL] },
    { id: 'n600', code: 'N-600', category: 'Citizenship', title: 'Application for Certificate of Citizenship', description: 'Proof of citizenship for children.', sections: [SECTION_BIOGRAPHICS] },
    { id: 'n565', code: 'N-565', category: 'Citizenship', title: 'Replacement Naturalization/Citizenship Document', description: 'Replace lost certificate.', sections: [SECTION_BIOGRAPHICS] },

    // --- Travel & Misc ---
    { id: 'i131', code: 'I-131', category: 'Misc', title: 'Application for Travel Document', description: 'Advance Parole, Re-entry Permit.', sections: [SECTION_BIOGRAPHICS, {
        id: 'travel_type', title: 'Travel Type', fields: [
            { id: 'travel_doc_type', label: 'Application Type', type: 'select', options: ['Re-entry Permit', 'Refugee Travel Doc', 'Advance Parole'], width: 'full' },
            { id: 'trip_date', label: 'Intended Date of Departure', type: 'date', width: 'half' },
            { id: 'trip_length', label: 'Expected Length of Trip', type: 'text', width: 'half' }
        ]
    }]},
    { id: 'i864', code: 'I-864', category: 'Misc', title: 'Affidavit of Support', description: 'Financial sponsorship form.', sections: [SECTION_BIOGRAPHICS, {
        id: 'financials', title: 'Financial Data', fields: [
            { id: 'sponsor_income', label: 'Current Individual Annual Income', type: 'text', width: 'half' },
            { id: 'household_size', label: 'Household Size', type: 'text', width: 'half' },
            { id: 'tax_year_1', label: 'Most Recent Tax Year Income', type: 'text', width: 'full' }
        ]
    }]},
    { id: 'i601', code: 'I-601', category: 'Misc', title: 'Waiver of Grounds of Inadmissibility', description: 'Waiver for inadmissibility.', sections: [SECTION_BIOGRAPHICS] },
    { id: 'i601a', code: 'I-601A', category: 'Misc', title: 'Provisional Unlawful Presence Waiver', description: 'Stateside waiver.', sections: [SECTION_BIOGRAPHICS] },
    { id: 'i912', code: 'I-912', category: 'Misc', title: 'Request for Fee Waiver', description: 'Waive filing fees.', sections: [SECTION_BIOGRAPHICS, {
        id: 'waiver_basis', title: 'Basis', fields: [
            { id: 'means_tested', label: 'Receiving Means-Tested Benefit?', type: 'select', options: ['Yes', 'No'], width: 'full' }
        ]
    }]}
];

// --- Components ---

interface SmartFieldProps {
  id: string;
  label: string | React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  onFocus: () => void;
  onBlur?: () => void;
  type?: string;
  placeholder?: string;
  validation?: ValidationResult;
  isValidating?: boolean;
  isActive?: boolean;
  width?: 'full' | 'half' | 'third';
  options?: string[];
}

const LegalTerm: React.FC<{ text: string }> = ({ text }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const definitionKey = Object.keys(LEGAL_DEFINITIONS).find(k => text.includes(k) || k.toLowerCase() === text.toLowerCase());
  const definition = definitionKey ? LEGAL_DEFINITIONS[definitionKey] : null;

  if (!definition) return <span>{text}</span>;

  return (
    <span 
      className="relative inline-block border-b-2 border-dashed border-indigo-400 cursor-help hover:bg-indigo-50 text-indigo-900 transition-colors mx-0.5 rounded px-0.5"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {text}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 pointer-events-none text-left leading-relaxed">
          <div className="font-bold mb-1 text-indigo-300 border-b border-indigo-500/30 pb-1">{definitionKey}</div>
          <div>{definition}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </span>
  );
};

const SmartInput: React.FC<SmartFieldProps> = ({ 
  id, label, value, onChange, onFocus, onBlur, type = "text", placeholder, validation, isValidating, isActive, width = 'full', options 
}) => {
  const { dir } = useLanguage();
  const widthClass = width === 'half' ? 'col-span-1' : width === 'third' ? 'col-span-1 lg:col-span-1' : 'col-span-2 lg:col-span-2';
  
  return (
    <div className={`mb-4 group relative transition-all duration-500 ${isActive ? 'scale-[1.02] z-10' : ''} ${widthClass}`}>
      <label htmlFor={id} className="block text-sm font-semibold mb-1.5 flex justify-between items-center transition-colors">
        <span className={`flex items-center gap-2 transition-colors duration-300 ${isActive ? 'text-indigo-600 font-bold' : 'text-slate-700'}`}>
            {typeof label === 'string' ? <LegalTerm text={label} /> : label}
            {isActive && <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />}
        </span>
        {isValidating && <span className="text-xs text-blue-500 flex items-center"><Loader2 className={`w-3 h-3 ${dir === 'rtl' ? 'ml-1' : 'mr-1'} animate-spin`}/> Checking...</span>}
      </label>
      
      <div className="relative">
        {type === 'select' ? (
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                className={`w-full p-3 rounded-xl border-2 transition-all duration-300 outline-none bg-white appearance-none
                    ${validation?.severity === 'error' ? 'border-red-300 bg-red-50 focus:border-red-500' : 
                    isActive ? 'border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-100' :
                    'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
                }`}
            >
                <option value="">Select...</option>
                {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        ) : type === 'textarea' ? (
            <textarea
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={placeholder}
                rows={3}
                className={`w-full p-3 rounded-xl border-2 transition-all duration-300 outline-none resize-none
                    ${isActive ? 'border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-100' :
                    'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
                }`}
            />
        ) : (
            <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            onClick={(e) => {
                if (type === 'date') {
                    try { (e.target as HTMLInputElement).showPicker(); } catch(err) {}
                }
            }}
            className={`w-full p-3 rounded-xl border-2 transition-all duration-300 outline-none 
                ${type === 'date' ? 'cursor-pointer' : ''}
                ${validation?.severity === 'error' ? 'border-red-300 bg-red-50 focus:border-red-500' : 
                validation?.severity === 'warning' ? 'border-amber-300 bg-amber-50 focus:border-amber-500' :
                validation?.severity === 'success' ? 'border-green-300 bg-green-50 focus:border-green-500' :
                isActive ? 'border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-100 shadow-xl shadow-indigo-100/50' :
                'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
                }`}
            />
        )}
        
        {type === 'date' && (
            <div className={`absolute ${dir === 'rtl' ? 'left-3' : 'right-3'} top-3.5 pointer-events-none text-slate-400`}>
                <CalendarIcon className="w-5 h-5" />
            </div>
        )}

        {validation && type !== 'date' && type !== 'textarea' && (
           <div className={`absolute ${dir === 'rtl' ? 'left-3' : 'right-3'} top-3.5 pointer-events-none`}>
             {validation.severity === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
             {validation.severity === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500" />}
             {validation.severity === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
           </div>
        )}
      </div>
      {validation && (validation.severity === 'error' || validation.severity === 'warning') && (
        <div className={`mt-2 text-xs p-2 rounded-lg flex items-start gap-2 animate-in slide-in-from-top-1 ${
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

// --- Main Form Assistant Component ---

export const FormAssistant: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const [selectedFormId, setSelectedFormId] = useState<string>('i130');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Master Profile: Stores all field values keyed by ID to enable Auto-Fill
  const [masterProfile, setMasterProfile] = useState<Record<string, string>>({
      'legal_name_last': '',
      'current_address_street': '', 
      'current_address_city': '',
      'current_address_state': '',
      'current_address_zip': '',
  });

  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [validations, setValidations] = useState<Record<string, ValidationResult>>({});
  const [validatingFields, setValidatingFields] = useState<Record<string, boolean>>({});
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [helperData, setHelperData] = useState<Record<string, FormFieldHelp>>({});
  const [loadingHelp, setLoadingHelp] = useState(false);

  // --- Feedback State ---
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clear feedback after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const currentForm = useMemo(() => 
    FORMS_DATABASE.find(f => f.id === selectedFormId) || FORMS_DATABASE[0],
  [selectedFormId]);

  const filteredForms = useMemo(() => 
    FORMS_DATABASE.filter(f => 
        f.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  [searchQuery]);

  // --- Handlers ---

  const handleInputChange = (fieldId: string, value: string) => {
    setMasterProfile(prev => ({ ...prev, [fieldId]: value }));
    setValidations(prev => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
    });
  };

  const handleBlur = async (field: FormField) => {
    const value = masterProfile[field.id];
    if (!value) return;

    setValidatingFields(prev => ({ ...prev, [field.id]: true }));
    
    // AI Validation
    try {
      const context = JSON.stringify(masterProfile);
      const label = field.fullQuestion || field.label;
      const result = await validateFormInput(label, value, context, language);
      
      setValidations(prev => ({ ...prev, [field.id]: result }));
    } catch (e: any) {
      console.error(e);
      setError("Failed to validate field.");
    } finally {
      setValidatingFields(prev => ({ ...prev, [field.id]: false }));
    }
  };

  const loadAiHelp = async (field: FormField) => {
    setLoadingHelp(true);
    try {
      const question = field.fullQuestion || field.label;
      const hint = field.contextHint || "";
      
      const data = await getFieldHelp(question, hint, language);
      setHelperData(prev => ({ ...prev, [field.id]: data }));
    } catch (e: any) {
      console.error(e);
      setError("Failed to load AI help.");
    } finally {
      setLoadingHelp(false);
    }
  };

  useEffect(() => {
    if (activeFieldId) {
        let foundField: FormField | undefined;
        for (const section of currentForm.sections) {
            foundField = section.fields.find(f => f.id === activeFieldId);
            if (foundField) break;
        }

        if (foundField) {
            const timer = setTimeout(() => {
                loadAiHelp(foundField!);
            }, 500);
            return () => clearTimeout(timer);
        }
    }
  }, [activeFieldId, language, selectedFormId]);

  const handleDownloadPDF = async () => {
      setIsGeneratingPdf(true);
      try {
          const pdfBytes = await generateSummaryPDF(masterProfile, currentForm.code + " " + currentForm.title);
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${currentForm.code}_Draft_Summary.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } catch (e) {
          console.error("PDF Gen Error", e);
          setError("Failed to generate PDF.");
      } finally {
          setIsGeneratingPdf(false);
      }
  };

  const handleClearForm = () => {
      if (window.confirm("Are you sure you want to clear all fields? This cannot be undone.")) {
          setMasterProfile({});
          setValidations({});
          setSuccessMsg("Form cleared successfully.");
      }
  };

  const handleSaveProgress = () => {
      // Mock saving to local storage or backend
      localStorage.setItem(`saved_form_${currentForm.id}`, JSON.stringify(masterProfile));
      setSuccessMsg("Progress saved successfully!");
  };

  const calculateProgress = () => {
      let totalFields = 0;
      let filledFields = 0;
      currentForm.sections.forEach(section => {
          section.fields.forEach(field => {
              totalFields++;
              if (masterProfile[field.id] && masterProfile[field.id].trim() !== '') {
                  filledFields++;
              }
          });
      });
      return totalFields === 0 ? 0 : Math.round((filledFields / totalFields) * 100);
  };

  const progressPercentage = calculateProgress();

  return (
    <div className="max-w-6xl mx-auto lg:h-[calc(100vh-8rem)] h-auto flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 lg:pb-0 relative">
      
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {error && (
            <div className="bg-red-50 text-red-800 border border-red-200 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm font-medium">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
        )}
        {successMsg && (
            <div className="bg-green-50 text-green-800 border border-green-200 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2">
              <Check className="w-5 h-5 text-green-500" />
              <p className="text-sm font-medium">{successMsg}</p>
              <button onClick={() => setSuccessMsg(null)} className="ml-auto text-green-400 hover:text-green-600">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
        )}
      </div>

      {/* LEFT COLUMN: The Form */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-8 overflow-y-visible lg:overflow-y-auto custom-scrollbar h-auto lg:h-full order-2 lg:order-1 flex flex-col">
        
        {/* Form Selector Header */}
        <div className="mb-8 border-b border-slate-100 pb-6 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-sm font-bold">
                    <LayoutTemplate className="w-4 h-4" /> Smart Auto-Fill Active
                </div>
                <div className="text-xs text-slate-400 font-mono">Profile ID: {Object.keys(masterProfile).filter(k => masterProfile[k]).length} Fields</div>
            </div>
            
            <div className="relative">
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Form to File</label>
                <div className="relative group">
                    <select 
                        value={selectedFormId}
                        onChange={(e) => setSelectedFormId(e.target.value)}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-lg text-slate-800 outline-none focus:border-blue-500 transition-colors cursor-pointer hover:bg-slate-100 appearance-none"
                    >
                        {filteredForms.map(form => (
                            <option key={form.id} value={form.id}>
                                {form.code} - {form.title}
                            </option>
                        ))}
                    </select>
                    {/* Visual Search Overlay (Optional enhancement) */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Filter className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Quick Search for Dropdown */}
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Filter forms list... (e.g. 'Employment', 'I-765')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 p-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                <h3 className="font-bold text-blue-900 text-sm mb-1">{currentForm.title}</h3>
                <p className="text-xs text-blue-800 opacity-80">{currentForm.description}</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Form Completion</span>
                    <span>{progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>
        </div>

        {/* Dynamic Form Sections */}
        <div className="flex-1">
            {currentForm.sections.map((section, idx) => (
                <div key={section.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-8 transition-colors duration-500">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                        <div className={`w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}>{idx + 1}</div>
                        {section.title}
                    </h3>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {section.fields.map(field => (
                            <SmartInput 
                                key={field.id}
                                id={field.id}
                                label={field.label}
                                type={field.type}
                                placeholder={field.placeholder}
                                options={field.options}
                                width={field.width}
                                value={masterProfile[field.id] || ''}
                                onChange={(v) => handleInputChange(field.id, v)}
                                onFocus={() => setActiveFieldId(field.id)}
                                onBlur={() => handleBlur(field)}
                                isActive={activeFieldId === field.id}
                                validation={validations[field.id]}
                                isValidating={validatingFields[field.id]}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-slate-100 flex-wrap">
            <button 
                onClick={handleClearForm}
                className="flex-1 sm:flex-none sm:w-auto bg-red-50 text-red-600 hover:bg-red-100 px-4 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
                <Trash2 className="w-4 h-4" />
                Clear
            </button>
            <button 
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="flex-1 sm:flex-none sm:w-auto bg-slate-100 text-slate-700 hover:bg-slate-200 px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
                {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download PDF
            </button>
            <button 
                onClick={handleSaveProgress}
                className="flex-1 sm:flex-none sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
                <Save className="w-4 h-4" />
                {t('saveContinue')}
            </button>
        </div>
      </div>

      {/* RIGHT COLUMN: The AI Copilot */}
      <div className="w-full lg:w-96 flex-shrink-0 flex flex-col gap-4 order-1 lg:order-2 mb-6 lg:mb-0">
        
        {/* Helper Card */}
        <div className={`bg-slate-900 rounded-2xl p-6 text-white shadow-xl flex-1 flex-col transition-all duration-500 border-2 ${activeFieldId ? 'border-indigo-400 shadow-indigo-500/20' : 'border-indigo-500/30'} ring-4 ring-indigo-500/10 min-h-[300px] lg:min-h-0 flex`}>
            <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-500 ${activeFieldId ? 'bg-indigo-400 text-slate-900' : 'bg-indigo-500 text-white'}`}>
                        <Wand2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-none">{t('aiHelper')}</h3>
                        {activeFieldId ? (
                            <p className="text-xs text-indigo-300 mt-1 animate-in fade-in">Smart Assist Active</p>
                        ) : (
                            <p className="text-xs text-slate-400 mt-1">Ready to assist</p>
                        )}
                    </div>
                </div>
                {activeFieldId && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/20 rounded text-[10px] font-bold text-indigo-200 border border-indigo-500/30 animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                        ACTIVE
                    </div>
                )}
            </div>

            {!helperData[activeFieldId || ''] && loadingHelp ? (
                <div className="flex-1 flex flex-col justify-center items-center text-center opacity-70">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-400" />
                    <p className="text-sm">{t('analyzeField')}</p>
                </div>
            ) : !helperData[activeFieldId || ''] ? (
                 <div className="flex-1 flex flex-col justify-center items-center text-center opacity-50">
                    <HelpCircle className="w-12 h-12 mb-4 text-indigo-400" />
                    <p className="text-sm">{t('focusField')}</p>
                </div>
            ) : (
                <div key={activeFieldId} className={`flex-1 overflow-y-auto custom-scrollbar p${dir === 'rtl' ? 'l' : 'r'}-2 space-y-6 animate-in slide-in-from-${dir === 'rtl' ? 'left' : 'right'}-2 fade-in duration-500`}>
                    {/* Translation */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-yellow-400" />
                            <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider">{t('whatMean')}</h4>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-200">
                            {helperData[activeFieldId || ''].plainEnglish}
                        </p>
                    </div>

                    {/* Risks */}
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <h4 className="text-xs font-bold text-red-200 uppercase tracking-wider">{t('commonTraps')}</h4>
                        </div>
                        <ul className="text-sm space-y-2 text-slate-300 list-disc list-inside">
                            {helperData[activeFieldId || ''].risks.map((risk, i) => (
                                <li key={i}>{risk}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Example */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider">{t('exampleAns')}</h4>
                            </div>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(helperData[activeFieldId || ''].example);
                                    setSuccessMsg("Example copied to clipboard!");
                                }}
                                className="text-xs text-indigo-300 hover:text-white transition-colors flex items-center gap-1 bg-indigo-500/20 px-2 py-1 rounded"
                            >
                                <Copy className="w-3 h-3" /> Copy
                            </button>
                        </div>
                        <div className={`bg-black/30 rounded-lg p-3 text-sm text-green-100 italic border-${dir === 'rtl' ? 'r' : 'l'}-2 border-green-500 font-mono`}>
                            "{helperData[activeFieldId || ''].example}"
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
                     <span className="text-slate-600">Auto-Filled Fields</span>
                     <span className="font-bold text-blue-600 flex items-center gap-1">
                        <Copy className="w-3 h-3" /> {Object.values(masterProfile).filter(v => v !== '').length}
                     </span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                     <span className="text-slate-600">{t('validationErrors')}</span>
                     <span className={`font-bold ${Object.values(validations).some((v: ValidationResult) => v.severity === 'error') ? 'text-red-600' : 'text-green-600'}`}>
                        {Object.values(validations).filter((v: ValidationResult) => v.severity === 'error').length}
                     </span>
                 </div>
             </div>
        </div>

      </div>

    </div>
  );
};