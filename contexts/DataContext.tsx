import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Attorney, Announcement, AttorneyApplication } from '../types';

// Initial Mock Data
const INITIAL_ATTORNEYS: Attorney[] = [
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

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [attorneys, setAttorneys] = useState<Attorney[]>(() => {
      const saved = localStorage.getItem('immi_data_attorneys');
      return saved ? JSON.parse(saved) : INITIAL_ATTORNEYS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
      const saved = localStorage.getItem('immi_data_announcements');
      return saved ? JSON.parse(saved).map((a: any) => ({...a, date: new Date(a.date)})) : INITIAL_ANNOUNCEMENTS;
  });

  const [applications, setApplications] = useState<AttorneyApplication[]>(() => {
      const saved = localStorage.getItem('immi_data_applications');
      return saved ? JSON.parse(saved).map((a: any) => ({...a, submittedDate: new Date(a.submittedDate)})) : INITIAL_APPLICATIONS;
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('immi_data_attorneys', JSON.stringify(attorneys));
  }, [attorneys]);

  useEffect(() => {
    localStorage.setItem('immi_data_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('immi_data_applications', JSON.stringify(applications));
  }, [applications]);

  const addAttorney = (data: Omit<Attorney, 'id'>) => {
      const newAttorney = { ...data, id: Date.now().toString() };
      setAttorneys(prev => [...prev, newAttorney]);
  };

  const deleteAttorney = (id: string) => {
      setAttorneys(prev => prev.filter(a => a.id !== id));
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

  const submitApplication = (appData: Omit<AttorneyApplication, 'id' | 'status' | 'submittedDate'>) => {
      const newApp: AttorneyApplication = {
          ...appData,
          id: `app_${Date.now()}`,
          status: 'pending',
          submittedDate: new Date()
      };
      setApplications(prev => [...prev, newApp]);
  };

  const approveApplication = (id: string) => {
      const app = applications.find(a => a.id === id);
      if (!app) return;

      // Convert Application to Attorney Listing
      const newAttorney: Attorney = {
          id: Date.now().toString(),
          name: `${app.firstName} ${app.lastName}`,
          firm: app.firmName,
          image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=200&h=200', // Default placeholder
          specialties: app.specialties,
          languages: ['English'], // Default, user can edit later
          rating: 5.0, // New listings start high
          reviewCount: 0,
          successRate: 100,
          priceStart: app.partnershipModel === 'lead_gen' ? 150 : 250, // Guess based on model
          isVerified: true,
          nextAvailable: 'Available Now'
      };

      setAttorneys(prev => [...prev, newAttorney]);
      setApplications(prev => prev.filter(a => a.id !== id));
  };

  const rejectApplication = (id: string) => {
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