import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Download, 
  DollarSign, 
  Clock, 
  ExternalLink,
  FileText,
  Info,
  X,
  AlertTriangle
} from 'lucide-react';

interface USCISForm {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  fee: string;
  processingTime: string;
  downloadUrl: string;
  instructions: string[];
}

interface ProcessingTime {
  form: string;
  center: string;
  time: string;
  notes: string;
}

const FORMS_DB: USCISForm[] = [
    // Family Based
    {
        id: 'i130',
        code: 'I-130',
        title: 'Petition for Alien Relative',
        description: 'Use this form if you are a U.S. citizen or lawful permanent resident (LPR) and you need to establish your relationship to an eligible relative who wishes to come to or remain in the United States permanently and get a Green Card.',
        category: 'FAMILY',
        fee: '$675 (Paper) / $625 (Online)',
        processingTime: '10-14 months',
        downloadUrl: 'https://www.uscis.gov/i-130',
        instructions: [
            'Verify your eligibility as a petitioner.',
            'Provide evidence of your U.S. citizenship or LPR status.',
            'Submit proof of relationship (birth/marriage certs).',
            'Submit proof of bona fide marriage if applicable.'
        ]
    },
    {
        id: 'i129f',
        code: 'I-129F',
        title: 'Petition for Alien Fiancé(e)',
        description: 'Use this form to petition to bring your fiancé(e) (K-1) and their children (K-2) to the U.S. so you may marry your fiancé(e), or to bring your spouse (K-3) and their children (K-4) to the U.S. to apply for lawful permanent resident status.',
        category: 'FAMILY',
        fee: '$675',
        processingTime: '12-16 months',
        downloadUrl: 'https://www.uscis.gov/i-129f',
        instructions: [
            'Provide proof of U.S. citizenship.',
            'Provide evidence you met in person within 2 years.',
            'Submit statements of intent to marry within 90 days.',
            'Provide proof that previous marriages ended.'
        ]
    },
    // Green Card / Adjustment
    {
        id: 'i485',
        code: 'I-485',
        title: 'Application to Register Permanent Residence',
        description: 'Use this form to apply for lawful permanent resident status if you are in the United States.',
        category: 'GREEN CARD',
        fee: '$1,440',
        processingTime: '8-22 months',
        downloadUrl: 'https://www.uscis.gov/i-485',
        instructions: [
            'Determine your eligibility category.',
            'Complete medical examination (Form I-693).',
            'Submit Affidavit of Support (Form I-864) if required.',
            'Attend biometrics and interview.'
        ]
    },
    {
        id: 'i90',
        code: 'I-90',
        title: 'Application to Replace Permanent Resident Card',
        description: 'Use this form to replace your Permanent Resident Card (Green Card).',
        category: 'GREEN CARD',
        fee: '$465',
        processingTime: '8-10 months',
        downloadUrl: 'https://www.uscis.gov/i-90',
        instructions: [
            'Select the reason for filing (lost, expired, incorrect info).',
            'Provide a copy of your prior card or ID.',
            'Submit name change documents if applicable.'
        ]
    },
    {
        id: 'i751',
        code: 'I-751',
        title: 'Petition to Remove Conditions on Residence',
        description: 'Use this form if you are a conditional permanent resident who obtained status through marriage and want to apply to remove the conditions on your permanent resident status.',
        category: 'GREEN CARD',
        fee: '$750',
        processingTime: '20-30 months',
        downloadUrl: 'https://www.uscis.gov/i-751',
        instructions: [
            'File jointly with your spouse within the 90-day window before card expires.',
            'Submit evidence of the relationship during the past 2 years (leases, bank accounts, photos).',
            'Include children if they received status at the same time.'
        ]
    },
    // Citizenship
    {
        id: 'n400',
        code: 'N-400',
        title: 'Application for Naturalization',
        description: 'Use this form to apply for U.S. citizenship.',
        category: 'CITIZENSHIP',
        fee: '$760 (Paper) / $710 (Online)',
        processingTime: '8-12 months',
        downloadUrl: 'https://www.uscis.gov/n-400',
        instructions: [
            'Verify you meet continuous residence and physical presence requirements.',
            'Demonstrate good moral character.',
            'Prepare for Civics and English tests.',
            'Submit 5 years of address and employment history.'
        ]
    },
    {
        id: 'n600',
        code: 'N-600',
        title: 'Application for Certificate of Citizenship',
        description: 'Use this form to apply for a Certificate of Citizenship.',
        category: 'CITIZENSHIP',
        fee: '$1,385 (Paper) / $1,335 (Online)',
        processingTime: '6-14 months',
        downloadUrl: 'https://www.uscis.gov/n-600',
        instructions: [
            'Provide proof of parent\'s U.S. citizenship.',
            'Provide proof of legal custody and physical presence.',
            'Submit birth certificates establishing relationship.'
        ]
    },
    {
        id: 'n565',
        code: 'N-565',
        title: 'Replacement Naturalization Document',
        description: 'Use this form to apply for a replacement Declaration of Intention; Naturalization Certificate; Certificate of Citizenship; or Repatriation Certificate.',
        category: 'CITIZENSHIP',
        fee: '$555',
        processingTime: '6-10 months',
        downloadUrl: 'https://www.uscis.gov/n-565',
        instructions: [
            'Submit two passport-style photos.',
            'Submit the damaged certificate if applicable.',
            'Provide proof of name change if requesting a new name.'
        ]
    },
    // Employment
    {
        id: 'i765',
        code: 'I-765',
        title: 'Application for Employment Authorization',
        description: 'Certain foreign nationals who are in the United States may file Form I-765 to request employment authorization (EAD).',
        category: 'EMPLOYMENT',
        fee: '$520 (Paper) / $470 (Online)',
        processingTime: '3-7 months',
        downloadUrl: 'https://www.uscis.gov/i-765',
        instructions: [
            'Select your eligibility category (e.g., c(9)).',
            'Submit 2 passport-style photos.',
            'Provide copy of previous EAD if renewal.'
        ]
    },
    {
        id: 'i140',
        code: 'I-140',
        title: 'Immigrant Petition for Alien Workers',
        description: 'Use this form to ask USCIS to classify an alien as someone who is eligible for an immigrant visa based on employment.',
        category: 'EMPLOYMENT',
        fee: '$715',
        processingTime: '4-8 months',
        downloadUrl: 'https://www.uscis.gov/i-140',
        instructions: [
            'Provide labor certification if required.',
            'Submit evidence of ability to pay wage.',
            'Submit evidence of qualifications (degrees, experience letters).'
        ]
    },
    {
        id: 'i129',
        code: 'I-129',
        title: 'Petition for a Nonimmigrant Worker',
        description: 'Use this form to petition for a nonimmigrant worker to come to the United States temporarily to perform services or labor (H-1B, L-1, O-1).',
        category: 'EMPLOYMENT',
        fee: '$460 - $1685',
        processingTime: '2-6 months',
        downloadUrl: 'https://www.uscis.gov/i-129',
        instructions: [
            'Submit correct supplement for visa classification.',
            'Include duplicate copies if consular processing is needed.',
            'Submit filing fees.'
        ]
    },
    // Humanitarian / Waivers
    {
        id: 'i589',
        code: 'I-589',
        title: 'Application for Asylum',
        description: 'Use this form to apply for asylum in the United States and for withholding of removal.',
        category: 'HUMANITARIAN',
        fee: '$0',
        processingTime: 'Varies widely',
        downloadUrl: 'https://www.uscis.gov/i-589',
        instructions: [
            'Submit within 1 year of arrival in the U.S.',
            'Provide detailed statement of fear/persecution.',
            'Include country conditions reports.',
            'Submit one original and one copy.'
        ]
    },
    {
        id: 'i821',
        code: 'I-821',
        title: 'Application for Temporary Protected Status',
        description: 'Nationals of certain countries with TPS designation can use this form to apply for Temporary Protected Status.',
        category: 'HUMANITARIAN',
        fee: '$50 (Form) + $85 (Biometrics)',
        processingTime: '6-9 months',
        downloadUrl: 'https://www.uscis.gov/i-821',
        instructions: [
            'Prove nationality of TPS-designated country.',
            'Prove date of entry and continuous residence.',
            'Submit I-765 if you want a work permit.'
        ]
    },
    {
        id: 'i601',
        code: 'I-601',
        title: 'Waiver of Grounds of Inadmissibility',
        description: 'Use this form to seek a waiver of grounds of inadmissibility if you are inadmissible to the United States.',
        category: 'WAIVERS',
        fee: '$1,050',
        processingTime: '12-16 months',
        downloadUrl: 'https://www.uscis.gov/i-601',
        instructions: [
            'Establish qualifying relative (USC/LPR spouse or parent).',
            'Prove "Extreme Hardship" to the qualifying relative.',
            'Include detailed affidavits and medical/financial evidence.'
        ]
    },
    {
        id: 'i601a',
        code: 'I-601A',
        title: 'Provisional Unlawful Presence Waiver',
        description: 'Request a provisional unlawful presence waiver before leaving the United States for a consular interview.',
        category: 'WAIVERS',
        fee: '$795',
        processingTime: '30-40 months',
        downloadUrl: 'https://www.uscis.gov/i-601a',
        instructions: [
            'Must have an approved I-130 petition.',
            'Must prove extreme hardship to USC spouse or parent.',
            'Must be physically present in the US to file.'
        ]
    },
    // Misc
    {
        id: 'i131',
        code: 'I-131',
        title: 'Application for Travel Document',
        description: 'Apply for a Re-entry Permit, Refugee Travel Document, or Advance Parole travel document.',
        category: 'TRAVEL',
        fee: '$630',
        processingTime: '6-12 months',
        downloadUrl: 'https://www.uscis.gov/i-131',
        instructions: [
            'Specify type of travel document (Re-entry, Advance Parole).',
            'Provide photos and photo ID.',
            'Explain purpose of trip if required.'
        ]
    },
    {
        id: 'i864',
        code: 'I-864',
        title: 'Affidavit of Support',
        description: 'Show that the applying immigrant has adequate means of financial support and is not likely to become a public charge.',
        category: 'SUPPORT',
        fee: '$0',
        processingTime: 'N/A',
        downloadUrl: 'https://www.uscis.gov/i-864',
        instructions: [
            'Sponsor must verify income meets 125% of poverty guidelines.',
            'Submit recent tax transcripts (W2/1040).',
            'Submit proof of U.S. status.'
        ]
    },
    {
        id: 'i134',
        code: 'I-134',
        title: 'Declaration of Financial Support',
        description: 'Use this form to provide financial support to a beneficiary of certain immigration benefits (like K1 Visa or Parole).',
        category: 'SUPPORT',
        fee: '$0',
        processingTime: 'N/A',
        downloadUrl: 'https://www.uscis.gov/i-134',
        instructions: [
            'Provide evidence of income (bank statements, employer letter).',
            'Verify asset values if used.',
            'Sign and notarize if required.'
        ]
    },
    {
        id: 'i539',
        code: 'I-539',
        title: 'Extend/Change Nonimmigrant Status',
        description: 'Apply for an extension of stay or a change from one nonimmigrant category to another.',
        category: 'NONIMMIGRANT',
        fee: '$470 (Online) / $420 (Paper)',
        processingTime: '3-9 months',
        downloadUrl: 'https://www.uscis.gov/i-539',
        instructions: [
            'File before current status expires.',
            'Provide written statement explaining reason for extension.',
            'Submit evidence of financial support during stay.'
        ]
    },
    {
        id: 'i912',
        code: 'I-912',
        title: 'Request for Fee Waiver',
        description: 'Request a fee waiver for certain immigration forms and services based on a demonstrated inability to pay.',
        category: 'MISC',
        fee: '$0',
        processingTime: 'Concurrent',
        downloadUrl: 'https://www.uscis.gov/i-912',
        instructions: [
            'Prove receipt of means-tested benefits (Medicaid, SNAP).',
            'Or prove income is at or below 150% of poverty guidelines.',
            'Or prove financial hardship.'
        ]
    }
];

