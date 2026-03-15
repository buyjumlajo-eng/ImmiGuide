import React, { useState, useRef, useEffect, useCallback } from 'react';
import { analyzeRFE, generateRFEResponse } from '../services/geminiService';
import { RFEAnalysis } from '../types';
import { ViewState } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import * as mammoth from 'mammoth';
import { 
  Upload, 
  FileText, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  FileCheck,
  PenTool,
  Copy,
  Download,
  X,
  Compass,
  Save,
  Hash,
  Mic,
  MicOff,
  Volume2,
  Square
} from 'lucide-react';

interface RFEDecoderProps {
  onViewChange?: (view: ViewState) => void;
}

// Extend window interface for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export const RFEDecoder: React.FC<RFEDecoderProps> = ({ onViewChange }) => {
  const { t, language, dir } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; mimeType: string; data: string; extractedText?: string } | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<RFEAnalysis | null>(null);
  const [extractionStatus, setExtractionStatus] = useState<string>('');
  
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [showLetter, setShowLetter] = useState(false);
  const [isRestored, setIsRestored] = useState(false);
  const [caseNumber, setCaseNumber] = useState('');

  // --- Feedback State ---
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // --- Voice State ---
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // --- Load/Save State ---
  useEffect(() => {
    const savedState = localStorage.getItem('immi_rfe_state');
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            if (parsed.analysis) {
                setAnalysis(parsed.analysis);
                setIsRestored(true);
            }
            if (parsed.letter) {
                setGeneratedLetter(parsed.letter);
                setShowLetter(true);
            }
            if (parsed.caseNumber) {
                setCaseNumber(parsed.caseNumber);
            }
        } catch (e) {
            console.error('Failed to load saved RFE state', e);
            localStorage.removeItem('immi_rfe_state');
        }
    }
  }, []);

  useEffect(() => {
    if (analysis) {
        const stateToSave = {
            analysis,
            letter: generatedLetter,
            caseNumber
        };
        localStorage.setItem('immi_rfe_state', JSON.stringify(stateToSave));
    }
  }, [analysis, generatedLetter, caseNumber]);

  // Manual Save Trigger
  const handleManualSave = () => {
      if (!analysis) {
          setError("No analysis data to save.");
          return;
      }
      const stateToSave = {
          analysis,
          letter: generatedLetter,
          caseNumber
      };
      localStorage.setItem('immi_rfe_state', JSON.stringify(stateToSave));
      setSuccessMsg("Session saved locally!");
  };

  // Ensure voices are loaded (Chrome quirk)
  useEffect(() => {
    const loadVoices = () => {
        window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // --- Voice Logic (Refined) ---

  const getLangCode = useCallback(() => {
    switch (language) {
        case 'es': return 'es-ES';
        case 'zh': return 'zh-CN';
        case 'ar': return 'ar-SA';
        default: return 'en-US';
    }
  }, [language]);

  const stopListening = useCallback(() => {
      if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current = null;
      }
      setIsListening(false);
      setInterimText('');
  }, []);

  const startListening = useCallback(() => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
          setError("Your browser does not support voice recognition. Please use Chrome.");
          return;
      }

      // Cleanup existing
      if (recognitionRef.current) {
          recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = getLangCode();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
          setIsListening(true);
      };

      recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                  final += event.results[i][0].transcript;
              } else {
                  interim += event.results[i][0].transcript;
              }
          }

          if (final) {
              setInputText(prev => (prev + ' ' + final).trimStart());
              setInterimText('');
          } else {
              setInterimText(interim);
          }
      };

      recognition.onerror = (event: any) => {
          console.error("Speech Error:", event.error);
          if (event.error === 'not-allowed') {
              setError("Microphone blocked. Please allow access.");
              stopListening();
          }
      };

      recognition.onend = () => {
          setIsListening(false);
          setInterimText('');
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch(e) {
        console.error("Start failed", e);
      }
  }, [getLangCode, stopListening]);

  const toggleListening = () => {
      if (isListening) stopListening();
      else startListening();
  };

  const speakText = (text: string) => {
      window.speechSynthesis.cancel();
      if (isSpeaking) {
          setIsSpeaking(false);
          return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLangCode();
      
      // Attempt to pick a good voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith(getLangCode().split('-')[0]));
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
  };


  // --- File & Analysis Logic ---

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setExtractionStatus('');
        
        const isPdf = file.type.includes('pdf');
        const isImage = file.type.includes('image');
        const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx');

        if (!isPdf && !isImage && !isDocx) {
            setError('Please upload a PDF, DOCX, or Image file.');
            return;
        }

        if (isDocx) {
             setExtractionStatus('Extracting text...');
             const reader = new FileReader();
             reader.onload = async (event) => {
                 const arrayBuffer = event.target?.result as ArrayBuffer;
                 try {
                     const result = await mammoth.extractRawText({ arrayBuffer });
                     setSelectedFile({
                         name: file.name,
                         mimeType: file.type,
                         data: '',
                         extractedText: result.value
                     });
                     setInputText('');
                     setExtractionStatus('');
                 } catch (err) {
                     setExtractionStatus('Failed to extract text from DOCX');
                 }
             };
             reader.readAsArrayBuffer(file);
        } else {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64Raw = event.target?.result as string;
                setSelectedFile({
                    name: file.name,
                    mimeType: file.type,
                    data: base64Raw.split(',')[1]
                });
                setInputText('');
            };
            reader.readAsDataURL(file);
        }
    }
  };

  const clearFile = () => {
      setSelectedFile(null);
      setExtractionStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!inputText.trim() && !selectedFile) return;
    
    setIsAnalyzing(true);
    setAnalysis(null);
    setGeneratedLetter('');
    setShowLetter(false);
    setIsRestored(false);
    localStorage.removeItem('immi_rfe_state');
    
    try {
      let result;
      if (selectedFile) {
          if (selectedFile.extractedText) {
              result = await analyzeRFE(selectedFile.extractedText, language);
          } else {
              result = await analyzeRFE({ mimeType: selectedFile.mimeType, data: selectedFile.data }, language);
          }
      } else {
          result = await analyzeRFE(inputText, language);
      }
      setAnalysis(result);
    } catch (e: any) {
      setError(e.message || "Failed to analyze. Please ensure the content is valid.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateLetter = async () => {
    if (!analysis) return;
    setIsGeneratingLetter(true);
    try {
        let input;
        if (selectedFile) {
            if (selectedFile.extractedText) {
                 input = selectedFile.extractedText;
            } else {
                 input = { mimeType: selectedFile.mimeType, data: selectedFile.data };
            }
        } else {
            input = inputText || `RFE regarding: ${analysis.summary}. Missing evidence: ${analysis.missingEvidence.join(', ')}`;
        }

        const letter = await generateRFEResponse(input, analysis, language, caseNumber);
        setGeneratedLetter(letter);
        setShowLetter(true);
    } catch (e: any) {
        setError(e.message || "Failed to generate response letter.");
    } finally {
        setIsGeneratingLetter(false);
    }
  };

  const SeverityBadge = ({ level }: { level: 'low' | 'medium' | 'high' }) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-red-100 text-red-800 border-red-200',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${colors[level]}`}>
        {level} Severity
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 relative">
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
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-sm font-medium">{successMsg}</p>
              <button onClick={() => setSuccessMsg(null)} className="ml-auto text-green-400 hover:text-green-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="text-center max-w-2xl mx-auto relative">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">{t('rfeDecoder')} & {t('responseDraft')}</h1>
        <p className="text-slate-500">
          {t('rfeDesc')}
        </p>
        
        {analysis && (
            <div className="absolute top-0 right-0">
                <button 
                    onClick={handleManualSave}
                    className="flex items-center gap-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg font-bold text-xs transition-colors shadow-sm"
                >
                    <Save className="w-3 h-3" /> Save Session
                </button>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Input Section */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-auto lg:h-full flex flex-col relative min-h-[400px]">
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex justify-between">
              <span>{t('yourRfeContent')}</span>
              {selectedFile && <span className="text-blue-600">{t('fileSelected')}</span>}
            </label>
            
            <div className="flex-1 flex flex-col relative group">
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept=".pdf,.docx,image/*"
                    onChange={handleFileSelect}
                />
                
                {selectedFile ? (
                    <div className="flex-1 w-full bg-blue-50 border-2 border-blue-200 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center">
                        <FileText className="w-12 h-12 text-blue-500 mb-2" />
                        <h3 className="font-bold text-slate-700 break-all">{selectedFile.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 uppercase">
                            {selectedFile.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? 'DOCX' : selectedFile.mimeType.split('/')[1] || 'Document'}
                        </p>
                        {selectedFile.extractedText && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-2 font-bold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Text Extracted
                            </span>
                        )}
                        <button 
                            onClick={clearFile}
                            className="mt-4 text-xs font-bold text-red-500 hover:text-red-700 flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm border border-red-100"
                        >
                            <X className={`w-3 h-3 ${dir === 'rtl' ? 'ml-1' : 'mr-1'}`} /> {t('removeFile')}
                        </button>
                    </div>
                ) : (
                    <div className="relative flex-1">
                        <textarea
                            className="w-full h-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none font-mono text-sm text-slate-700 min-h-[300px]"
                            placeholder={isListening ? "Listening... Speak now." : t('pasteRfe')}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            disabled={isAnalyzing}
                        />
                        
                        {/* Real-time Dictation Feedback Overlay */}
                        {isListening && interimText && (
                            <div className="absolute bottom-16 left-4 right-4 bg-slate-900/80 text-white p-3 rounded-lg text-sm backdrop-blur-sm animate-in fade-in shadow-lg border border-white/10">
                                <span className="text-slate-400 text-xs uppercase font-bold mr-2">Hearing:</span>
                                {interimText}
                            </div>
                        )}

                        {/* Voice Input Button */}
                        <button 
                            onClick={toggleListening}
                            className={`absolute bottom-3 ${dir === 'rtl' ? 'left-3' : 'right-3'} p-2 rounded-full shadow-lg border transition-all z-10 ${isListening ? 'bg-red-500 text-white border-red-600 animate-pulse ring-4 ring-red-200' : 'bg-white text-slate-500 border-slate-200 hover:text-blue-600 hover:scale-105'}`}
                            title={isListening ? "Stop Recording" : "Speak to Type"}
                        >
                            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                    </div>
                )}
            </div>

            {extractionStatus && (
                 <div className="mt-2 text-sm text-slate-500 flex items-center animate-pulse">
                     <Loader2 className="w-3 h-3 mr-2 animate-spin" /> {extractionStatus}
                 </div>
            )}

            <div className="mt-4 flex justify-between items-center">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    className="text-sm text-blue-600 font-medium flex items-center hover:text-blue-700 disabled:opacity-50"
                >
                    <Upload className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} /> 
                    {selectedFile ? t('changeDoc') : t('uploadDoc')}
                </button>
                <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!inputText && !selectedFile)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                {isAnalyzing ? (
                    <>
                    <Loader2 className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'} animate-spin`} /> {t('decoding')}
                    </>
                ) : (
                    <>
                    {t('analyzeNow')} <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'mr-2 rotate-180' : 'ml-2'}`} />
                    </>
                )}
                </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
           {!analysis ? (
             <div className="h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-8 text-center min-h-[300px]">
                <FileText className="w-12 h-12 mb-4 opacity-50" />
                <p>Analysis results will appear here.</p>
             </div>
           ) : (
             <div className="space-y-6">
                 
                 {/* High Severity Warning */}
                 {analysis.severity === 'high' && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex flex-col sm:flex-row items-start justify-between gap-4 shadow-sm animate-in slide-in-from-top-2">
                        <div>
                            <h4 className="font-bold text-red-900 flex items-center">
                                <AlertTriangle className={`w-5 h-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                                {t('highSeverity')}
                            </h4>
                            <p className="text-sm text-red-700 mt-1 leading-relaxed">
                                {t('highSeverityDesc')}
                            </p>
                        </div>
                        {onViewChange && (
                            <button 
                                onClick={() => onViewChange('strategy')}
                                className="bg-white hover:bg-red-100 text-red-700 border border-red-200 text-sm font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center shrink-0 shadow-sm"
                            >
                                <Compass className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} /> {t('strategy')}
                            </button>
                        )}
                    </div>
                 )}

                 {/* Analysis Card */}
                 <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="bg-slate-900 p-6 text-white">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <FileCheck className="w-5 h-5 text-green-400" /> {t('analysisComplete')}
                                </h3>
                                {isRestored && (
                                     <span className="text-xs text-slate-400 mt-1 flex items-center">
                                        <Save className="w-3 h-3 mr-1" /> Restored from saved session
                                     </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => speakText(analysis.summary)}
                                    className={`p-2 rounded-lg transition-colors ${isSpeaking ? 'bg-white text-slate-900 animate-pulse' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                                    title="Read Aloud"
                                >
                                    {isSpeaking ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                </button>
                                <SeverityBadge level={analysis.severity} />
                            </div>
                        </div>
                        <p className={`text-slate-300 text-sm leading-relaxed border-${dir === 'rtl' ? 'r' : 'l'}-2 border-blue-500 p${dir === 'rtl' ? 'r' : 'l'}-4`}>
                            {analysis.summary}
                        </p>
                    </div>

                    <div className="p-6 space-y-6">
                         {/* Case Number Input - Placed clearly above detailed results */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Hash className="w-3 h-3" />
                                {t('caseNumber')}
                            </label>
                            <input
                                type="text"
                                value={caseNumber}
                                onChange={(e) => setCaseNumber(e.target.value)}
                                placeholder="e.g., IOE1234567890"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm transition-all text-slate-700 placeholder-slate-400"
                            />
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                                {t('requiredEvidence')}
                            </h4>
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                                <ul className="space-y-3">
                                    {analysis.missingEvidence.map((item, idx) => (
                                        <li key={idx} className="flex items-start text-sm text-red-900 font-medium">
                                            <AlertTriangle className={`w-4 h-4 text-red-500 ${dir === 'rtl' ? 'ml-2' : 'mr-2'} mt-0.5 flex-shrink-0`} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                                {t('actionPlan')}
                            </h4>
                            <ul className="space-y-3">
                                {analysis.actionItems.map((item, idx) => (
                                    <li key={idx} className="flex items-start text-sm text-slate-700">
                                        <CheckCircle className={`w-4 h-4 text-green-500 ${dir === 'rtl' ? 'ml-2' : 'mr-2'} mt-0.5 flex-shrink-0`} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        {!showLetter && (
                            <button 
                                onClick={handleGenerateLetter}
                                disabled={isGeneratingLetter}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                            >
                                {isGeneratingLetter ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4" />}
                                {t('draftResponse')}
                            </button>
                        )}
                    </div>
                 </div>

                 {/* Response Letter Card (Conditional) */}
                 {showLetter && (
                     <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                         <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                             <h3 className="font-bold flex items-center gap-2">
                                 <FileText className="w-5 h-5" /> {t('responseDraft')}
                             </h3>
                             <div className="flex gap-2">
                                 <button 
                                    onClick={() => speakText(generatedLetter)}
                                    className={`p-2 hover:bg-blue-700 rounded-lg transition-colors ${isSpeaking ? 'text-green-300' : 'text-white'}`} 
                                    title="Read Letter Aloud"
                                 >
                                     {isSpeaking ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                 </button>
                                 <button className="p-2 hover:bg-blue-700 rounded-lg" title="Copy">
                                     <Copy className="w-4 h-4" />
                                 </button>
                                 <button className="p-2 hover:bg-blue-700 rounded-lg" title="Download">
                                     <Download className="w-4 h-4" />
                                 </button>
                             </div>
                         </div>
                         <div className="p-0">
                             <textarea 
                                value={generatedLetter}
                                onChange={(e) => setGeneratedLetter(e.target.value)}
                                className="w-full h-[400px] p-6 text-sm font-mono text-slate-700 outline-none resize-none leading-relaxed"
                             />
                         </div>
                         <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-center">
                             {t('disclaimer')}
                         </div>
                     </div>
                 )}
             </div>
           )}
        </div>

      </div>
    </div>
  );
};