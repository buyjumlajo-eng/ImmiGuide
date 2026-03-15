import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getInterviewQuestion, getInterviewFeedback } from '../services/geminiService';
import { InterviewFeedback } from '../types';
import { 
  Mic2, 
  User, 
  Bot, 
  Play, 
  Square, 
  BarChart, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Loader2,
  MicOff,
  X
} from 'lucide-react';

export const InterviewSimulator: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const [sessionActive, setSessionActive] = useState(false);
  const [interviewType, setInterviewType] = useState('Marriage Green Card');
  const [history, setHistory] = useState<{role: string, text: string}[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  
  // Voice State (Simulated for this component, focusing on text flow for stability, but with Mic UI)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // --- Feedback State ---
  const [error, setError] = useState<string | null>(null);

  // Clear feedback after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const startSession = async () => {
      setSessionActive(true);
      setFeedback(null);
      setHistory([]);
      setIsProcessing(true);
      
      try {
        const firstQ = await getInterviewQuestion([], interviewType, language);
        setCurrentQuestion(firstQ);
        setHistory([{ role: 'model', text: firstQ }]);
      } catch (e: any) {
        console.error(e);
        setError("Failed to start session. Please try again.");
        setSessionActive(false);
      } finally {
        setIsProcessing(false);
      }
  };

  const endSession = async () => {
      setIsProcessing(true);
      try {
          const report = await getInterviewFeedback(history, language);
          setFeedback(report);
          setSessionActive(false);
      } catch (e: any) {
          console.error(e);
          setError("Failed to generate report.");
      } finally {
          setIsProcessing(false);
      }
  };

  const submitResponse = async () => {
      if (!userResponse.trim()) return;

      const newHistory = [...history, { role: 'user', text: userResponse }];
      setHistory(newHistory);
      setUserResponse('');
      setIsProcessing(true);

      try {
        const nextQ = await getInterviewQuestion(newHistory, interviewType, language);
        setHistory(prev => [...prev, { role: 'model', text: nextQ }]);
        setCurrentQuestion(nextQ);
      } catch (e: any) {
        console.error(e);
        setError("Failed to get next question.");
      } finally {
        setIsProcessing(false);
      }
  };

  // --- Voice Logic (Reuse from RFE) ---
  const toggleListening = () => {
      if (isListening) {
          if (recognitionRef.current) recognitionRef.current.stop();
          setIsListening(false);
      } else {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (!SpeechRecognition) {
            setError("Browser not supported for voice recognition.");
            return;
          }
          
          const recognition = new SpeechRecognition();
          recognition.lang = language === 'es' ? 'es-ES' : 'en-US';
          recognition.continuous = false;
          recognition.interimResults = false;
          
          recognition.onresult = (event: any) => {
              const text = event.results[0][0].transcript;
              setUserResponse(prev => prev + ' ' + text);
          };
          
          recognition.onend = () => setIsListening(false);
          recognitionRef.current = recognition;
          recognition.start();
          setIsListening(true);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-20 relative">
       {/* Toast Notifications */}
       {error && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          <div className="bg-red-50 text-red-800 border border-red-200 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-sm font-medium">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

       <div className="text-center mb-8">
           <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-3">
               <Mic2 className="w-8 h-8 text-blue-600" />
               Visa Interview Simulator
           </h1>
           <p className="text-slate-500">Practice with an AI officer to build confidence before your real appointment.</p>
       </div>

       {!sessionActive && !feedback ? (
           // --- Setup Screen ---
           <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-12 text-center max-w-2xl mx-auto">
               <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                   <Bot className="w-10 h-10" />
               </div>
               <h2 className="text-2xl font-bold text-slate-900 mb-6">Select Interview Type</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                   {['Marriage Green Card', 'Naturalization', 'Employment Visa'].map(type => (
                       <button 
                         key={type}
                         onClick={() => setInterviewType(type)}
                         className={`p-4 rounded-xl border-2 font-bold text-sm transition-all ${interviewType === type ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-blue-200 text-slate-600'}`}
                       >
                           {type}
                       </button>
                   ))}
               </div>

               <button 
                  onClick={startSession}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
               >
                   <Play className="w-5 h-5" /> Start Simulation
               </button>
           </div>
       ) : sessionActive ? (
           // --- Active Session ---
           <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[600px]">
               {/* Officer Area */}
               <div className="bg-slate-900 p-8 flex flex-col items-center justify-center min-h-[250px] relative transition-colors">
                   <div className="w-24 h-24 bg-slate-700 rounded-full border-4 border-slate-600 flex items-center justify-center mb-4 relative">
                       <Bot className="w-12 h-12 text-slate-300" />
                       {isProcessing && (
                           <span className="absolute -right-2 -top-2 w-6 h-6 bg-blue-500 rounded-full animate-bounce"></span>
                       )}
                   </div>
                   <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">USCIS Officer (AI)</h3>
                   <p className="text-white text-xl md:text-2xl font-medium text-center max-w-2xl leading-relaxed animate-in fade-in slide-in-from-top-4">
                       "{currentQuestion}"
                   </p>
               </div>

               {/* User Response Area */}
               <div className="flex-1 bg-slate-50 p-6 flex flex-col">
                   <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar px-4">
                       <div className="space-y-4">
                           {history.length > 1 && history.slice(0, -1).slice(-3).map((turn, i) => (
                               <div key={i} className={`text-sm ${turn.role === 'model' ? 'text-slate-500 italic' : 'text-slate-800 font-medium text-right'}`}>
                                   {turn.text}
                               </div>
                           ))}
                       </div>
                   </div>

                   <div className="relative">
                       <textarea 
                          value={userResponse}
                          onChange={(e) => setUserResponse(e.target.value)}
                          placeholder="Type your answer or use microphone..."
                          className="w-full p-4 pr-14 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none shadow-sm h-24"
                          disabled={isProcessing}
                          onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  submitResponse();
                              }
                          }}
                       />
                       <button 
                          onClick={toggleListening}
                          className={`absolute top-2 right-2 p-2 rounded-lg transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'hover:bg-slate-100 text-slate-400'}`}
                       >
                           {isListening ? <MicOff className="w-5 h-5" /> : <Mic2 className="w-5 h-5" />}
                       </button>
                   </div>

                   <div className="flex justify-between mt-4">
                       <button 
                         onClick={endSession}
                         className="px-6 py-2 text-red-600 font-bold hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                       >
                           <Square className="w-4 h-4 fill-current" /> End & Get Report
                       </button>
                       <button 
                         onClick={submitResponse}
                         disabled={!userResponse || isProcessing}
                         className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                       >
                           Answer
                       </button>
                   </div>
               </div>
           </div>
       ) : (
           // --- Feedback Report ---
           <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
               <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                   <div>
                       <h2 className="text-2xl font-bold flex items-center gap-2">
                           <BarChart className="w-6 h-6 text-green-400" /> Performance Report
                       </h2>
                       <p className="text-slate-400 mt-1">Based on {history.length / 2} Q&A exchanges</p>
                   </div>
                   <div className="text-right">
                       <div className="text-4xl font-bold text-green-400">{feedback?.score}/100</div>
                       <div className="text-xs text-slate-400 uppercase font-bold">Confidence Score</div>
                   </div>
               </div>
               
               <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                       <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                           <CheckCircle className="w-5 h-5 text-green-600" /> Strengths
                       </h3>
                       <ul className="space-y-2">
                           {feedback?.strengths.map((s, i) => (
                               <li key={i} className="text-sm text-slate-600 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                                   {s}
                               </li>
                           ))}
                       </ul>
                   </div>

                   <div>
                       <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                           <AlertTriangle className="w-5 h-5 text-amber-500" /> Areas to Improve
                       </h3>
                       <ul className="space-y-2">
                           {feedback?.weaknesses.map((w, i) => (
                               <li key={i} className="text-sm text-slate-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                                   {w}
                               </li>
                           ))}
                       </ul>
                   </div>
               </div>

               <div className="mx-8 mb-8 bg-blue-50 border border-blue-100 p-6 rounded-xl">
                   <h3 className="font-bold text-blue-900 mb-2">💡 AI Coach Tip</h3>
                   <p className="text-blue-800 text-sm leading-relaxed">
                       {feedback?.confidenceTips}
                   </p>
               </div>

               <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-center">
                   <button 
                      onClick={() => { setFeedback(null); setSessionActive(false); }}
                      className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 flex items-center gap-2 transition-colors"
                   >
                       <RefreshCw className="w-4 h-4" /> Start New Session
                   </button>
               </div>
           </div>
       )}
    </div>
  );
};