const PROCESSING_TIMES: ProcessingTime[] = [
    { form: 'I-130 (Spouse of USC)', center: 'Nebraska', time: '14.5 Months', notes: 'Consular processing path' },
    { form: 'I-130 (Spouse of USC)', center: 'Potomac', time: '12 Months', notes: 'Consular processing path' },
    { form: 'I-485 (Family Based)', center: 'NYC Field Office', time: '18 Months', notes: 'Includes interview' },
    { form: 'N-400', center: 'Los Angeles', time: '8 Months', notes: 'Citizenship' },
    { form: 'I-765', center: 'National Benefits', time: '3.5 Months', notes: 'Work Permit' },
    { form: 'I-129F', center: 'California', time: '15.5 Months', notes: 'K-1 Visa' },
    { form: 'I-751', center: 'Vermont', time: '24 Months', notes: 'Removing Conditions' },
    { form: 'I-589', center: 'Affirmative Asylum', time: 'Varies', notes: 'Can exceed 2 years' },
    { form: 'I-601A', center: 'Potomac', time: '40 Months', notes: 'Provisional Waiver' }
];

export const KnowledgeCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'forms' | 'fees' | 'times'>('forms');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForm, setSelectedForm] = useState<USCISForm | null>(null);

  const filteredForms = FORMS_DB.filter(f => 
      f.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
      f.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in pb-20 relative">
      <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-3 flex items-center justify-center gap-3">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              USCIS Knowledge Center
          </h1>
          <p className="text-slate-500">
              Official resources, forms, fee schedules, and processing times. 
              Always 100% free and up-to-date.
          </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
          <div className="bg-slate-100 p-1 rounded-xl inline-flex shadow-inner">
              <button 
                onClick={() => setActiveTab('forms')}
                className={`px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'forms' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <FileText className="w-4 h-4" /> Official Forms
              </button>
              <button 
                onClick={() => setActiveTab('fees')}
                className={`px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'fees' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <DollarSign className="w-4 h-4" /> Fee Schedule
              </button>
              <button 
                onClick={() => setActiveTab('times')}
                className={`px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'times' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <Clock className="w-4 h-4" /> Process Times
              </button>
          </div>
      </div>

      {/* Content Area */}
      {activeTab === 'forms' && (
          <div className="space-y-6">
              {/* Search */}
              <div className="relative max-w-lg mx-auto">
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search form (e.g., I-765, Waiver, Green Card...)"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                  />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredForms.map((form) => (
                      <div key={form.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group flex flex-col">
                          {/* Header */}
                          <div className="flex justify-between items-start mb-2">
                              <span className="text-xl font-bold text-blue-700">
                                  {form.code}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                  {form.category}
                              </span>
                          </div>
                          
                          {/* Title & Desc */}
                          <h3 className="font-bold text-slate-900 text-lg mb-2 leading-tight">
                              {form.title}
                          </h3>
                          <p className="text-sm text-slate-500 mb-6 line-clamp-3">
                              {form.description}
                          </p>
                          
                          {/* Processing Time Block */}
                          <div className="bg-slate-50 rounded-xl p-4 mb-6">
                              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Processing Time</p>
                              <p className="text-lg font-bold text-slate-800">{form.processingTime}</p>
                          </div>

                          <div className="mt-auto">
                            {/* Divider */}
                            <div className="h-px bg-slate-100 mb-4"></div>

                            {/* Fee */}
                            <div className="flex items-center gap-1 text-slate-700 mb-4">
                                <span className="text-sm">Fee:</span>
                                <span className="text-lg font-bold text-slate-900">{form.fee.split('/')[0].trim()}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <a 
                                    href={form.downloadUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Download className="w-4 h-4" /> Download
                                </a>
                                <button 
                                    onClick={() => setSelectedForm(form)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Info className="w-4 h-4" /> Instructions
                                </button>
                            </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {activeTab === 'fees' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl mx-auto">
              <div className="bg-slate-900 p-6 text-white">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-green-400" /> 
                      Common Filing Fees (2024/2025)
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">Fees are subject to change. Last updated: Oct 2024.</p>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                          <tr>
                              <th className="p-4 font-bold">Form</th>
                              <th className="p-4 font-bold">Description</th>
                              <th className="p-4 font-bold">Paper Filing</th>
                              <th className="p-4 font-bold">Online Filing</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {FORMS_DB.map((form) => (
                              <tr key={form.id} className="hover:bg-slate-50">
                                  <td className="p-4 font-bold text-slate-900">{form.code}</td>
                                  <td className="p-4 text-slate-600">{form.title}</td>
                                  <td className="p-4 font-mono font-medium">{form.fee.split('/')[0].replace('(Paper)', '').trim()}</td>
                                  <td className="p-4 font-mono font-medium text-green-600">
                                      {form.fee.includes('/') ? form.fee.split('/')[1].replace('(Online)', '').trim() : '-'}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'times' && (
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {PROCESSING_TIMES.map((proc, idx) => (
                      <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded text-sm">{proc.form}</span>
                              <span className="text-2xl font-bold text-slate-900">{proc.time}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-700 mb-1">{proc.center}</p>
                          <p className="text-xs text-slate-500">{proc.notes}</p>
                      </div>
                  ))}
              </div>
              
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                  <h3 className="font-bold text-slate-900 text-lg mb-2">Need a precise prediction?</h3>
                  <p className="text-slate-500 mb-6 max-w-lg mx-auto">
                      General averages don't account for your specific case history, RFEs, or country of origin. Use our AI Strategy Advisor for a tailored timeline.
                  </p>
                  <a href="#" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline">
                      Go to Strategy Advisor <ExternalLink className="w-4 h-4" />
                  </a>
              </div>
          </div>
      )}

      {/* Instruction Modal */}
      {selectedForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                      <div>
                          <h3 className="text-xl font-bold text-blue-700 mb-1">{selectedForm.code} - {selectedForm.title}</h3>
                      </div>
                  </div>
                  
                  <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                      <div>
                          <p className="text-sm text-slate-500 mb-1 font-bold">Description:</p>
                          <p className="text-slate-700">{selectedForm.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <p className="text-sm text-slate-500 mb-1 font-bold">Fee:</p>
                              <p className="text-slate-900 font-medium">{selectedForm.fee}</p>
                          </div>
                          <div>
                               <p className="text-sm text-slate-500 mb-1 font-bold">Processing Time:</p>
                               <p className="text-slate-900 font-medium">{selectedForm.processingTime}</p>
                          </div>
                      </div>

                      <div>
                          <p className="text-sm text-slate-500 mb-3 font-bold">Instructions:</p>
                          <ul className="space-y-2">
                              {selectedForm.instructions.map((inst, i) => (
                                  <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-1.5 shrink-0"></span>
                                      {inst}
                                  </li>
                              ))}
                          </ul>
                      </div>

                      <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span className="font-medium">Important: Always use the latest form edition from USCIS.gov to avoid rejection.</span>
                      </div>
                  </div>

                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                      <a 
                         href={selectedForm.downloadUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
                      >
                          <Download className="w-4 h-4" /> Download Form
                      </a>
                      <button 
                        onClick={() => setSelectedForm(null)}
                        className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                      >
                          Close
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};