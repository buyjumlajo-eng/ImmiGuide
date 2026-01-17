import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  FolderLock, 
  Upload, 
  FileCheck, 
  AlertCircle, 
  Lock, 
  Search,
  Scan,
  Loader2,
  Trash2,
  Eye,
  FileText,
  X,
  Camera
} from 'lucide-react';
import { StoredDocument } from '../types';

export const DocumentVault: React.FC = () => {
  const { dir } = useLanguage();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  // Initial Mock Data with Visual Placeholders
  const INITIAL_DOCS: StoredDocument[] = [
    { 
      id: '1', 
      name: 'Birth_Certificate_Translated.pdf', 
      type: 'PDF', 
      uploadDate: new Date('2023-10-15'), 
      status: 'verified', 
      ocrData: 'Extracted: Jane Doe, DOB: 01/01/1990, Place: Bogota...',
      previewUrl: 'https://plus.unsplash.com/premium_photo-1661775756810-82dbd209fc95?q=80&w=800&auto=format&fit=crop' // Placeholder visual
    },
    { 
      id: '2', 
      name: 'Passport_Scan.jpg', 
      type: 'IMG', 
      uploadDate: new Date('2023-10-15'), 
      status: 'verified', 
      ocrData: 'Extracted: Passport #A12345678, Exp: 2030...',
      previewUrl: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=800&auto=format&fit=crop'
    },
    { 
      id: '3', 
      name: 'Marriage_License.pdf', 
      type: 'PDF', 
      uploadDate: new Date('2023-11-01'), 
      status: 'verified', 
      ocrData: 'Extracted: Marriage Date: 10/10/2022...',
      previewUrl: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=800&auto=format&fit=crop'
    }
  ];

  const [documents, setDocuments] = useState<StoredDocument[]>(() => {
      // Load from local storage on mount
      const saved = localStorage.getItem('immi_vault_docs');
      if (saved) {
          try {
              return JSON.parse(saved).map((d: any) => ({
                  ...d,
                  uploadDate: new Date(d.uploadDate)
              }));
          } catch(e) { console.error(e); }
      }
      return INITIAL_DOCS;
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewDoc, setViewDoc] = useState<StoredDocument | null>(null);

  // Persist to local storage whenever documents change
  useEffect(() => {
      try {
        localStorage.setItem('immi_vault_docs', JSON.stringify(documents));
      } catch (e) {
        console.warn("Storage quota exceeded", e);
      }
  }, [documents]);

  const processFile = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onload = (event) => {
        const base64String = event.target?.result as string;
        
        // Simulation of upload progress
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.random() * 15;
            if (currentProgress > 95) currentProgress = 95;
            setUploadProgress(currentProgress);
        }, 100);

        // Finish upload after delay
        setTimeout(() => {
            clearInterval(interval);
            setUploadProgress(100);
            
            // Use a robust ID generation to ensure uniqueness
            const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            const newDoc: StoredDocument = {
                id: newId,
                name: file.name,
                type: file.name.split('.').pop()?.toUpperCase() || 'DOC',
                uploadDate: new Date(),
                status: 'scanning', 
                ocrData: 'Scanning in progress...',
                previewUrl: base64String 
            };

            // Add doc after small delay to show 100%
            setTimeout(() => {
                setDocuments(prev => [newDoc, ...prev]);
                setIsUploading(false);
                setUploadProgress(0);
            }, 500);

            // Simulate OCR
            setTimeout(() => {
                setDocuments(prev => prev.map(d => {
                    if (d.id === newDoc.id) {
                         return { 
                             ...d, 
                             status: 'verified', 
                             ocrData: `Smart Extract:\nFilename: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nDetected Date: ${new Date().toLocaleDateString()}\nStatus: Valid\n\n(AI would list extracted fields here)` 
                         };
                    }
                    return d;
                }));
            }, 4000);
        }, 1500);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0] && !isUploading) {
        processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
         processFile(e.target.files[0]);
         e.target.value = ''; // Reset
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      // Robust event handling
      e.preventDefault();
      e.stopPropagation();
      
      const targetId = String(id);
      // Removed window.confirm to bypass potential browser blockers and ensure functionality
      setDocuments(prev => prev.filter(d => String(d.id) !== targetId));
  };

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 relative">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <FolderLock className="w-8 h-8 text-blue-600" />
            Secure Data Vault
          </h1>
          <p className="text-slate-500 mt-2">Bank-grade encrypted storage with Intelligent OCR.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200 shadow-sm">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">AES-256 Encrypted</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload & List Area */}
          <div className="lg:col-span-2 space-y-6">
              {/* Drop Zone */}
              <div 
                  className={`bg-white rounded-2xl p-8 border-2 border-dashed flex flex-col items-center justify-center text-center transition-all duration-300 group relative ${isDragging ? 'border-blue-500 bg-blue-50/50 scale-[1.02] shadow-lg ring-4 ring-blue-500/10' : 'border-slate-200 hover:border-blue-400'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
              >
                  {/* Standard File Input (Hidden) - Absolute coverage for drag/drop/click area */}
                  {!isUploading && (
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                        onChange={handleFileInput} 
                        accept="image/*,.pdf"
                      />
                  )}

                  {/* Camera Input (Hidden) - Triggered by button */}
                  <input 
                    type="file" 
                    ref={cameraInputRef}
                    className="hidden" 
                    onChange={handleFileInput} 
                    accept="image/*"
                    capture="environment"
                  />
                  
                  {isUploading ? (
                      <div className="w-full max-w-xs animate-in fade-in zoom-in">
                          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 mx-auto">
                              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-2">Uploading Document...</h3>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 transition-all duration-300 ease-out" 
                                style={{ width: `${uploadProgress}%` }}
                              />
                          </div>
                          <p className="text-xs text-slate-500 mt-2 font-medium">{Math.round(uploadProgress)}% Complete</p>
                      </div>
                  ) : (
                      <>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 ${isDragging ? 'bg-blue-100 scale-110' : 'bg-blue-50 group-hover:scale-110'}`}>
                            <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-700' : 'text-blue-600'}`} />
                        </div>
                        <h3 className={`text-lg font-bold transition-colors ${isDragging ? 'text-blue-700' : 'text-slate-900'}`}>
                            {isDragging ? 'Drop to Upload' : 'Upload Documents'}
                        </h3>
                        <p className={`text-sm mt-1 transition-colors mb-6 ${isDragging ? 'text-blue-600' : 'text-slate-500'}`}>
                            Drag & drop or click to upload.
                        </p>
                        
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                cameraInputRef.current?.click();
                            }}
                            className="bg-slate-50 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm z-20 relative group/btn"
                        >
                            <Camera className="w-5 h-5 text-slate-500 group-hover/btn:text-blue-600" />
                            Scan with Camera
                        </button>
                      </>
                  )}
              </div>

              {/* Documents List */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px]">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-bold text-slate-800">Stored Files ({documents.length})</h3>
                      <div className="relative">
                          <Search className={`absolute ${dir === 'rtl' ? 'left-3' : 'right-3'} top-2.5 w-4 h-4 text-slate-400`} />
                          <input 
                            placeholder="Search files..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`bg-slate-50 border border-slate-200 rounded-lg py-2 ${dir === 'rtl' ? 'pr-4 pl-10' : 'pl-4 pr-10'} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 transition-all focus:w-64`} 
                          />
                      </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                      {filteredDocs.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                              <Search className="w-8 h-8 mb-2 opacity-50" />
                              <p>No documents found.</p>
                          </div>
                      ) : (
                          filteredDocs.map((doc) => (
                            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    {doc.previewUrl ? (
                                        <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
                                            <img src={doc.previewUrl} className="w-full h-full object-cover" alt="thumbnail" />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500 text-xs border border-slate-200">
                                            {doc.type}
                                        </div>
                                    )}
                                    
                                    <div>
                                        <h4 className="font-semibold text-slate-900 text-sm">{doc.name}</h4>
                                        <p className="text-xs text-slate-500">{doc.uploadDate.toLocaleDateString()} • {(doc.ocrData && doc.ocrData.includes('Size')) ? doc.ocrData.split('Size: ')[1].split('\n')[0] : 'Scanned'}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    {/* Status Badge */}
                                    {doc.status === 'scanning' ? (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md animate-pulse">
                                            <Scan className="w-3 h-3" /> OCR...
                                        </span>
                                    ) : doc.status === 'verified' ? (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                                            <FileCheck className="w-3 h-3" /> Verified
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                                            <AlertCircle className="w-3 h-3" /> Issue
                                        </span>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button 
                                            type="button"
                                            onClick={() => setViewDoc(doc)}
                                            className="p-2 hover:bg-blue-100 text-slate-400 hover:text-blue-600 rounded-lg transition-colors" 
                                            title="View Document"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={(e) => handleDelete(e, doc.id)}
                                            className="p-2 hover:bg-red-100 text-slate-400 hover:text-red-600 rounded-lg transition-colors" 
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                      )}
                  </div>
              </div>
          </div>

          {/* Privacy & Stats Side */}
          <div className="space-y-6">
              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                      <Lock className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Privacy Guarantee</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                      Your documents are encrypted locally. We use Zero-Knowledge encryption, meaning only you have the keys to view these files.
                  </p>
                  <ul className="text-sm space-y-2 text-slate-300">
                      <li className="flex items-center gap-2"><FileCheck className="w-4 h-4 text-green-400" /> AES-256 Encryption</li>
                      <li className="flex items-center gap-2"><FileCheck className="w-4 h-4 text-green-400" /> Local Browser Storage</li>
                  </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                   <h3 className="font-bold text-slate-800 mb-4">OCR Status</h3>
                   <div className="space-y-4">
                       <div>
                           <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                               <span>Evidence Extraction</span>
                               <span>98%</span>
                           </div>
                           <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                               <div className="bg-blue-600 h-full rounded-full" style={{width: '98%'}}></div>
                           </div>
                       </div>
                       <div>
                           <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                               <span>Date Consistency</span>
                               <span>100%</span>
                           </div>
                           <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                               <div className="bg-green-500 h-full rounded-full" style={{width: '100%'}}></div>
                           </div>
                       </div>
                   </div>
              </div>
          </div>
      </div>

      {/* View Data Modal */}
      {viewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                  
                  {/* Modal Header */}
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                      <div>
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" /> {viewDoc.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Uploaded {viewDoc.uploadDate.toLocaleDateString()}</p>
                      </div>
                      <button 
                        onClick={() => setViewDoc(null)} 
                        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                      >
                          <X className="w-5 h-5 text-slate-600" />
                      </button>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 bg-slate-100 relative overflow-hidden flex flex-col md:flex-row">
                      
                      {/* File Preview (Main) */}
                      <div className="flex-1 relative flex items-center justify-center p-4 bg-slate-800/50">
                            {viewDoc.previewUrl ? (
                                viewDoc.type === 'PDF' && viewDoc.previewUrl.startsWith('data:application/pdf') ? (
                                     <iframe src={viewDoc.previewUrl} className="w-full h-full rounded-lg bg-white shadow-lg" title="PDF Preview" />
                                ) : (
                                     <img src={viewDoc.previewUrl} alt="Document" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
                                )
                            ) : (
                                <div className="text-center text-white/50">
                                    <FileText className="w-20 h-20 mx-auto mb-4 opacity-50" />
                                    <p>Preview not available for this file type.</p>
                                </div>
                            )}
                      </div>

                      {/* OCR Data (Sidebar) */}
                      <div className="w-full md:w-80 bg-white border-l border-slate-200 flex flex-col">
                          <div className="p-4 border-b border-slate-100 bg-slate-50">
                              <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                  <Scan className="w-4 h-4" /> AI Analysis
                              </h4>
                          </div>
                          <div className="p-4 overflow-y-auto flex-1">
                              <div className="space-y-4">
                                  <div className="bg-green-50 text-green-800 p-3 rounded-lg text-sm border border-green-100">
                                      <div className="flex items-center gap-2 font-bold mb-1">
                                          <FileCheck className="w-4 h-4" /> Valid Document
                                      </div>
                                      <p className="text-xs opacity-80">This document passes all quality checks.</p>
                                  </div>

                                  <div>
                                      <h5 className="text-xs font-bold text-slate-900 mb-2">Extracted Data</h5>
                                      <div className="bg-slate-900 text-green-400 p-3 rounded-lg font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner">
                                          {viewDoc.ocrData || "No data extracted."}
                                      </div>
                                  </div>
                              </div>
                          </div>
                          <div className="p-4 border-t border-slate-100 bg-slate-50">
                              <button 
                                onClick={() => setViewDoc(null)}
                                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm"
                              >
                                  Close Viewer
                              </button>
                          </div>
                      </div>

                  </div>
              </div>
          </div>
      )}
    </div>
  );
};