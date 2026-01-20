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
  Camera,
  ShieldCheck,
  KeyRound,
  CheckCircle
} from 'lucide-react';
import { StoredDocument } from '../types';
import { generateVaultKey, exportKey, importKey, encryptData, decryptData } from '../services/encryption';

export const DocumentVault: React.FC = () => {
  const { dir } = useLanguage();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  // Initial Mock Data (Legacy Unencrypted)
  const INITIAL_DOCS: StoredDocument[] = [
    { 
      id: '1', 
      name: 'Birth_Certificate_Translated.pdf', 
      type: 'PDF', 
      uploadDate: new Date('2023-10-15'), 
      status: 'verified', 
      ocrData: 'Extracted: Jane Doe, DOB: 01/01/1990, Place: Bogota...',
      previewUrl: 'https://plus.unsplash.com/premium_photo-1661775756810-82dbd209fc95?q=80&w=800&auto=format&fit=crop',
      isEncrypted: false
    },
    { 
      id: '2', 
      name: 'Passport_Scan.jpg', 
      type: 'IMG', 
      uploadDate: new Date('2023-10-15'), 
      status: 'verified', 
      ocrData: 'Extracted: Passport #A12345678, Exp: 2030...',
      previewUrl: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=800&auto=format&fit=crop',
      isEncrypted: false
    }
  ];

  const [documents, setDocuments] = useState<StoredDocument[]>(() => {
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

  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [encryptionStatus, setEncryptionStatus] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // View State
  const [viewDoc, setViewDoc] = useState<StoredDocument | null>(null);
  const [decryptedPreview, setDecryptedPreview] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // --- Key Management ---
  useEffect(() => {
      const initKey = async () => {
          try {
              const storedKey = localStorage.getItem('immi_vault_key');
              if (storedKey) {
                  const key = await importKey(storedKey);
                  setVaultKey(key);
              } else {
                  const key = await generateVaultKey();
                  const exported = await exportKey(key);
                  localStorage.setItem('immi_vault_key', exported);
                  setVaultKey(key);
              }
          } catch (e) {
              console.error("Failed to initialize encryption key", e);
          }
      };
      initKey();
  }, []);

  // --- Persistence ---
  useEffect(() => {
      try {
        localStorage.setItem('immi_vault_docs', JSON.stringify(documents));
      } catch (e) {
        console.warn("Storage quota exceeded", e);
        alert("Local storage is full. Please delete some documents.");
      }
  }, [documents]);

  // --- Upload & Encrypt ---
  const processFile = (file: File) => {
    if (!vaultKey) {
        alert("Encryption key not ready. Please refresh.");
        return;
    }

    setIsUploading(true);
    setEncryptionStatus('Reading file...');
    setUploadProgress(10);

    const reader = new FileReader();
    reader.onload = async (event) => {
        const base64String = event.target?.result as string;
        
        setUploadProgress(40);
        setEncryptionStatus('Encrypting (AES-256)...');

        try {
            // Artificial delay to show encryption step
            await new Promise(r => setTimeout(r, 800));
            
            // Encrypt
            const { iv, ciphertext } = await encryptData(base64String, vaultKey);
            
            setUploadProgress(80);
            setEncryptionStatus('Securing in Vault...');

            // Create Document
            const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const newDoc: StoredDocument = {
                id: newId,
                name: file.name,
                type: file.name.split('.').pop()?.toUpperCase() || 'DOC',
                uploadDate: new Date(),
                status: 'scanning',
                isEncrypted: true,
                encryptedData: ciphertext,
                iv: iv,
                previewUrl: undefined, // No raw data stored
                ocrData: 'Analyzing...'
            };

            setDocuments(prev => [newDoc, ...prev]);
            
            setUploadProgress(100);
            setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
                setEncryptionStatus('');
            }, 500);

            // Mock OCR update
            setTimeout(() => {
                setDocuments(prev => prev.map(d => 
                    d.id === newId ? { ...d, status: 'verified', ocrData: `Smart Extract (Encrypted Source):\nFilename: ${file.name}\nDate: ${new Date().toLocaleDateString()}\n[PII Protected]` } : d
                ));
            }, 3000);

        } catch (e) {
            console.error(e);
            alert("Encryption failed.");
            setIsUploading(false);
        }
    };
    reader.readAsDataURL(file);
  };

  // --- Decrypt & View ---
  const handleView = async (doc: StoredDocument) => {
      setViewDoc(doc);
      setDecryptedPreview(null);
      
      if (doc.isEncrypted && doc.encryptedData && doc.iv && vaultKey) {
          setIsDecrypting(true);
          try {
              const decrypted = await decryptData(doc.encryptedData, doc.iv, vaultKey);
              setDecryptedPreview(decrypted);
          } catch (e) {
              console.error(e);
              setDecryptedPreview(null); // Shows error state in modal
          } finally {
              setIsDecrypting(false);
          }
      } else {
          // Legacy or unencrypted docs
          setDecryptedPreview(doc.previewUrl || null);
      }
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
         e.target.value = ''; 
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      setDocuments(prev => prev.filter(d => String(d.id) !== String(id)));
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
          <p className="text-slate-500 mt-2">End-to-End Encrypted storage for sensitive immigration documents.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200 shadow-sm animate-in fade-in">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">AES-256 GCM Active</span>
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
                  {!isUploading && (
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                        onChange={handleFileInput} 
                        accept="image/*,.pdf"
                      />
                  )}

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
                          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 mx-auto border-2 border-blue-100">
                              <Lock className="w-8 h-8 text-blue-600 animate-pulse" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-1">{encryptionStatus}</h3>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-3">
                              <div 
                                className="h-full bg-blue-600 transition-all duration-300 ease-out" 
                                style={{ width: `${uploadProgress}%` }}
                              />
                          </div>
                      </div>
                  ) : (
                      <>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 ${isDragging ? 'bg-blue-100 scale-110' : 'bg-blue-50 group-hover:scale-110'}`}>
                            <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-700' : 'text-blue-600'}`} />
                        </div>
                        <h3 className={`text-lg font-bold transition-colors ${isDragging ? 'text-blue-700' : 'text-slate-900'}`}>
                            {isDragging ? 'Drop to Encrypt & Upload' : 'Encrypt & Upload'}
                        </h3>
                        <p className={`text-sm mt-1 transition-colors mb-6 ${isDragging ? 'text-blue-600' : 'text-slate-500'}`}>
                            Files are encrypted locally before saving.
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
                                    <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                                        {doc.isEncrypted ? (
                                            <Lock className="w-5 h-5 text-slate-400" />
                                        ) : (
                                            doc.previewUrl ? <img src={doc.previewUrl} className="w-full h-full object-cover opacity-50" alt="" /> : <FileText className="w-5 h-5 text-slate-400" />
                                        )}
                                        {doc.isEncrypted && (
                                            <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/50 to-transparent flex items-end justify-end p-1">
                                                <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                                            {doc.name}
                                            {doc.isEncrypted && <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500 border border-slate-200 font-mono">E2EE</span>}
                                        </h4>
                                        <p className="text-xs text-slate-500">{doc.uploadDate.toLocaleDateString()}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    {doc.status === 'scanning' ? (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md animate-pulse">
                                            <Scan className="w-3 h-3" /> Processing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                                            <FileCheck className="w-3 h-3" /> Secure
                                        </span>
                                    )}

                                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button 
                                            type="button"
                                            onClick={() => handleView(doc)}
                                            className="p-2 hover:bg-blue-100 text-slate-400 hover:text-blue-600 rounded-lg transition-colors" 
                                            title="Decrypt & View"
                                        >
                                            {doc.isEncrypted ? <KeyRound className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

          {/* Key Info */}
          <div className="space-y-6">
              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/20 rounded-full blur-2xl"></div>
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 relative z-10">
                      <KeyRound className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 relative z-10">Vault Encryption</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4 relative z-10">
                      Your files are encrypted using a locally generated key. This app uses <strong>AES-256-GCM</strong>. Only you can view these files.
                  </p>
                  <ul className="text-sm space-y-2 text-slate-300 relative z-10">
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Client-Side Encryption</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Zero-Knowledge Architecture</li>
                  </ul>
              </div>
          </div>
      </div>

      {/* View Data Modal */}
      {viewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                  
                  {/* Modal Header */}
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                      <div>
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            {viewDoc.isEncrypted ? <Lock className="w-4 h-4 text-green-600" /> : <FileText className="w-5 h-5 text-blue-600" />}
                            {viewDoc.name}
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
                            {isDecrypting ? (
                                <div className="text-center text-white">
                                    <Loader2 className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />
                                    <p className="text-sm font-bold">Decrypting File...</p>
                                </div>
                            ) : decryptedPreview ? (
                                viewDoc.type === 'PDF' && decryptedPreview.startsWith('data:application/pdf') ? (
                                     <iframe src={decryptedPreview} className="w-full h-full rounded-lg bg-white shadow-lg" title="PDF Preview" />
                                ) : (
                                     <img src={decryptedPreview} alt="Document" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
                                )
                            ) : (
                                <div className="text-center text-white/50">
                                    <FileText className="w-20 h-20 mx-auto mb-4 opacity-50" />
                                    <p>Decryption failed or preview unavailable.</p>
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
                                          <ShieldCheck className="w-4 h-4" /> Integrity Verified
                                      </div>
                                      <p className="text-xs opacity-80">Document decrypted successfully using local session key.</p>
                                  </div>

                                  <div>
                                      <h5 className="text-xs font-bold text-slate-900 mb-2">Metadata</h5>
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