import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { generateCoverLetter } from '../services/geminiService';
import { 
  PenTool, 
  Loader2, 
  CheckCircle2, 
  Download, 
  Copy, 
  ArrowRight,
  FileText,
  Building,
  User,
  Files,
  Trash2,
  PlusCircle,
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface EvidenceCategory {
  category: string;
  items: string[];
}

export const LetterGenerator: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
      petitioner: '',
      petitionerStatus: 'US Citizen',
      beneficiary: '',
      formType: 'I-130 Petition for Alien Relative',
      serviceCenter: 'USCIS Phoenix Lockbox',
  });
  
  const [categories, setCategories] = useState<EvidenceCategory[]>([
      { category: "Petitioner's Status", items: [''] },
      { category: "Proof of Relationship", items: [''] },
      { category: "Bona Fide Marriage Evidence", items: [''] }
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [letter, setLetter] = useState('');

  // Dynamic Label Helpers
  const isPetition = formData.formType.startsWith('I-');
  const isStatement = formData.formType.includes('Statement') || formData.formType.includes('Declaration');
  const isReference = formData.formType.includes('Reference') || formData.formType.includes('Support');
  const isInquiry = formData.formType.includes('Congress');

  const senderLabel = isPetition ? "Petitioner Name" : isReference ? "Writer Name (Supporter)" : isStatement ? "Applicant Name" : "Sender Name";
  const recipientLabel = isReference ? "Applicant/Beneficiary Name" : isPetition ? "Beneficiary Name" : isStatement ? "Subject Name" : "Beneficiary Name";
  const statusLabel = isReference ? "Writer's Relationship/Title" : "Petitioner Status";

  // Pre-fill categories based on form type
  useEffect(() => {
      // --- Standard Petitions ---
      if (formData.formType.includes('I-130')) {
          setCategories([
              { category: "Proof of Petitioner's Status", items: ['Birth Certificate', 'Naturalization Certificate'] },
              { category: "Proof of Relationship", items: ['Marriage Certificate'] },
              { category: "Bona Fide Marriage Evidence", items: ['Joint Lease', 'Joint Bank Account Statement', 'Family Photos'] },
              { category: "Beneficiary's Identity", items: ['Passport Copy'] }
          ]);
      } else if (formData.formType.includes('I-129F')) {
          setCategories([
               { category: "Proof of Citizenship", items: ['U.S. Passport'] },
               { category: "Proof of Meeting in Person", items: ['Airline Tickets', 'Hotel Receipts', 'Photos together'] },
               { category: "Intent to Marry", items: ['Letters of Intent (Petitioner & Beneficiary)'] }
          ]);
      } else if (formData.formType.includes('I-485')) {
          setCategories([
              { category: "Eligibility Evidence", items: ['I-130 Approval Notice', 'I-94 Arrival Record'] },
              { category: "Identity Documents", items: ['Birth Certificate', 'Passport Page'] },
              { category: "Medical & Support", items: ['Form I-693 (Sealed)', 'Form I-864 Affidavit of Support'] }
          ]);
      
      // --- Waivers & Hardship ---
      } else if (formData.formType.includes('Hardship')) {
          setCategories([
              { category: "Qualifying Relative's Medical Issues", items: ['Doctor Letters', 'Medical Records', 'Prescription Lists'] },
              { category: "Financial Impact", items: ['Mortgage Statements', 'Tax Returns', 'Loss of Income Projection'] },
              { category: "Psychological Impact", items: ['Psychological Evaluation', 'Therapist Letter'] },
              { category: "Country Conditions", items: ['State Dept Reports', 'News Articles'] }
          ]);

      // --- Support Letters ---
      } else if (formData.formType.includes('Character Reference')) {
          setCategories([
              { category: "Relationship Context", items: ['How we met', 'Length of friendship'] },
              { category: "Moral Character Examples", items: ['Community Service', 'Reliability at Work', 'Family Dedication'] },
              { category: "Integration", items: ['English fluency', 'Community ties'] }
          ]);
      } else if (formData.formType.includes('Employer Support')) {
          setCategories([
              { category: "Company Details", items: ['Business License', 'Annual Revenue'] },
              { category: "Position Details", items: ['Job Offer Letter', 'Role Description'] },
              { category: "Candidate Qualifications", items: ['Degrees', 'Certifications', 'Past Experience'] }
          ]);
      
      // --- Statements & Inquiries ---
      } else if (formData.formType.includes('Asylum')) {
          setCategories([
              { category: "Protected Ground", items: ['Political Opinion', 'Religion', 'Social Group'] },
              { category: "Past Persecution", items: ['Police Reports', 'Medical Records of Injury', 'Witness Statements'] },
              { category: "Fear of Future Harm", items: ['Threatening Messages', 'Country Condition Reports'] }
          ]);
      } else if (formData.formType.includes('Congress')) {
          setCategories([
              { category: "Case History", items: ['Receipt Notices', 'Processing Time Screenshots'] },
              { category: "Impact of Delay", items: ['Job Loss Letter', 'Medical Urgent Need'] },
              { category: "Privacy Release", items: ['Signed Congressional Privacy Release Form'] }
          ]);
      }
  }, [formData.formType]);

  const handleEvidenceChange = (catIndex: number, itemIndex: number, value: string) => {
      const newCats = [...categories];
      newCats[catIndex].items[itemIndex] = value;
      setCategories(newCats);
  };

  const addItem = (catIndex: number) => {
      const newCats = [...categories];
      newCats[catIndex].items.push('');
      setCategories(newCats);
  };

  const removeItem = (catIndex: number, itemIndex: number) => {
      const newCats = [...categories];
      newCats[catIndex].items.splice(itemIndex, 1);
      setCategories(newCats);
  };

  const handleGenerate = async () => {
      setIsGenerating(true);
      try {
          // Filter out empty items
          const cleanedCategories = categories.map(c => ({
              category: c.category,
              items: c.items.filter(i => i.trim() !== '')
          })).filter(c => c.items.length > 0);

          const result = await generateCoverLetter({
              petitioner: formData.petitioner,
              petitionerStatus: formData.petitionerStatus,
              beneficiary: formData.beneficiary,
              formType: formData.formType,
              serviceCenter: formData.serviceCenter,
              evidenceCategories: cleanedCategories
          }, language);
          setLetter(result);
          setStep(3);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGenerating(false);
      }
  };

  const handleReset = () => {
      if (window.confirm("Are you sure you want to delete this form and start over? All progress will be lost.")) {
          setStep(1);
          setFormData({
              petitioner: '',
              petitionerStatus: 'US Citizen',
              beneficiary: '',
              formType: 'I-130 Petition for Alien Relative',
              serviceCenter: 'USCIS Phoenix Lockbox',
          });
          setLetter('');
      }
  };

  const handleDownloadFinal = () => {
      const element = document.createElement("a");
      const file = new Blob([letter], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `Letter_${formData.formType.split(' ')[0]}_${formData.beneficiary.replace(/\s+/g, '_') || 'Draft'}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  };

  const handleCopy = () => {
      navigator.clipboard.writeText(letter);
      alert("Letter copied to clipboard!");
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="text-center mb-10 relative">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
             <PenTool className="w-8 h-8 text-blue-600" /> AI Legal Letter Builder
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto">Create professional cover letters, hardship waivers, and support statements tailored to USCIS requirements.</p>
          
          <button 
            onClick={handleReset}
            className="absolute top-0 right-0 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
            title="Clear form and start over"
          >
              <Trash2 className="w-4 h-4" /> Start Over
          </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
          {/* Sidebar Steps */}
          <div className="bg-slate-50 border-r border-slate-100 p-8 w-full md:w-72 flex-shrink-0">
              <div className="space-y-8 relative">
                   {/* Vertical Line */}
                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200 hidden md:block" style={{ zIndex: 0 }}></div>

                  <div className={`relative z-10 flex items-center gap-4 ${step === 1 ? 'text-blue-600' : 'text-slate-500'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all ${step === 1 ? 'bg-blue-600 text-white scale-110' : step > 1 ? 'bg-green-500 text-white' : 'bg-white border-2 border-slate-300'}`}>
                          {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                      </div>
                      <div>
                          <span className="font-bold text-sm block">Case Details</span>
                          <span className="text-xs opacity-70">Type & Parties</span>
                      </div>
                  </div>

                  <div className={`relative z-10 flex items-center gap-4 ${step === 2 ? 'text-blue-600' : 'text-slate-500'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all ${step === 2 ? 'bg-blue-600 text-white scale-110' : step > 2 ? 'bg-green-500 text-white' : 'bg-white border-2 border-slate-300'}`}>
                          {step > 2 ? <CheckCircle2 className="w-5 h-5" /> : '2'}
                      </div>
                      <div>
                          <span className="font-bold text-sm block">Evidence/Points</span>
                          <span className="text-xs opacity-70">Key Arguments</span>
                      </div>
                  </div>

                  <div className={`relative z-10 flex items-center gap-4 ${step === 3 ? 'text-blue-600' : 'text-slate-500'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all ${step === 3 ? 'bg-blue-600 text-white scale-110' : 'bg-white border-2 border-slate-300'}`}>
                          3
                      </div>
                      <div>
                          <span className="font-bold text-sm block">Review & Export</span>
                          <span className="text-xs opacity-70">Final Polish</span>
                      </div>
                  </div>
              </div>

              {step === 1 && (
                  <div className="mt-12 bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-800 leading-relaxed">
                      <strong>Tip:</strong> Accurate details help the AI establish the correct legal tone (e.g., "Respectfully Submitted" for petitions vs "To Whom It May Concern" for reference letters).
                  </div>
              )}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 md:p-12 relative flex flex-col">
              {step === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4">
                      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                          <Building className="w-6 h-6 text-slate-400" /> Letter Configuration
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                               <label className="block text-sm font-bold text-slate-700 mb-2">Document Type</label>
                               <select 
                                    value={formData.formType}
                                    onChange={(e) => setFormData(prev => ({...prev, formType: e.target.value}))}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white"
                                >
                                    <optgroup label="Standard Petitions (Cover Letters)">
                                        <option value="I-130 Petition for Alien Relative">I-130 Petition for Alien Relative</option>
                                        <option value="I-129F Petition for Alien Fiancé(e)">I-129F Petition for Alien Fiancé(e)</option>
                                        <option value="I-485 Adjustment of Status">I-485 Adjustment of Status</option>
                                        <option value="I-751 Petition to Remove Conditions">I-751 Petition to Remove Conditions</option>
                                    </optgroup>
                                    <optgroup label="Waivers & Hardship">
                                        <option value="Extreme Hardship Letter (I-601/I-601A)">Extreme Hardship Letter (I-601/I-601A)</option>
                                    </optgroup>
                                    <optgroup label="Support & Reference">
                                        <option value="Character Reference Support Letter">Character Reference / Good Moral Character</option>
                                        <option value="Employment Recommendation/Support Letter">Employment Recommendation Letter</option>
                                        <option value="Letter of Support for Family Member">Letter of Support for Family Member</option>
                                    </optgroup>
                                    <optgroup label="Statements & Inquiries">
                                        <option value="Asylum Personal Statement">Asylum Personal Statement / Declaration</option>
                                        <option value="Congressional Inquiry for Case Delay">Congressional Inquiry (Case Delay)</option>
                                        <option value="Bona Fide Marriage Statement">Bona Fide Marriage Statement</option>
                                    </optgroup>
                                </select>
                          </div>

                          <div className="md:col-span-2">
                              <label className="block text-sm font-bold text-slate-700 mb-2">
                                  {isInquiry ? "Congressman/Senator Office Address" : "USCIS Filing Address / Recipient"}
                              </label>
                              <input 
                                value={formData.serviceCenter}
                                onChange={(e) => setFormData(prev => ({...prev, serviceCenter: e.target.value}))}
                                placeholder={isInquiry ? "Office of Senator [Name], [Address]" : "e.g. USCIS, Attn: I-130, P.O. Box 21700, Phoenix, AZ 85036"}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white"
                              />
                          </div>

                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">{senderLabel}</label>
                              <div className="relative">
                                <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                <input 
                                    value={formData.petitioner}
                                    onChange={(e) => setFormData(prev => ({...prev, petitioner: e.target.value}))}
                                    placeholder="Full Legal Name"
                                    className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white"
                                />
                              </div>
                          </div>

                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">{statusLabel}</label>
                              {isPetition ? (
                                <select 
                                    value={formData.petitionerStatus}
                                    onChange={(e) => setFormData(prev => ({...prev, petitionerStatus: e.target.value}))}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white"
                                >
                                    <option value="US Citizen">U.S. Citizen</option>
                                    <option value="Lawful Permanent Resident">Lawful Permanent Resident (Green Card Holder)</option>
                                </select>
                              ) : (
                                <input 
                                    value={formData.petitionerStatus}
                                    onChange={(e) => setFormData(prev => ({...prev, petitionerStatus: e.target.value}))}
                                    placeholder={isReference ? "e.g. Friend, Employer, Pastor" : "e.g. Applicant"}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white"
                                />
                              )}
                          </div>

                          <div className="md:col-span-2">
                              <label className="block text-sm font-bold text-slate-700 mb-2">{recipientLabel}</label>
                              <div className="relative">
                                <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                <input 
                                    value={formData.beneficiary}
                                    onChange={(e) => setFormData(prev => ({...prev, beneficiary: e.target.value}))}
                                    placeholder="Full Legal Name"
                                    className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white"
                                />
                              </div>
                          </div>
                      </div>

                      <div className="pt-8 flex justify-end mt-auto">
                          <button 
                            onClick={() => setStep(2)}
                            disabled={!formData.petitioner || !formData.beneficiary}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-blue-200"
                          >
                              Next: {isStatement ? 'Key Points' : 'Evidence List'} <ArrowRight className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
              )}

              {step === 2 && (
                   <div className="space-y-6 animate-in slide-in-from-right-4 flex-1 flex flex-col">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <Files className="w-6 h-6 text-slate-400" /> {isStatement ? "Key Details to Include" : "Evidence Index"}
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">
                            {isStatement 
                                ? "List the specific details you want the AI to narrate in the statement." 
                                : "Group your documents by category. This structure creates the 'Exhibit List' in your letter."}
                        </p>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                          {categories.map((cat, catIdx) => (
                              <div key={catIdx} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                  <div className="flex justify-between items-center mb-3">
                                      <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                          <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded">
                                              {isStatement ? `Section ${catIdx + 1}` : `Exhibit ${String.fromCharCode(65 + catIdx)}`}
                                          </span>
                                          <input 
                                            value={cat.category}
                                            onChange={(e) => {
                                                const newCats = [...categories];
                                                newCats[catIdx].category = e.target.value;
                                                setCategories(newCats);
                                            }}
                                            className="bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 outline-none px-1"
                                          />
                                      </h3>
                                      <button 
                                        onClick={() => {
                                            const newCats = [...categories];
                                            newCats.splice(catIdx, 1);
                                            setCategories(newCats);
                                        }}
                                        className="text-slate-400 hover:text-red-500"
                                        title="Remove Category"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </div>
                                  
                                  <div className="space-y-2 pl-4 border-l-2 border-slate-200">
                                      {cat.items.map((item, itemIdx) => (
                                          <div key={itemIdx} className="flex gap-2">
                                              <input 
                                                value={item}
                                                onChange={(e) => handleEvidenceChange(catIdx, itemIdx, e.target.value)}
                                                placeholder={isStatement ? "Detail (e.g. 'I felt scared when...')" : "Document Description (e.g., Marriage Certificate)"}
                                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                              />
                                              <button 
                                                onClick={() => removeItem(catIdx, itemIdx)}
                                                className="text-slate-300 hover:text-red-400 px-1"
                                              >
                                                  &times;
                                              </button>
                                          </div>
                                      ))}
                                      <button 
                                        onClick={() => addItem(catIdx)}
                                        className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded flex items-center gap-1 mt-2"
                                      >
                                          <PlusCircle className="w-3 h-3" /> Add Item
                                      </button>
                                  </div>
                              </div>
                          ))}
                          
                          <button 
                            onClick={() => setCategories([...categories, { category: "New Category", items: [''] }])}
                            className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-blue-400 hover:text-blue-500 transition-colors"
                          >
                              + Add New Category
                          </button>
                      </div>

                       <div className="pt-6 flex justify-between border-t border-slate-100">
                          <button 
                             onClick={() => setStep(1)}
                             className="text-slate-500 font-bold hover:text-slate-700 px-4"
                          >
                              Back
                          </button>
                          <button 
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-100"
                          >
                              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4" />}
                              {isGenerating ? "Drafting with AI..." : "Generate Letter"}
                          </button>
                      </div>
                   </div>
              )}

              {step === 3 && (
                  <div className="space-y-4 animate-in slide-in-from-bottom-4 h-full flex flex-col">
                       <div className="flex justify-between items-center mb-2">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <FileText className="w-6 h-6 text-green-500" /> Ready for Review
                                </h2>
                                <p className="text-xs text-slate-500">Edit directly below before downloading.</p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" 
                                    title="Copy Text" 
                                    onClick={handleCopy}
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button 
                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" 
                                    title="Download .txt"
                                    onClick={handleDownloadFinal}
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                       </div>

                       <div className="flex-1 bg-white border border-slate-200 shadow-inner rounded-xl p-8 overflow-y-auto custom-scrollbar relative">
                           {/* Paper effect visual */}
                           <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-slate-100 to-transparent opacity-50"></div>
                           
                           <textarea 
                                value={letter}
                                onChange={(e) => setLetter(e.target.value)}
                                className="w-full h-full bg-transparent border-none outline-none resize-none font-serif text-sm leading-relaxed text-slate-800 min-h-[500px]"
                                spellCheck={false}
                           />
                       </div>

                        <div className="flex justify-between pt-4">
                           <button 
                             onClick={() => setStep(2)}
                             className="text-slate-500 font-bold hover:text-slate-700 px-4"
                          >
                              Edit Details
                          </button>
                          <button 
                            onClick={handleDownloadFinal}
                            className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 flex items-center gap-2 transition-all"
                          >
                              <Download className="w-4 h-4" /> Finalize & Download
                          </button>
                        </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};