import React, { useState } from 'react';
import { ViewState } from '../App';
import { useData } from '../contexts/DataContext';
import { 
  Briefcase, 
  CheckCircle, 
  User, 
  Building, 
  FileText, 
  CreditCard, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  ShieldCheck,
  Star,
  Users
} from 'lucide-react';

interface AttorneyOnboardingProps {
    onViewChange: (view: ViewState) => void;
}

export const AttorneyOnboarding: React.FC<AttorneyOnboardingProps> = ({ onViewChange }) => {
    const { submitApplication } = useData();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        firmName: '',
        barState: '',
        barNumber: '',
        yearAdmitted: '',
        specialties: [] as string[],
        bio: '',
        partnershipModel: 'lead_gen' // 'lead_gen' | 'subscription' | 'commission'
    });

    const specialtiesList = [
        "Family Immigration", "Deportation Defense", "Employment Visas", 
        "Asylum", "Student Visas", "Investor Visas (EB-5)", "Naturalization"
    ];

    const toggleSpecialty = (spec: string) => {
        if (formData.specialties.includes(spec)) {
            setFormData({...formData, specialties: formData.specialties.filter(s => s !== spec)});
        } else {
            setFormData({...formData, specialties: [...formData.specialties, spec]});
        }
    };

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Submit to global context
        submitApplication(formData);

        setIsSubmitting(false);
        setStep(5); // Success step
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-8 gap-2">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i <= step ? 'bg-blue-600 w-8' : 'bg-slate-200 w-2'}`} />
            ))}
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in pb-20 pt-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-3">
                    <Briefcase className="w-8 h-8 text-blue-600" />
                    Partner Application
                </h1>
                <p className="text-slate-500">Join the ImmiGuide network and connect with qualified clients.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
                {step < 5 && (
                    <div className="bg-slate-50 p-4 border-b border-slate-100">
                        {renderStepIndicator()}
                        <h2 className="text-center font-bold text-slate-800 text-lg">
                            {step === 1 && "Personal & Firm Information"}
                            {step === 2 && "Credential Verification"}
                            {step === 3 && "Professional Profile"}
                            {step === 4 && "Select Partnership Model"}
                        </h2>
                    </div>
                )}

                <div className="p-8 flex-1 flex flex-col">
                    
                    {/* Step 1: Basics */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                        <input 
                                            value={formData.firstName}
                                            onChange={e => setFormData({...formData, firstName: e.target.value})}
                                            className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Jane"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                                    <input 
                                        value={formData.lastName}
                                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Professional Email</label>
                                <input 
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="jane@lawfirm.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Law Firm Name</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input 
                                        value={formData.firmName}
                                        onChange={e => setFormData({...formData, firmName: e.target.value})}
                                        className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Doe & Associates, PLLC"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Verification */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-sm text-blue-800 mb-6">
                                <ShieldCheck className="w-5 h-5 shrink-0" />
                                <p>We verify every attorney against state bar records to ensure the safety of our users.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">State of Primary Licensure</label>
                                <select 
                                    value={formData.barState}
                                    onChange={e => setFormData({...formData, barState: e.target.value})}
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="">Select State</option>
                                    <option value="CA">California</option>
                                    <option value="NY">New York</option>
                                    <option value="TX">Texas</option>
                                    <option value="FL">Florida</option>
                                    {/* Add more as needed */}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Bar Number</label>
                                    <input 
                                        value={formData.barNumber}
                                        onChange={e => setFormData({...formData, barNumber: e.target.value})}
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. 123456"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Year Admitted</label>
                                    <input 
                                        type="number"
                                        value={formData.yearAdmitted}
                                        onChange={e => setFormData({...formData, yearAdmitted: e.target.value})}
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. 2015"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Profile */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Primary Practice Areas</label>
                                <div className="flex flex-wrap gap-2">
                                    {specialtiesList.map(spec => (
                                        <button
                                            key={spec}
                                            onClick={() => toggleSpecialty(spec)}
                                            className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all ${formData.specialties.includes(spec) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
                                        >
                                            {spec}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Professional Bio</label>
                                <textarea 
                                    value={formData.bio}
                                    onChange={e => setFormData({...formData, bio: e.target.value})}
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                                    placeholder="Tell potential clients about your experience and approach..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Business Model */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <h3 className="text-center font-bold text-slate-900">How would you like to partner with us?</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Lead Gen */}
                                <div 
                                    onClick={() => setFormData({...formData, partnershipModel: 'lead_gen'})}
                                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.partnershipModel === 'lead_gen' ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-opacity-20' : 'border-slate-200 hover:border-blue-300'}`}
                                >
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-bold text-slate-900">Lead Generation</h4>
                                    <p className="text-xs text-slate-500 mt-2">Pay per qualified consultation booked.</p>
                                    <div className="mt-4 font-bold text-2xl text-slate-900">$45<span className="text-sm text-slate-400 font-normal">/booking</span></div>
                                </div>

                                {/* Subscription */}
                                <div 
                                    onClick={() => setFormData({...formData, partnershipModel: 'subscription'})}
                                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.partnershipModel === 'subscription' ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-opacity-20' : 'border-slate-200 hover:border-blue-300'}`}
                                >
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                                        <Star className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-bold text-slate-900">Premium Listing</h4>
                                    <p className="text-xs text-slate-500 mt-2">Featured placement & direct contact info.</p>
                                    <div className="mt-4 font-bold text-2xl text-slate-900">$199<span className="text-sm text-slate-400 font-normal">/mo</span></div>
                                </div>

                                {/* Commission */}
                                <div 
                                    onClick={() => setFormData({...formData, partnershipModel: 'commission'})}
                                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.partnershipModel === 'commission' ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-opacity-20' : 'border-slate-200 hover:border-blue-300'}`}
                                >
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 text-green-600">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-bold text-slate-900">Commission</h4>
                                    <p className="text-xs text-slate-500 mt-2">Revenue share on successful case retainers.</p>
                                    <div className="mt-4 font-bold text-2xl text-slate-900">15%<span className="text-sm text-slate-400 font-normal">/case</span></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Success */}
                    {step === 5 && (
                        <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in-95">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Received!</h2>
                            <p className="text-slate-500 max-w-md mx-auto mb-8">
                                Thank you, {formData.firstName}. Our verification team will review your credentials against the {formData.barState} State Bar records. You will receive an email within 24-48 hours.
                            </p>
                            <button 
                                onClick={() => onViewChange('marketplace')}
                                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                            >
                                Return to Marketplace
                            </button>
                        </div>
                    )}

                    {/* Footer Controls */}
                    {step < 5 && (
                        <div className="mt-auto pt-8 flex justify-between border-t border-slate-100">
                            {step > 1 ? (
                                <button 
                                    onClick={handleBack}
                                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold px-4 py-2"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {step < 4 ? (
                                <button 
                                    onClick={handleNext}
                                    disabled={
                                        (step === 1 && (!formData.firstName || !formData.lastName || !formData.email)) ||
                                        (step === 2 && (!formData.barNumber || !formData.barState))
                                    }
                                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                                >
                                    Next Step <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-200 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                    Submit Application
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};