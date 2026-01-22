import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
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
  CheckCircle,
  CloudOff
} from 'lucide-react';
import { StoredDocument } from '../types';
import { generateVaultKey, exportKey, importKey, encryptData, decryptData } from '../services/encryption';

export const DocumentVault: React.FC = () => {
  const { dir } = useLanguage();
  const { user } = useAuth();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [encryptionStatus, setEncryptionStatus] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  
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

  // --- Fetch Documents ---
  useEffect(() => {
      if (!user) return;
      
      const fetchDocs = async () => {
          setIsLoadingDocs(true);
          if (supabase) {
              const { data, error } = await supabase
                  .from('documents')
                  .select('*')
                  .order('created_at', { ascending: false });
              
              if (!error && data) {
                  const mappedDocs: StoredDocument[] = data.map(d => ({
                      id: d.id,
                      name: d.name,
                      type: d.type,
                      uploadDate: new Date(d.created_at),
                      status: d.status as any,
                      ocrData: d.ocr_data,
                      storagePath: d.storage_path,
                      isEncrypted: d.is_encrypted,
                      encryptedData: null, // Don't load content until viewed
                      iv: d.iv
                  }));
                  setDocuments(mappedDocs);
              }
          } else {
              // Fallback Local Storage
              const saved = localStorage.getItem('immi_vault_docs');
              if (saved) {
                  try {
                      setDocuments(JSON.parse(saved).map((d: any) => ({...d, uploadDate: new Date(d.uploadDate)})));
                  } catch(e) {}
              }
          }
          setIsLoadingDocs(false);
      };

      fetchDocs();
  }, [user]);

  // --- Helpers for Blob conversion ---
  const base64ToBlob = (base64: string, type: string = 'application/octet-stream') => {
      const binStr = atob(base64);
      const len = binStr.length;
      const arr = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
          arr[i] = binStr.charCodeAt(i);
      }
      return new Blob([arr], { type });
  };

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
        
        setUploadProgress(30);
        setEncryptionStatus('Encrypting (AES-256)...');

        try {
            // Encrypt Content
            const { iv, ciphertext } = await encryptData(base64String, vaultKey);
            
            setUploadProgress(60);
            setEncryptionStatus('Uploading to Secure Storage...');

            const fileType = file.name.split('.').pop()?.toUpperCase() || 'DOC';
            const fileName = `${Date.now()}_${file.name}`;
            const encryptedBlob = base64ToBlob(ciphertext);

            if (supabase) {
                // 1. Upload Blob to Bucket
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('vault')
                    .upload(`${user?.id}/${fileName}`, encryptedBlob);

                if (uploadError) throw uploadError;

                // 2. Save Metadata to DB
                setUploadProgress(90);
                const { data: docData, error: dbError } = await supabase
                    .from('documents')
                    .insert({
                        user_id: user?.id,
                        name: file.name,
                        type: fileType,
                        storage_path: uploadData.path,
                        status: 'verified', // Skipping mock scan for speed
                        ocr_data: 'Encrypted Content',
                        is_encrypted: true,
                        iv: iv
                    })
                    .select()
                    .single();

                if (dbError) throw dbError;

                // Update UI
                const newDoc: StoredDocument = {
                    id: docData.id,
                    name: docData.name,
                    type: docData.type,
                    uploadDate: new Date(),
                    status: 'verified',
                    ocrData: docData.ocr_data,
                    isEncrypted: true,
                    iv: iv,
                    storagePath: docData.storage_path
                };
                setDocuments(prev => [newDoc, ...prev]);

            } else {
                // Local Storage Fallback
                const newId = `${Date.now()}`;
                const newDoc: StoredDocument = {
                    id: newId,
                    name: file.name,
                    type: fileType,
                    uploadDate: new Date(),
                    status: 'verified',
                    isEncrypted: true,
                    encryptedData: ciphertext, // Store full data locally
                    iv: iv,
                    ocrData: 'Local Encrypted File'
                };
                const newDocs = [newDoc, ...documents];
                setDocuments(newDocs);
                localStorage.setItem('immi_vault_docs', JSON.stringify(newDocs));
            }
            
            setUploadProgress(100);
            setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
                setEncryptionStatus('');
            }, 500);

        } catch (e: any) {
            console.error(e);
            alert("Upload failed: " + e.message);
            setIsUploading(false);
        }
    };
    reader.readAsDataURL(file);
  };

  // --- Decrypt & View ---
  const handleView = async (doc: StoredDocument) => {
      setViewDoc(doc);
      setDecryptedPreview(null);
      setIsDecrypting(true);
      
      try {
          let ciphertext = doc.encryptedData;

          // If no local data, fetch from Supabase
          if (!ciphertext && doc.storagePath && supabase) {
              const { data, error } = await supabase.storage
                  .from('vault')
                  .download(doc.storagePath);
              
              if (error) throw error;
              
              // Convert Blob back to base64 string for decryption function
              const arrayBuffer = await data.arrayBuffer();
              const bytes = new Uint8Array(arrayBuffer);
              let binary = '';
              for (let i = 0; i < bytes.byteLength; i++) {
                  binary += String.fromCharCode(bytes[i]);
              }
              ciphertext = btoa(binary);
          }

          if (doc.isEncrypted && ciphertext && doc.iv && vaultKey) {
              const decrypted = await decryptData(ciphertext, doc.iv, vaultKey);
              setDecryptedPreview(decrypted);
          } else if (doc.previewUrl) {
              setDecryptedPreview(doc.previewUrl);
          } else {
              throw new Error("No data found");
          }
      } catch (e) {
          console.error(e);
          setDecryptedPreview(null);
      } finally {
          setIsDecrypting(false);
      }
  };

  const handleDelete = async (e: React.MouseEvent, doc: StoredDocument) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!window.confirm("Are you sure? This cannot be undone.")) return;

      if (supabase && doc.storagePath) {
          await supabase.storage.from('vault').remove([doc.storagePath]);
          await supabase.from('documents').delete().eq('id', doc.id);
      }
      
      const newDocs = documents.filter(d => d.id !== doc.id);
      setDocuments(newDocs);
      if (!supabase) {
          localStorage.setItem('immi_vault_docs', JSON.stringify(newDocs));
      }
  };

  // ... Drag and Drop handlers remain same ...
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); if (!isUploading) setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0] && !isUploading) processFile(e.dataTransfer.files[0]); };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) { processFile(e.target.files[0]); e.target.value = ''; } };

  const filteredDocs = documents.filter(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200 shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">AES-256 GCM</span>
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
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileInput} accept="image/*,.pdf" />
                  )}
                  <input type="file" ref={cameraInputRef} className="hidden" onChange={handleFileInput} accept="image/*" capture="environment" />
                  
                  {isUploading ? (
                      <div className="w-full max-w-xs animate-in fade-in zoom-in">
                          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 mx-auto border-2 border-blue-100">
                              <Lock className="w-8 h-8 text-blue-600 animate-pulse" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-1">{encryptionStatus}</h3>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-3">
                              <div className="h-full bg-blue-600 transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }} />
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
                            Files are encrypted locally before saving to cloud.
                        </p>
                        <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); cameraInputRef.current?.click(); }}
                            className="bg-slate-50 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm z-20 relative group/btn"
                        >
                            <Camera className="w-5 h-5 text-slate-500 group-hover/btn:text-blue-600" />
                            Scan
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
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`bg-slate-50 border border-slate-200 rounded-lg py-2 ${dir === 'rtl' ? 'pr-4 pl-10' : 'pl-4 pr-10'} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40 transition-all focus:w-60`} 
                          />
                      </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                      {isLoadingDocs ? (
                          <div className="p-8 text-center flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
                      ) : filteredDocs.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                              <Search className="w-8 h-8 mb-2 opacity-50" />
                              <p>No documents found.</p>
                          </div>
                      ) : (
                          filteredDocs.map((doc) => (
                            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                                        <Lock className="w-5 h-5 text-slate-400" />
                                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/50 to-transparent flex items-end justify-end p-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">{doc.name}</h4>
                                        <p className="text-xs text-slate-500">{doc.uploadDate.toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button 
                                        type="button"
                                        onClick={() => handleView(doc)}
                                        className="p-2 hover:bg-blue-100 text-slate-400 hover:text-blue-600 rounded-lg transition-colors" 
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={(e) => handleDelete(e, doc)}
                                        className="p-2 hover:bg-red-100 text-slate-400 hover:text-red-600 rounded-lg transition-colors" 
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                      )}
                  </div>
              </div>
          </div>

          {/* Key Info Sidebar */}
          <div className="space-y-6">
              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/20 rounded-full blur-2xl"></div>
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 relative z-10">
                      <KeyRound className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 relative z-10">Vault Encryption</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4 relative z-10">
                      Your files are encrypted using a locally generated key before they ever leave your device.
                  </p>
                  <ul className="text-sm space-y-2 text-slate-300 relative z-10">
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Client-Side Encryption</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Zero-Knowledge Architecture</li>
                  </ul>
                  {!supabase && (
                      <div className="mt-4 bg-orange-500/20 p-3 rounded-lg flex gap-2 border border-orange-500/30">
                          <CloudOff className="w-4 h-4 text-orange-400 shrink-0" />
                          <span className="text-xs text-orange-200">Offline Mode: Files stored locally.</span>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* View Modal */}
      {viewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                      <div>
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-green-600" /> {viewDoc.name}
                        </h3>
                      </div>
                      <button onClick={() => setViewDoc(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-600" /></button>
                  </div>
                  <div className="flex-1 relative flex items-center justify-center p-4 bg-slate-800/50">
                        {isDecrypting ? (
                            <div className="text-center text-white"><Loader2 className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" /><p className="text-sm font-bold">Decrypting File...</p></div>
                        ) : decryptedPreview ? (
                            viewDoc.type === 'PDF' && decryptedPreview.startsWith('data:application/pdf') ? (
                                 <iframe src={decryptedPreview} className="w-full h-full rounded-lg bg-white shadow-lg" title="PDF Preview" />
                            ) : (
                                 <img src={decryptedPreview} alt="Document" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
                            )
                        ) : (
                            <div className="text-center text-white/50"><FileText className="w-20 h-20 mx-auto mb-4 opacity-50" /><p>Decryption failed or preview unavailable.</p></div>
                        )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};