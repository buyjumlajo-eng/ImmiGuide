import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Megaphone, 
  Users, 
  Save,
  X,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { attorneys, announcements, addAttorney, deleteAttorney, addAnnouncement, deleteAnnouncement } = useData();
  const [activeTab, setActiveTab] = useState<'attorneys' | 'announcements'>('announcements');
  const [showAddModal, setShowAddModal] = useState(false);

  // Simple form state for adding attorney
  const [newAttorney, setNewAttorney] = useState({
      name: '', firm: '', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200', specialties: '', languages: '', priceStart: 200
  });

  // Simple form state for announcement
  const [newAnnouncement, setNewAnnouncement] = useState({
      title: '', content: '', type: 'info' as 'info'|'warning'|'success'
  });

  const handleAddAttorney = () => {
      addAttorney({
          name: newAttorney.name,
          firm: newAttorney.firm,
          image: newAttorney.image,
          specialties: newAttorney.specialties.split(',').map(s => s.trim()),
          languages: newAttorney.languages.split(',').map(s => s.trim()),
          rating: 5.0,
          reviewCount: 0,
          successRate: 100,
          priceStart: newAttorney.priceStart,
          isVerified: true,
          nextAvailable: 'Available Now'
      });
      setShowAddModal(false);
      setNewAttorney({ name: '', firm: '', image: '', specialties: '', languages: '', priceStart: 200 });
  };

  const handleAddAnnouncement = () => {
      addAnnouncement(newAnnouncement);
      setNewAnnouncement({ title: '', content: '', type: 'info' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            Admin Control Panel
          </h1>
          <p className="text-slate-500 mt-2">Manage marketplace listings and site-wide alerts.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('announcements')}
            className={`pb-4 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'announcements' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              <Megaphone className="w-4 h-4" /> Global Announcements
          </button>
          <button 
            onClick={() => setActiveTab('attorneys')}
            className={`pb-4 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'attorneys' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              <Users className="w-4 h-4" /> Attorney Database
          </button>
      </div>

      {activeTab === 'announcements' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Create New */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 md:col-span-1 h-fit">
                  <h3 className="font-bold text-slate-900 mb-4">Post New Alert</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                          <input 
                            value={newAnnouncement.title}
                            onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                            className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                            placeholder="e.g. System Maintenance"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Content</label>
                          <textarea 
                            value={newAnnouncement.content}
                            onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                            className="w-full p-2 border border-slate-200 rounded-lg text-sm h-24 resize-none"
                            placeholder="Details..."
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                          <div className="flex gap-2">
                              {['info', 'warning', 'success'].map((t) => (
                                  <button
                                    key={t}
                                    onClick={() => setNewAnnouncement({...newAnnouncement, type: t as any})}
                                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize border-2 ${newAnnouncement.type === t ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-200 text-slate-600'}`}
                                  >
                                      {t}
                                  </button>
                              ))}
                          </div>
                      </div>
                      <button 
                        onClick={handleAddAnnouncement}
                        disabled={!newAnnouncement.title}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50"
                      >
                          Publish Announcement
                      </button>
                  </div>
              </div>

              {/* List */}
              <div className="md:col-span-2 space-y-4">
                  {announcements.length === 0 ? (
                      <div className="text-center p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                          No active announcements.
                      </div>
                  ) : (
                      announcements.map((ann) => (
                          <div key={ann.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-start gap-4">
                              <div className={`p-2 rounded-lg shrink-0 ${ann.type === 'warning' ? 'bg-amber-100 text-amber-600' : ann.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                  {ann.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : ann.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                              </div>
                              <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                      <h4 className="font-bold text-slate-900">{ann.title}</h4>
                                      <button onClick={() => deleteAnnouncement(ann.id)} className="text-slate-400 hover:text-red-500">
                                          <X className="w-4 h-4" />
                                      </button>
                                  </div>
                                  <p className="text-sm text-slate-600 mt-1">{ann.content}</p>
                                  <p className="text-xs text-slate-400 mt-2">{ann.date.toLocaleDateString()}</p>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      )}

      {activeTab === 'attorneys' && (
          <div className="space-y-6">
              <div className="flex justify-end">
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-indigo-700"
                  >
                      <Plus className="w-4 h-4" /> Add Attorney
                  </button>
              </div>
              
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                              <th className="p-4 font-bold text-slate-700">Name</th>
                              <th className="p-4 font-bold text-slate-700">Firm</th>
                              <th className="p-4 font-bold text-slate-700">Specialties</th>
                              <th className="p-4 font-bold text-slate-700 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {attorneys.map((att) => (
                              <tr key={att.id} className="hover:bg-slate-50">
                                  <td className="p-4 font-medium text-slate-900">{att.name}</td>
                                  <td className="p-4 text-slate-600">{att.firm}</td>
                                  <td className="p-4 text-slate-600">
                                      <div className="flex flex-wrap gap-1">
                                          {att.specialties.map(s => (
                                              <span key={s} className="bg-slate-100 px-2 py-0.5 rounded text-xs">{s}</span>
                                          ))}
                                      </div>
                                  </td>
                                  <td className="p-4 text-right">
                                      <button 
                                        onClick={() => deleteAttorney(att.id)}
                                        className="text-slate-400 hover:text-red-600 transition-colors"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* Simple Modal for Adding Attorney */}
      {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 animate-in zoom-in-95">
                  <h3 className="font-bold text-xl text-slate-900">Add New Attorney</h3>
                  <div className="space-y-3">
                      <input 
                        placeholder="Full Name" 
                        className="w-full p-2 border rounded-lg"
                        value={newAttorney.name}
                        onChange={e => setNewAttorney({...newAttorney, name: e.target.value})}
                      />
                      <input 
                        placeholder="Firm Name" 
                        className="w-full p-2 border rounded-lg"
                        value={newAttorney.firm}
                        onChange={e => setNewAttorney({...newAttorney, firm: e.target.value})}
                      />
                      <input 
                        placeholder="Specialties (comma separated)" 
                        className="w-full p-2 border rounded-lg"
                        value={newAttorney.specialties}
                        onChange={e => setNewAttorney({...newAttorney, specialties: e.target.value})}
                      />
                      <input 
                        placeholder="Languages (comma separated)" 
                        className="w-full p-2 border rounded-lg"
                        value={newAttorney.languages}
                        onChange={e => setNewAttorney({...newAttorney, languages: e.target.value})}
                      />
                      <input 
                        placeholder="Starting Price ($)" 
                        type="number"
                        className="w-full p-2 border rounded-lg"
                        value={newAttorney.priceStart}
                        onChange={e => setNewAttorney({...newAttorney, priceStart: parseInt(e.target.value) || 0})}
                      />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                      <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                      <button onClick={handleAddAttorney} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Attorney</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
