import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LegalDocViewer } from './LegalDocViewer';
import { 
  Compass, 
  Menu, 
  X, 
  Check, 
  Star, 
  ArrowRight, 
  Bot, 
  FileText, 
  TrendingUp, 
  MessageCircle, 
  Search, 
  Settings, 
  ChevronDown,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Loader2,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  FileSearch,
  Briefcase,
  Mail,
  User,
  Maximize,
  Minimize,
  AlertTriangle
} from 'lucide-react';

// --- Styles (Ported from provided HTML) ---
const LandingPageStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');

    .landing-wrapper {
        font-family: 'Poppins', sans-serif;
        line-height: 1.5;
        color: #333;
        background-color: #fff;
        overflow-x: hidden;
        font-size: 15px;
    }

    .landing-wrapper * {
        box-sizing: border-box;
    }

    /* Header Styles */
    .landing-header {
        background: rgba(255, 255, 255, 0.95);
        color: #333;
        padding: 15px 4%;
        position: fixed;
        width: 100%;
        top: 0;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
    }

    .landing-header.scrolled {
        padding: 10px 4%;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin: 0;
    }

    .logo {
        display: flex;
        align-items: center;
        font-size: 1.6rem;
        font-weight: 800;
        text-decoration: none;
        color: #333;
    }

    .logo-icon {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #002868, #0052A5);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
        color: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .nav-menu {
        display: flex;
        list-style: none;
        align-items: center;
        margin: 0;
        padding: 0;
    }

    .nav-menu li {
        margin-left: 2rem;
    }

    .nav-menu li a, .nav-menu li button {
        color: #333;
        text-decoration: none;
        font-weight: 500;
        position: relative;
        padding: 0.3rem 0;
        font-size: 0.95rem;
        transition: color 0.3s;
        background: none;
        border: none;
        cursor: pointer;
        font-family: inherit;
    }

    .nav-menu li a:hover, .nav-menu li button:hover {
        color: #0052A5;
    }

    .nav-cta {
        background: linear-gradient(135deg, #002868, #0052A5) !important;
        color: white !important;
        padding: 0.5rem 1.2rem !important;
        border-radius: 50px;
        font-weight: 600 !important;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        font-size: 0.9rem !important;
        transition: transform 0.3s, box-shadow 0.3s !important;
    }
    
    .nav-cta:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        color: white !important;
    }

    .mobile-menu-toggle {
        display: none;
        background: none;
        border: none;
        color: #333;
        cursor: pointer;
    }

    /* Hero Section */
    .hero {
        background: linear-gradient(135deg, rgba(0, 40, 104, 0.95), rgba(0, 82, 165, 0.95)), url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2072&auto=format&fit=crop') center/cover;
        color: white;
        padding: 160px 4% 100px;
        text-align: center;
        position: relative;
        width: 100%;
    }

    .hero-content {
        width: 100%;
        margin: 0 auto;
        position: relative;
        z-index: 1;
    }

    .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        padding: 0.4rem 1rem;
        border-radius: 50px;
        font-size: 0.85rem;
        font-weight: 600;
        margin-bottom: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .hero h1 {
        font-size: 3.5rem;
        margin-bottom: 1rem;
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: -0.02em;
    }

    .hero p {
        font-size: 1.3rem;
        margin-bottom: 2rem;
        opacity: 0.9;
        max-width: 900px;
        margin-left: auto;
        margin-right: auto;
    }

    .hero-buttons {
        display: flex;
        justify-content: center;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .btn {
        display: inline-block;
        padding: 0.8rem 2rem;
        border-radius: 50px;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.3s;
        border: none;
        cursor: pointer;
        font-size: 1rem;
    }

    .btn-primary {
        background: white;
        color: #002868;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .btn-primary:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }

    .btn-outline {
        background-color: transparent;
        color: white;
        border: 2px solid white;
    }

    .btn-outline:hover {
        background-color: white;
        color: #002868;
    }

    /* Section Styles */
    .landing-section {
        padding: 80px 4%;
        position: relative;
        width: 100%;
    }

    .section-header {
        text-align: center;
        margin-bottom: 4rem;
        width: 100%;
        margin-left: auto;
        margin-right: auto;
    }

    .section-header h2 {
        font-size: 2.8rem;
        margin-bottom: 1rem;
        color: #002868;
        font-weight: 800;
        letter-spacing: -0.02em;
        position: relative;
        display: inline-block;
    }

    .section-header h2::after {
        content: '';
        position: absolute;
        width: 50%;
        height: 4px;
        background: linear-gradient(90deg, #0052A5, #0077BE);
        bottom: -8px;
        left: 25%;
        border-radius: 2px;
    }

    .section-header p {
        font-size: 1.15rem;
        color: #666;
        max-width: 800px;
        margin: 1.5rem auto 0;
    }

    /* Features Section */
    .features-section {
        background-color: #f8f9fa;
    }

    .features {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 2rem;
        width: 100%;
        margin: 0 auto;
    }

    .feature-card {
        background: white;
        border-radius: 12px;
        padding: 2.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: all 0.3s;
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .feature-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, #0052A5, #0077BE);
    }

    .feature-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }

    .feature-icon {
        width: 70px;
        height: 70px;
        background: linear-gradient(135deg, #0052A5, #0077BE);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;
        color: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.3s;
    }

    .feature-card:hover .feature-icon {
        transform: scale(1.1) rotate(5deg);
    }

    .feature-card h3 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        color: #333;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .feature-card p {
        color: #666;
        margin-bottom: 1.5rem;
        flex-grow: 1;
        font-size: 1rem;
        line-height: 1.6;
    }

    .feature-link {
        color: #0052A5;
        font-weight: 600;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        transition: all 0.3s;
        font-size: 1rem;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
    }

    .feature-link svg {
        margin-left: 6px;
        transition: all 0.3s;
        width: 18px;
        height: 18px;
    }

    .feature-link:hover svg {
        transform: translateX(5px);
    }

    /* How It Works Section */
    .how-it-works {
        background: white;
    }

    .process-steps {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        width: 100%;
        margin: 0 auto;
        position: relative;
        gap: 2rem;
    }

    @media (min-width: 992px) {
        .process-steps::before {
            content: '';
            position: absolute;
            top: 60px;
            left: 5%;
            right: 5%;
            height: 3px;
            background: linear-gradient(90deg, #0077BE, #4A90E2);
            z-index: 0;
            border-radius: 2px;
        }
    }

    .step {
        flex: 1;
        min-width: 250px;
        text-align: center;
        position: relative;
        z-index: 1;
        padding: 0 15px;
        margin-bottom: 2rem;
    }

    .step-number {
        width: 120px;
        height: 120px;
        background: white;
        border: 4px solid #0077BE;
        color: #0052A5;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        font-weight: 800;
        margin: 0 auto 1.5rem;
        position: relative;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: all 0.3s;
    }

    .step:hover .step-number {
        background: linear-gradient(135deg, #0052A5, #0077BE);
        color: white;
        border-color: transparent;
        transform: scale(1.1);
    }

    .step h3 {
        font-size: 1.4rem;
        margin-bottom: 1rem;
        color: #333;
        font-weight: 700;
    }

    .step p {
        color: #666;
        font-size: 1rem;
    }

    /* Stats Section */
    .stats-section {
        background: linear-gradient(135deg, #002868, #0052A5);
        color: white;
        padding: 80px 4%;
        width: 100%;
    }

    .stats-container {
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        width: 100%;
        margin: 0 auto;
        gap: 3rem;
    }

    .stat-item {
        text-align: center;
        padding: 1rem;
        min-width: 200px;
    }

    .stat-number {
        font-size: 3.5rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
    }

    .stat-label {
        font-size: 1.2rem;
        opacity: 0.9;
        font-weight: 500;
    }

    /* Testimonials Section */
    .testimonials {
        background-color: #f8f9fa;
    }

    .testimonial-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 2rem;
        width: 100%;
        margin: 0 auto;
    }

    .testimonial-card {
        background: white;
        border-radius: 12px;
        padding: 2.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
        position: relative;
        transition: all 0.3s;
        flex: 1 1 350px;
    }

    .testimonial-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }

    .testimonial-text {
        font-style: italic;
        margin-bottom: 1.5rem;
        color: #333;
        position: relative;
        z-index: 1;
        font-size: 1.1rem;
        line-height: 1.6;
    }

    .testimonial-author {
        display: flex;
        align-items: center;
    }

    .author-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        margin-right: 15px;
        object-fit: cover;
        border: 2px solid #e0e0e0;
    }

    .author-info h4 {
        font-size: 1.2rem;
        margin-bottom: 0.2rem;
        color: #333;
        font-weight: 700;
    }

    .author-info p {
        font-size: 0.95rem;
        color: #666;
    }

    .rating {
        color: #FFC627;
        margin-bottom: 1.2rem;
        font-size: 1.2rem;
        display: flex;
        gap: 2px;
    }

    /* Pricing Section */
    .pricing {
        background-color: white;
    }

    .pricing-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 2rem;
        width: 100%;
        margin: 0 auto;
    }

    .pricing-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 380px;
        overflow: hidden;
        transition: all 0.3s;
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1 1 320px;
    }

    .pricing-card.featured {
        transform: scale(1.05);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        border: 2px solid #0077BE;
        z-index: 2;
    }

    .pricing-card.featured::before {
        content: 'Best Value';
        position: absolute;
        top: 15px;
        right: -25px;
        background: linear-gradient(135deg, #002868, #0052A5);
        color: white;
        padding: 4px 35px;
        transform: rotate(45deg);
        font-size: 0.85rem;
        font-weight: 600;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1;
    }

    .pricing-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }

    .pricing-card.featured:hover {
        transform: scale(1.05) translateY(-8px);
    }

    .pricing-header {
        background: linear-gradient(135deg, #0052A5, #0077BE);
        color: white;
        padding: 2.5rem 1.5rem;
        text-align: center;
    }

    .pricing-title {
        font-size: 1.8rem;
        margin-bottom: 0.5rem;
        font-weight: 700;
    }

    .pricing-price {
        font-size: 3.5rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
    }

    .pricing-price span {
        font-size: 1rem;
        font-weight: 400;
        opacity: 0.8;
    }

    .pricing-description {
        opacity: 0.9;
        font-size: 1rem;
    }

    .pricing-body {
        padding: 2.5rem 2rem;
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .pricing-features {
        list-style: none;
        margin-bottom: 2rem;
        flex: 1;
    }

    .pricing-features li {
        margin-bottom: 1.2rem;
        display: flex;
        align-items: flex-start;
        font-size: 1rem;
        color: #555;
    }

    .pricing-features svg {
        color: #0077BE;
        margin-right: 12px;
        margin-top: 3px;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
    }

    /* FAQ Section */
    .faq {
        background-color: #f8f9fa;
    }

    .faq-container {
        width: 100%;
        max-width: 900px;
        margin: 0 auto;
    }

    .faq-item {
        background: white;
        border-radius: 12px;
        margin-bottom: 1rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: all 0.3s;
    }

    .faq-item:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .faq-question {
        padding: 1.5rem 2rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #333;
        font-size: 1.1rem;
        transition: all 0.3s;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
    }

    .faq-question:hover {
        background-color: rgba(0, 82, 165, 0.05);
    }

    .faq-question svg {
        transition: all 0.3s;
        color: #0052A5;
        width: 20px;
        height: 20px;
    }

    .faq-item.active .faq-question svg {
        transform: rotate(180deg);
    }

    .faq-answer {
        padding: 0 2rem;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease, padding 0.3s ease;
        color: #666;
        font-size: 1rem;
        line-height: 1.6;
    }

    .faq-item.active .faq-answer {
        padding: 0 2rem 1.5rem;
        max-height: 500px;
    }

    /* Footer */
    .landing-footer {
        background-color: #0A0E27;
        color: white;
        padding: 4rem 4% 2rem;
    }

    .footer-content {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        width: 100%;
        margin: 0 auto;
    }

    .footer-section {
        flex: 1;
        min-width: 250px;
        margin-bottom: 2rem;
        padding-right: 2rem;
    }

    .footer-section h3 {
        font-size: 1.3rem;
        margin-bottom: 1.5rem;
        color: white;
        font-weight: 700;
        position: relative;
        display: inline-block;
    }

    .footer-section h3::after {
        content: '';
        position: absolute;
        width: 30px;
        height: 3px;
        background: linear-gradient(90deg, #0052A5, #0077BE);
        bottom: -6px;
        left: 0;
        border-radius: 2px;
    }

    .footer-section p {
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 1.5rem;
        line-height: 1.6;
        font-size: 1rem;
    }

    .footer-section ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .footer-section ul li {
        margin-bottom: 0.8rem;
    }

    .footer-section ul li button, .footer-section ul li a {
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        transition: all 0.3s;
        display: inline-block;
        position: relative;
        font-size: 1rem;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
    }

    .footer-section ul li button:hover, .footer-section ul li a:hover {
        color: white;
    }

    .social-links {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
    }

    .social-links a {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 45px;
        height: 45px;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        color: white;
        transition: all 0.3s;
        font-size: 1.2rem;
    }

    .social-links a:hover {
        background: linear-gradient(135deg, #0052A5, #0077BE);
        transform: translateY(-3px);
    }

    .footer-bottom {
        text-align: center;
        padding-top: 2rem;
        margin-top: 2rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.9rem;
    }

    /* Responsive */
    @media (max-width: 992px) {
        .mobile-menu-toggle {
            display: block;
        }

        .nav-menu {
            position: fixed;
            top: 60px;
            left: 0;
            width: 100%;
            background: white;
            flex-direction: column;
            padding: 1.5rem;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            z-index: 999;
            align-items: flex-start;
        }

        .nav-menu.active {
            transform: translateX(0);
        }

        .nav-menu li {
            margin: 0.8rem 0;
            width: 100%;
        }

        .nav-menu li button, .nav-menu li a {
            display: block;
            padding: 0.5rem 0;
            width: 100%;
            text-align: left;
        }

        .nav-cta {
            margin-top: 0.8rem;
            text-align: center !important;
        }

        .hero h1 {
            font-size: 2.8rem;
        }

        .hero p {
            font-size: 1.1rem;
        }

        .pricing-card.featured {
            transform: scale(1);
        }
        
        .pricing-card {
            max-width: 100%;
        }
    }

    @media (max-width: 576px) {
        .hero h1 {
            font-size: 2.2rem;
        }
        
        .section-header h2 {
            font-size: 2rem;
        }
        
        .features {
            grid-template-columns: 1fr;
        }
    }
  `}</style>
);

// --- Login Modal ---
const LoginModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { login, signInWithEmail, signUpWithEmail, isLoading } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setError('');
            setEmail('');
            setPassword('');
            setName('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!email || !password || (isSignUp && !name)) {
            setError('Please fill in all fields.');
            return;
        }

        try {
            if (isSignUp) {
                await signUpWithEmail(email, password, name);
            } else {
                await signInWithEmail(email, password);
            }
            onClose();
        } catch (err: any) {
            setError(err.message || "Authentication failed");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-white/20">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500 z-10">
                    <X className="w-5 h-5" />
                </button>
                
                <div className="p-8">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <Compass className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-center text-slate-900 mb-1 font-poppins">
                        {isSignUp ? "Create an Account" : "Welcome Back"}
                    </h2>
                    <p className="text-center text-slate-500 mb-6 text-sm">
                        {isSignUp ? "Start your immigration journey today." : "Access your forms and dashboard."}
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isSignUp && (
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        )}
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? "Sign Up" : "Sign In")}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-6">
                        <div className="h-px bg-slate-200 flex-1"></div>
                        <span className="text-xs text-slate-400 font-medium">OR CONTINUE WITH</span>
                        <div className="h-px bg-slate-200 flex-1"></div>
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                await login();
                            } catch (err: any) {
                                setError(err.message || "Login failed");
                            }
                        }}
                        disabled={isLoading}
                        className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                        Google
                    </button>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-slate-500">
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}
                        </span>
                        <button 
                            type="button"
                            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                            className="ml-1 font-bold text-blue-600 hover:underline"
                        >
                            {isSignUp ? "Sign In" : "Sign Up"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AuthScreen: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [viewDoc, setViewDoc] = useState<'privacy' | 'terms' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  useEffect(() => {
      const handleScroll = () => setScrolled(window.scrollY > 50);
      window.addEventListener('scroll', handleScroll);
      
      const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
      document.addEventListener('fullscreenchange', handleFsChange);

      return () => {
          window.removeEventListener('scroll', handleScroll);
          document.removeEventListener('fullscreenchange', handleFsChange);
      };
  }, []);

  const scrollTo = (id: string) => {
      const el = document.getElementById(id);
      if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setMobileMenuOpen(false);
      }
  };

  const toggleFullscreen = async () => {
      try {
          if (!document.fullscreenElement) {
              await document.documentElement.requestFullscreen();
          } else {
              await document.exitFullscreen();
          }
      } catch (e) {
          console.error("Fullscreen error:", e);
          setError("Fullscreen not allowed in this environment.");
      }
  };

  return (
    <div className="landing-wrapper">
      <LandingPageStyles />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      {viewDoc && <LegalDocViewer docType={viewDoc} onClose={() => setViewDoc(null)} />}

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

      {/* --- Header --- */}
      <header className={`landing-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
            <button onClick={() => window.scrollTo(0,0)} className="logo">
                <div className="logo-icon">
                    <Compass size={24} />
                </div>
                Visa Guide AI
            </button>
            <nav>
                <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
                    <li><button onClick={() => scrollTo('features')}>Features</button></li>
                    <li><button onClick={() => scrollTo('how-it-works')}>How It Works</button></li>
                    <li><button onClick={() => scrollTo('pricing')}>Pricing</button></li>
                    <li><button onClick={() => scrollTo('testimonials')}>Reviews</button></li>
                    <li><button onClick={() => scrollTo('faq')}>FAQ</button></li>
                    <li>
                        <button onClick={toggleFullscreen} title="Toggle Fullscreen">
                            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </button>
                    </li>
                    <li><button onClick={() => setShowLogin(true)} className="nav-cta">Get Started</button></li>
                </ul>
            </nav>
            <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </header>

      {/* --- Hero --- */}
      <section className="hero">
        <div className="hero-content">
            <div className="hero-badge animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Bot size={16} /> Powered by Advanced AI Technology
            </div>
            <h1 className="animate-in fade-in slide-in-from-bottom-6 duration-1000">The American Dream, Decoded.</h1>
            <p className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                Save 10+ hours per case with intelligent automation. Get personalized strategies, 
                automated form preparation, and expert insights at a fraction of the cost.
            </p>
            <div className="hero-buttons animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <button onClick={() => setShowLogin(true)} className="btn btn-primary">Start Your Application</button>
                <button onClick={() => scrollTo('features')} className="btn btn-outline">Explore Features</button>
            </div>
        </div>
      </section>

      {/* --- Features --- */}
      <section id="features" className="features-section landing-section">
        <div className="section-header">
            <h2>Complete Immigration Toolkit</h2>
            <p>We've digitized the entire immigration attorney experience into a simple, AI-powered platform.</p>
        </div>
        <div className="features">
            {[
                { 
                    icon: <FileText size={28} />, 
                    title: "Smart Form Assistant", 
                    text: "Auto-fill complex forms like I-130, I-485, and N-400. Our AI validates your answers against USCIS rules in real-time." 
                },
                { 
                    icon: <Search size={28} />, 
                    title: "RFE Decoder", 
                    text: "Received a scary letter? Upload it. We explain exactly what's missing and draft the legal response for you instantly." 
                },
                { 
                    icon: <FileSearch size={28} />, 
                    title: "Risk Analyzer", 
                    text: "Pre-file scan for 'Red Flags'. We check income requirements, criminal history, and inadmissibility issues before you pay USCIS fees." 
                },
                { 
                    icon: <MessageCircle size={28} />, 
                    title: "Strategy Advisor", 
                    text: "24/7 AI Legal Assistant. Compare visas (K-1 vs CR-1), estimate timelines, and get answers to complex questions." 
                },
                { 
                    icon: <Globe size={28} />, 
                    title: "Translation Center", 
                    text: "Need a birth certificate translated? Get instant AI translations or order certified, notarized copies for official filing." 
                },
                { 
                    icon: <Lock size={28} />, 
                    title: "Secure Document Vault", 
                    text: "Bank-grade encrypted storage for your passports, tax returns, and evidence. Organize everything in one secure place." 
                },
            ].map((f, i) => (
                <div key={i} className="feature-card">
                    <div className="feature-icon">{f.icon}</div>
                    <h3>{f.title}</h3>
                    <p>{f.text}</p>
                    <button onClick={() => setShowLogin(true)} className="feature-link">
                        Try it now <ArrowRight />
                    </button>
                </div>
            ))}
        </div>
      </section>

      {/* --- How It Works --- */}
      <section id="how-it-works" className="how-it-works landing-section">
        <div className="section-header">
            <h2>Your Path to Approval</h2>
            <p>Our streamlined process makes immigration applications faster and more accurate than ever before.</p>
        </div>
        <div className="process-steps">
            {[
                { step: 1, title: "Check Eligibility", text: "Use our Risk Analyzer to ensure you qualify before starting." },
                { step: 2, title: "Auto-Fill Forms", text: "Answer simple questions. We generate the PDF forms for you." },
                { step: 3, title: "AI Review", text: "Our system scans for errors, missing dates, and inconsistencies." },
                { step: 4, title: "File with Confidence", text: "Print your perfect application package and track your status." }
            ].map((s, i) => (
                <div key={i} className="step">
                    <div className="step-number">{s.step}</div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                </div>
            ))}
        </div>
      </section>

      {/* --- Stats --- */}
      <section className="stats-section">
        <div className="stats-container">
            <div className="stat-item">
                <div className="stat-number">98%</div>
                <div className="stat-label">Success Rate</div>
            </div>
            <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Forms Generated</div>
            </div>
            <div className="stat-item">
                <div className="stat-number">10+</div>
                <div className="stat-label">Hours Saved Per Case</div>
            </div>
            <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">AI Support Available</div>
            </div>
        </div>
      </section>

      {/* --- Testimonials --- */}
      <section id="testimonials" className="testimonials landing-section">
        <div className="section-header">
            <h2>What Our Users Say</h2>
            <p>Join thousands of satisfied users who have transformed their immigration experience with our AI platform.</p>
        </div>
        <div className="testimonial-container">
            {[
                { name: "Alex R.", role: "CR-1 Applicant", text: "Visa Guide AI transformed my spouse petition process. What would have taken weeks was completed in days, and we were approved without any RFEs!" },
                { name: "Maria S.", role: "Immigration Attorney", text: "As an immigration lawyer, I was skeptical. But this tool has become indispensable for my practice, saving me hours of research time on complex RFEs." },
                { name: "James L.", role: "H-1B Applicant", text: "The RFE Decoder feature is incredible. It identified exactly what evidence was missing in my application that I would have never caught. Worth every penny!" },
            ].map((t, i) => (
                <div key={i} className="testimonial-card">
                    <div className="rating">
                        {[1,2,3,4,5].map(star => <Star key={star} size={16} fill="#FFC627" stroke="none" />)}
                    </div>
                    <p className="testimonial-text">"{t.text}"</p>
                    <div className="testimonial-author">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt={t.name} className="author-avatar" />
                        <div className="author-info">
                            <h4>{t.name}</h4>
                            <p>{t.role}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* --- Pricing --- */}
      <section id="pricing" className="pricing landing-section">
        <div className="section-header">
            <h2>Simple, Transparent Pricing</h2>
            <p>Choose the plan that fits your needs. No hidden legal fees.</p>
        </div>
        <div className="pricing-container">
            {/* One-Time Form */}
            <div className="pricing-card">
                <div className="pricing-header">
                    <h3 className="pricing-title">One-Time Form</h3>
                    <div className="pricing-price">$29<span>/form</span></div>
                    <p className="pricing-description">Perfect for single applications</p>
                </div>
                <div className="pricing-body">
                    <ul className="pricing-features">
                        <li><Check /> Single Form Access (e.g. I-130)</li>
                        <li><Check /> Real-time Error Checking</li>
                        <li><Check /> AI Field Validation</li>
                        <li><Check /> PDF Export</li>
                    </ul>
                    <button onClick={() => setShowLogin(true)} className="btn btn-primary" style={{width: '100%'}}>Buy Now</button>
                </div>
            </div>

            {/* Annual (Best Value) */}
            <div className="pricing-card featured">
                <div className="pricing-header">
                    <h3 className="pricing-title">Annual Pro</h3>
                    <div className="pricing-price">$29.99<span>/mo</span></div>
                    <p className="pricing-description">Billed annually ($359.88)</p>
                </div>
                <div className="pricing-body">
                    <ul className="pricing-features">
                        <li><Check /> <strong>Everything in Monthly</strong></li>
                        <li><Check /> 40% Discount</li>
                        <li><Check /> Priority Support</li>
                        <li><Check /> Unlimited Document Storage</li>
                        <li><Check /> Full RFE & Interview Access</li>
                    </ul>
                    <button onClick={() => setShowLogin(true)} className="btn btn-primary" style={{width: '100%'}}>Start Free Trial</button>
                </div>
            </div>

            {/* Monthly */}
            <div className="pricing-card">
                <div className="pricing-header">
                    <h3 className="pricing-title">Monthly Pro</h3>
                    <div className="pricing-price">$49.99<span>/mo</span></div>
                    <p className="pricing-description">Cancel anytime</p>
                </div>
                <div className="pricing-body">
                    <ul className="pricing-features">
                        <li><Check /> Unlimited Form Assistant</li>
                        <li><Check /> RFE Decoder (AI Analysis)</li>
                        <li><Check /> Strategy Advisor Chat</li>
                        <li><Check /> Interview Simulator</li>
                        <li><Check /> Legal Cover Letter Generator</li>
                    </ul>
                    <button onClick={() => setShowLogin(true)} className="btn btn-primary" style={{width: '100%'}}>Subscribe</button>
                </div>
            </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section id="faq" className="faq landing-section">
        <div className="section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Find answers to common questions about our AI-powered immigration platform.</p>
        </div>
        <div className="faq-container">
            {[
                { q: "What is the One-Time Form option?", a: "If you only need help with a single form (like an I-130), you can pay $29 once to unlock the AI assistant for that specific document. No subscription required." },
                { q: "How accurate is the AI analysis?", a: "Our AI algorithms have been trained on millions of case files and legal precedents. It achieves high accuracy in form completion and eligibility assessment. However, we always recommend human review for final submissions." },
                { q: "Is my data secure?", a: "Absolutely. We use bank-level AES-256 encryption and follow strict privacy standards. Your data is stored locally where possible and transmitted securely only for AI processing. We never share your data without consent." },
                { q: "Can I switch plans anytime?", a: "Yes, you can upgrade from One-Time to Pro, or switch between Monthly and Annual billing at any time from your dashboard." },
                { q: "Do you offer refunds?", a: "We offer a 7-day money-back guarantee for subscription plans if you haven't used premium features like Attorney Review." }
            ].map((item, i) => (
                <div key={i} className={`faq-item ${activeFaq === i ? 'active' : ''}`}>
                    <button className="faq-question" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                        {item.q}
                        <ChevronDown />
                    </button>
                    <div className="faq-answer">
                        {item.a}
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="landing-footer">
        <div className="footer-content">
            <div className="footer-section">
                <h3>Visa Guide AI</h3>
                <p>Revolutionizing immigration with AI-powered tools and expert guidance. Join thousands who have simplified their immigration journey with our platform.</p>
                <div className="social-links">
                    <a href="#"><Facebook size={20} /></a>
                    <a href="#"><Twitter size={20} /></a>
                    <a href="#"><Linkedin size={20} /></a>
                    <a href="#"><Instagram size={20} /></a>
                </div>
            </div>
            <div className="footer-section">
                <h3>Platform</h3>
                <ul>
                    <li><button onClick={() => scrollTo('features')}>Features</button></li>
                    <li><button onClick={() => scrollTo('pricing')}>Pricing</button></li>
                    <li><button onClick={() => setShowLogin(true)}>Success Stories</button></li>
                    <li><button onClick={() => setShowLogin(true)}>Attorney Network</button></li>
                </ul>
            </div>
            <div className="footer-section">
                <h3>Legal</h3>
                <ul>
                    <li><button onClick={() => setViewDoc('privacy')}>Privacy Policy</button></li>
                    <li><button onClick={() => setViewDoc('terms')}>Terms of Service</button></li>
                    <li><button>Cookie Policy</button></li>
                    <li><button>Disclaimer</button></li>
                </ul>
            </div>
            <div className="footer-section">
                <h3>Contact</h3>
                <ul>
                    <li><a href="mailto:mail@visaguideai.com">mail@visaguideai.com</a></li>
                    <li><button>Help Center</button></li>
                    <li><button>Press</button></li>
                </ul>
            </div>
        </div>
        <div className="footer-bottom">
            <p>&copy; 2024 Visa Guide AI. Not a law firm. Not affiliated with USCIS.</p>
        </div>
      </footer>
    </div>
  );
};