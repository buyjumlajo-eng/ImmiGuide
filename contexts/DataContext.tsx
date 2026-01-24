import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Attorney, Announcement, AttorneyApplication } from '../types';
import { supabase } from '../services/supabase';

// Initial Mock Data
export const INITIAL_ATTORNEYS: Attorney[] = [
  {
    id: '1',
    name: 'Sarah Chen, Esq.',
    firm: 'Chen & Associates Immigration',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200',
    specialties: ['Family Visas', 'RFE Response', 'Consular Processing'],
    languages: ['English', 'Chinese (Mandarin)'],
    rating: 4.9,
    reviewCount: 128,
    successRate: 98,
    priceStart: 250,
    isVerified: true,
    nextAvailable: 'Tomorrow, 10:00 AM'
  },
  {
    id: '2',
    name: 'Alejandro Rodriguez',
    firm: 'Rodriguez Legal Group',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200',
    specialties: ['Deportation Defense', 'Family Visas', 'Waivers'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 215,
    successRate: 96,
    priceStart: 200,
    isVerified: true,
    nextAvailable: 'Today, 4:00 PM'
  },
  {
    id: '3',
    name: 'Michael Ross',
    firm: 'Pearson Specter Litt',
    image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=200&h=200',
    specialties: ['Business Visas', 'Employment Based'],
    languages: ['English'],
    rating: 5.0,
    reviewCount: 85,
    successRate: 99,
    priceStart: 450,
    isVerified: true,
    nextAvailable: 'Wed, 2:00 PM'
  },
  {
    id: '4',
    name: 'Layla Al-Fayed',
    firm: 'Global Citizens Law',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200',
    specialties: ['Asylum', 'RFE Response', 'Family Visas'],
    languages: ['English', 'Arabic', 'French'],
    rating: 4.9,
    reviewCount: 94,
    successRate: 97,
    priceStart: 300,
    isVerified: true,
    nextAvailable: 'Thu, 11:00 AM'
  }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
    {
        id: '1',
        title: 'New USCIS Fees Effective April 1st',
        content: 'Please be aware that filing fees for Form I-130 are increasing.',
        type: 'warning',
        date: new Date()
    }
];

const INITIAL_APPLICATIONS: AttorneyApplication[] = [
    {
        id: 'app_1',
        firstName: 'David',
        lastName: 'Kim',
        email: 'david@kimlegal.com',
        firmName: 'Kim Immigration Law',
        barState: 'NY',
        barNumber: '554433',
        yearAdmitted: '2018',
        specialties: ['Student Visas', 'Employment Visas'],
        bio: 'Dedicated to helping students and researchers.',
        partnershipModel: 'lead_gen',
        status: 'pending',
        submittedDate: new Date()
    }
];

interface DataContextType {
  attorneys: Attorney[];
  announcements: Announcement[];
  applications: AttorneyApplication[];
  addAttorney: (attorney: Omit<Attorney, 'id'>) => void;
  deleteAttorney: (id: string) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
  deleteAnnouncement: (id: string) => void;
  submitApplication: (app: Omit<AttorneyApplication, 'id' | 'status' | 'submittedDate'>) => void;
  approveApplication: (id: string) => void;
  rejectApplication: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper Mappers for Supabase
const mapAttorneyFromDB = (data: any): Attorney => ({
    id: data.id,
    name: data.name,
    firm: data.firm,
    image: data.image || '',
    specialties: data.specialties || [],
    languages: data.languages || [],
    rating: Number(data.rating),
    reviewCount: data.review_count,
    successRate: data.success_rate,
    priceStart: data.price_start,
    isVerified: data.is_verified,
    nextAvailable: data.next_available
});

const mapAttorneyToDB = (data: Omit<Attorney, 'id'>) => ({
    name: data.name,
    firm: data.firm,
    image: data.image,
    specialties: data.specialties,
    languages: data.languages,
    rating: data.rating,
    review_count: data.reviewCount,
    success_rate: data.successRate,
    price_start: data.priceStart,
    is_verified: data.isVerified,
    next_available: data.nextAvailable
});

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [applications, setApplications] = useState<AttorneyApplication[]>([]);

  // Initial Load
  useEffect(() => {
      const loadData = async () => {
          if (supabase) {
              try {
                  // 1. Fetch Attorneys
                  const { data: attData, error: attError } = await supabase
                      .from('attorneys')
                      .select('*');
                  
                  if (attData && !attError) {
                      setAttorneys(attData.map(mapAttorneyFromDB));
                  } else {
                      console.error("Error fetching attorneys:", attError);
                  }

                  // 2. Fetch Applications
                  const { data: appData, error: appError } = await supabase
                      .from('attorney_applications')
                      .select('*');

                  if (appData && !appError) {
                      setApplications(appData.map((a: any) => ({
                          id: a.id,
                          firstName: a.first_name,
                          lastName: a.last_name,
                          email: a.email,
                          firmName: a.firm_name,
                          barState: a.bar_state,
                          barNumber: a.bar_number,
                          status: a.status,
                          submittedDate: new Date(a.submitted_date),
                          // Fields not in schema will be defaulted for UI
                          yearAdmitted: 'N/A', 
                          specialties: [], 
                          bio: '', 
                          partnershipModel: 'lead_gen'
                      })));
                  }

                  // 3. Announcements (Local only for now as no schema table exists)
                  const savedAnn = localStorage.getItem('immi_data_announcements');
                  setAnnouncements(savedAnn ? JSON.parse(savedAnn).map((a: any) => ({...a, date: new Date(a.date)})) : INITIAL_ANNOUNCEMENTS);

              } catch (e) {
                  console.error("Supabase connection issue:", e);
              }
          } else {
              // Local Fallback
              const savedAtt = localStorage.getItem('immi_data_attorneys');
              setAttorneys(savedAtt ? JSON.parse(savedAtt) : INITIAL_ATTORNEYS);

              const savedAnn = localStorage.getItem('immi_data_announcements');
              setAnnouncements(savedAnn ? JSON.parse(savedAnn).map((a: any) => ({...a, date: new Date(a.date)})) : INITIAL_ANNOUNCEMENTS);

              const savedApps = localStorage.getItem('immi_data_applications');
              setApplications(savedApps ? JSON.parse(savedApps).map((a: any) => ({...a, submittedDate: new Date(a.submittedDate)})) : INITIAL_APPLICATIONS);
          }
      };
      loadData();
  }, []);

  // Persistence for Local Mode Only (if supabase is active, we don't save to local storage to avoid sync issues)
  useEffect(() => {
    if (!supabase) localStorage.setItem('immi_data_attorneys', JSON.stringify(attorneys));
  }, [attorneys]);

  useEffect(() => {
    localStorage.setItem('immi_data_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    if (!supabase) localStorage.setItem('immi_data_applications', JSON.stringify(applications));
  }, [applications]);

  // Actions
  const addAttorney = async (data: Omit<Attorney, 'id'>) => {
      if (supabase) {
          const { data: newRow, error } = await supabase
              .from('attorneys')
              .insert([mapAttorneyToDB(data)])
              .select()
              .single();
          
          if (newRow && !error) {
              setAttorneys(prev => [...prev, mapAttorneyFromDB(newRow)]);
          } else {
              console.error("Add attorney failed", error);
              alert("Failed to save to database.");
          }
      } else {
          const newAttorney = { ...data, id: Date.now().toString() };
          setAttorneys(prev => [...prev, newAttorney]);
      }
  };

  const deleteAttorney = async (id: string) => {
      if (supabase) {
          await supabase.from('attorneys').delete().eq('id', id);
          setAttorneys(prev => prev.filter(a => a.id !== id));
      } else {
          setAttorneys(prev => prev.filter(a => a.id !== id));
      }
  };

  const addAnnouncement = (data: Omit<Announcement, 'id' | 'date'>) => {
      const newAnnouncement: Announcement = { 
          ...data, 
          id: Date.now().toString(),
          date: new Date()
      };
      setAnnouncements(prev => [newAnnouncement, ...prev]);
  };

  const deleteAnnouncement = (id: string) => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const submitApplication = async (appData: Omit<AttorneyApplication, 'id' | 'status' | 'submittedDate'>) => {
      if (supabase) {
          const { data: newApp, error } = await supabase
              .from('attorney_applications')
              .insert([{
                  first_name: appData.firstName,
                  last_name: appData.lastName,
                  email: appData.email,
                  firm_name: appData.firmName,
                  bar_state: appData.barState,
                  bar_number: appData.barNumber,
                  // Note: bio, specialties, yearAdmitted missing in schema, omitting for now to prevent SQL error
              }])
              .select()
              .single();
          
          if (newApp && !error) {
              setApplications(prev => [...prev, {
                  ...appData,
                  id: newApp.id,
                  status: 'pending',
                  submittedDate: new Date(newApp.submitted_date)
              }]);
          } else {
              alert("Application submission failed. Please try again.");
              console.error(error);
          }
      } else {
          const newApp: AttorneyApplication = {
              ...appData,
              id: `app_${Date.now()}`,
              status: 'pending',
              submittedDate: new Date()
          };
          setApplications(prev => [...prev, newApp]);
      }
  };

  const approveApplication = async (id: string) => {
      const app = applications.find(a => a.id === id);
      if (!app) return;

      if (supabase) {
          // 1. Create Attorney
          await addAttorney({
              name: `${app.firstName} ${app.lastName}`,
              firm: app.firmName,
              image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=200&h=200',
              specialties: app.specialties || ['General Immigration'],
              languages: ['English'],
              rating: 5.0,
              reviewCount: 0,
              successRate: 100,
              priceStart: app.partnershipModel === 'lead_gen' ? 150 : 250,
              isVerified: true,
              nextAvailable: 'Available Now'
          });

          // 2. Delete Application
          await supabase.from('attorney_applications').delete().eq('id', id);
          setApplications(prev => prev.filter(a => a.id !== id));
      } else {
          // Local Mode
          const newAttorney: Attorney = {
              id: Date.now().toString(),
              name: `${app.firstName} ${app.lastName}`,
              firm: app.firmName,
              image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=200&h=200',
              specialties: app.specialties,
              languages: ['English'],
              rating: 5.0,
              reviewCount: 0,
              successRate: 100,
              priceStart: app.partnershipModel === 'lead_gen' ? 150 : 250,
              isVerified: true,
              nextAvailable: 'Available Now'
          };
          setAttorneys(prev => [...prev, newAttorney]);
          setApplications(prev => prev.filter(a => a.id !== id));
      }
  };

  const rejectApplication = async (id: string) => {
      if (supabase) {
          await supabase.from('attorney_applications').delete().eq('id', id);
      }
      setApplications(prev => prev.filter(a => a.id !== id));
  };

  return (
    <DataContext.Provider value={{ 
        attorneys, 
        announcements, 
        applications,
        addAttorney, 
        deleteAttorney, 
        addAnnouncement, 
        deleteAnnouncement,
        submitApplication,
        approveApplication,
        rejectApplication
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};