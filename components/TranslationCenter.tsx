import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translateDocument } from '../services/geminiService';
import { 
  Globe, 
  Upload, 
  FileCheck, 
  Zap, 
  Loader2, 
  ArrowRight,
  Stamp,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Check,
  X
} from 'lucide-react';

type Tab = 'ai' | 'certified';

export const TranslationCenter: React.FC = () => {
  const { t, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('ai');
  const [file, setFile] = useState<{name: string, type: string, data: string} | null>(null);
  const [targetLang, setTargetLang] = useState('English');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // AI State
  const [aiResult, setAiResult] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Feedback State
  const [feedback, setFeedback] = useState<'none' | 'up' | 'down'>('none');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // Certified State
  const [pageCount, setPageCount] = useState(1);
  const [isUrgent, setIsUrgent] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // --- Toast Feedback State ---
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clear feedback after 5 seconds
  useEffect(() => {
    if (error || successMsg) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMsg(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMsg]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const f = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (ev) => {
              const base64 = (ev.target?.result as string).split(',')[1];
              setFile({
                  name: f.name,
                  type: f.type,
                  data: base64
              });
              setAiResult(''); // Reset result on new file
          };
          reader.readAsDataURL(f);
      }
  };

  const handleAiTranslate = async () => {
      if (!file) return;
      setIsProcessing(true);
      
      // Reset Feedback
      setFeedback('none');
      setFeedbackComment('');
      setFeedbackSubmitted(false);

      try {
          const result = await translateDocument(
              { mimeType: file.type, data: file.data }, 
              targetLang
          );
          setAiResult(result);
      } catch (e: any) {
          setError(e.message || "Translation failed. Please try again.");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleDownload = () => {
    if (!aiResult) return;
    const element = document.createElement("a");
    const blob = new Blob([aiResult], {type: 'text/plain'});
    element.href = URL.createObjectURL(blob);
    element.download = `translated_${file?.name.split('.')[0] || 'doc'}_${targetLang}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setSuccessMsg("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCertifiedQuote = () => {
      setIsProcessing(true);
      setTimeout(() => {
          setIsProcessing(false);
          setOrderPlaced(true);
      }, 1500);
  };

  const calculatePrice = () => {
      const basePrice = 25;
      const total = basePrice * pageCount + (isUrgent ? 15 : 0);
      return total;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 relative">
      {/* Toast Notifications */}
      {(error || successMsg) && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          {error && (
            <div className="bg-red-50 text-red-800 border border-red-200 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-sm font-medium">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 text-green-800 border border-green-200 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <p className="text-sm font-medium">{successMsg}</p>
              <button onClick={() => setSuccessMsg(null)} className="ml-auto text-green-400 hover:text-green-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-3 flex items-center justify-center gap-3">
            <Globe className="w-8 h-8 text-blue-600" />
            AI + Certified Translations
        </h1>
        <p className="text-slate-500">
          Translate documents instantly for personal use, or order official certified translations for USCIS.
        </p>
      </div>

      {/* Toggle Tabs */}
      <div className="flex justify-center mb-8">
          <div className="bg-slate-100 p-1 rounded-xl inline-flex shadow-inner">
              <button 
                onClick={() => setActiveTab('ai')}
                className={`px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'ai' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <Zap className="w-4 h-4" /> Instant AI (Free)
              </button>
              <button 
                onClick={() => setActiveTab('certified')}
                className={`px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'certified' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <Stamp className="w-4 h-4" /> Certified Official (Paid)
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Upload & Config */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  1. Upload Document
              </h2>
              
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-400 transition-colors relative group mb-6">
                  <input 
                    type="file" 
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*,.pdf"
                  />
                  {file ? (
                      <>
                        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-3 text-green-600">
                            <FileCheck className="w-8 h-8" />
                        </div>
                        <p className="font-bold text-slate-800">{file.name}</p>
                        <p className="text-xs text-slate-500 mt-1">Click to replace</p>
                      </>
                  ) : (
                      <>
                        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-blue-600">
                            <Upload className="w-8 h-8" />
                        </div>
                        <p className="font-bold text-slate-800">Click to Upload</p>
                        <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG supported</p>
                      </>
                  )}
              </div>

              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Translate To</label>
                      <select 
                        value={targetLang} 
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                          <option value="English">English (USCIS Requirement)</option>
                          <option value="Spanish">Spanish</option>
                          <option value="Chinese">Chinese</option>
                          <option value="French">French</option>
                          <option value="Arabic">Arabic</option>
                      </select>
                  </div>
                  
                  {activeTab === 'certified' && (
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                           <div className="flex justify-between items-center">
                               <label className="text-sm font-semibold text-slate-700">Estimated Pages</label>
                               <div className="flex items-center gap-3">
                                   <button onClick={() => setPageCount(Math.max(1, pageCount - 1))} className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold hover:bg-slate-100">-</button>
                                   <span className="font-mono font-bold w-4 text-center">{pageCount}</span>
                                   <button onClick={() => setPageCount(pageCount + 1)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold hover:bg-slate-100">+</button>
                               </div>
                           </div>
                           <div className="flex items-center gap-2">
                               <input 
                                id="urgent"
                                type="checkbox" 
                                checked={isUrgent}
                                onChange={(e) => setIsUrgent(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                               />
                               <label htmlFor="urgent" className="text-sm text-slate-700">Rush Order (24h turnaround)</label>
                           </div>
                      </div>
                  )}
              </div>
              
              <div className="mt-auto pt-6">
                 {activeTab === 'ai' ? (
                     <button 
                        onClick={handleAiTranslate}
                        disabled={!file || isProcessing}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                     >
                         {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 text-yellow-300" />}
                         Translate Instantly
                     </button>
                 ) : (
                     <div className="flex items-center justify-between bg-green-50 p-4 rounded-xl border border-green-100">
                         <div>
                             <p className="text-xs text-green-700 font-bold uppercase">Estimated Total</p>
                             <p className="text-2xl font-bold text-slate-900">${calculatePrice()}</p>
                         </div>
                         <button 
                             onClick={handleCertifiedQuote}
                             disabled={!file || isProcessing || orderPlaced}
                             className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                         >
                             {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stamp className="w-4 h-4" />}
                             {orderPlaced ? "Order Sent" : "Request Quote"}
                         </button>
                     </div>
                 )}
              </div>
          </div>

          {/* Right Side: Output / Confirmation */}
          <div className="bg-slate-50 rounded-2xl shadow-inner border border-slate-200 p-6 flex flex-col h-full relative overflow-hidden">
               {activeTab === 'ai' ? (
                   <>
                       <div className="flex justify-between items-center mb-4">
                           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                               <FileText className="w-5 h-5 text-blue-500" /> Result
                           </h2>
                           {aiResult && (
                               <div className="flex gap-2">
                                   <button 
                                      onClick={handleCopy}
                                      className="p-2 hover:bg-white rounded-lg text-slate-500 transition-colors" 
                                      title="Copy"
                                   >
                                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                   </button>
                                   <button 
                                      onClick={handleDownload}
                                      className="p-2 hover:bg-white rounded-lg text-slate-500 transition-colors" 
                                      title="Download"
                                   >
                                      <Download className="w-4 h-4" />
                                   </button>
                               </div>
                           )}
                       </div>
                       
                       {aiResult ? (
                           <>
                                <textarea 
                                        readOnly
                                        value={aiResult}
                                        className="flex-1 w-full bg-white border border-slate-200 rounded-xl p-4 text-sm font-mono leading-relaxed outline-none resize-none shadow-sm mb-4"
                                />

                                {/* Feedback Section */}
                                <div className="pt-4 border-t border-slate-200">
                                   {!feedbackSubmitted ? (
                                       <div className="flex flex-col gap-3">
                                           <div className="flex items-center justify-between">
                                               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rate Translation Quality</p>
                                           </div>
                                           <div className="flex gap-2">
                                               <button 
                                                   onClick={() => { setFeedback('up'); setFeedbackSubmitted(true); }}
                                                   className="flex-1 py-2 px-3 rounded-lg border border-slate-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200 text-slate-600 text-sm font-medium transition-all flex items-center justify-center gap-2 group"
                                               >
                                                   <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                   Accurate
                                               </button>
                                               <button 
                                                   onClick={() => setFeedback('down')}
                                                   className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 group ${feedback === 'down' ? 'bg-red-50 border-red-200 text-red-700' : 'border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-600'}`}
                                               >
                                                   <ThumbsDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                   Issues Found
                                               </button>
                                           </div>
                                           
                                           {feedback === 'down' && (
                                               <div className="animate-in fade-in slide-in-from-top-2 space-y-2">
                                                   <textarea
                                                       value={feedbackComment}
                                                       onChange={(e) => setFeedbackComment(e.target.value)}
                                                       placeholder="Help us improve. What was incorrect? (e.g. 'formatting lost', 'wrong legal term')"
                                                       className="w-full p-3 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                                                       rows={2}
                                                   />
                                                   <button 
                                                       onClick={() => {
                                                           // In a real app, send this to backend for fine-tuning
                                                           setFeedbackSubmitted(true);
                                                       }}
                                                       className="w-full py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors"
                                                   >
                                                       Submit Feedback for Model Tuning
                                                   </button>
                                               </div>
                                           )}
                                       </div>
                                   ) : (
                                       <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-start gap-3 animate-in zoom-in-95">
                                           <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                           <div>
                                               <p className="text-sm font-bold text-green-800">Feedback Recorded</p>
                                               <p className="text-xs text-green-700 mt-1">
                                                   Thank you. Your input has been queued for our next model fine-tuning cycle to improve accuracy for {targetLang} immigration documents.
                                               </p>
                                           </div>
                                       </div>
                                   )}
                                </div>
                           </>
                       ) : (
                           <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60">
                               <Globe className="w-16 h-16 mb-4" />
                               <p className="text-center">Upload a document and click Translate<br/>to see the AI-generated translation here.</p>
                           </div>
                       )}

                       <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
                           <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                           <p className="text-xs text-amber-800">
                               <strong>Note:</strong> AI translations are for informational purposes only. They are <span className="underline">not accepted by USCIS</span> as official certified translations. Use the "Certified Official" tab for legal filings.
                           </p>
                       </div>
                   </>
               ) : (
                   <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                       {!orderPlaced ? (
                           <>
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                    <Stamp className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">USCIS Certified Translations</h3>
                                <p className="text-slate-500 mb-6 max-w-sm">
                                    We partner with professional linguists to provide 100% USCIS acceptance guaranteed translations. Signed, stamped, and delivered digitally in 24-48 hours.
                                </p>
                                <ul className="text-left space-y-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm w-full max-w-sm">
                                    <li className="flex items-center gap-2 text-sm text-slate-700">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Certificate of Accuracy
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-slate-700">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Professional Linguist Review
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-slate-700">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Notarization Available
                                    </li>
                                </ul>
                           </>
                       ) : (
                           <div className="animate-in zoom-in-95 duration-500">
                               <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Quote Requested!</h3>
                                <p className="text-slate-600 mb-6">
                                    We have received your document. A certified translator will review it and send a final invoice to your email within 1 hour.
                                </p>
                                <button 
                                    onClick={() => {setOrderPlaced(false); setFile(null);}}
                                    className="text-blue-600 font-bold hover:underline"
                                >
                                    Start Another Translation
                                </button>
                           </div>
                       )}
                   </div>
               )}
          </div>
      </div>
    </div>
  );
};