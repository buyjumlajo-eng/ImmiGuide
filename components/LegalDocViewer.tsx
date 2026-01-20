import React from 'react';
import { X, FileText, Shield } from 'lucide-react';

interface LegalDocViewerProps {
    docType: 'privacy' | 'terms';
    onClose: () => void;
}

export const LegalDocViewer: React.FC<LegalDocViewerProps> = ({ docType, onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            {docType === 'privacy' ? <Shield className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {docType === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                            </h2>
                            <p className="text-xs text-slate-500">Last Updated: October 26, 2024</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="prose prose-slate max-w-none">
                        {docType === 'privacy' ? (
                            <>
                                <h3>1. Introduction</h3>
                                <p>Welcome to <strong>Visa Guide AI</strong> ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong>visaguideai.com</strong>.</p>

                                <h3>2. Information We Collect</h3>
                                <p>We collect information that you voluntarily provide to us when you register on the Site, use our AI tools, or communicate with us.</p>
                                <ul>
                                    <li><strong>Personal Data:</strong> Name, email address, and contact information.</li>
                                    <li><strong>Immigration Data:</strong> Case details, form responses, and document contents uploaded for analysis.</li>
                                    <li><strong>Usage Data:</strong> Information about how you interact with our AI services.</li>
                                </ul>

                                <h3>3. How We Use Your Information</h3>
                                <p>We use the information we collect to:</p>
                                <ul>
                                    <li>Provide, operate, and maintain our AI services.</li>
                                    <li>Generate forms and letters based on your input.</li>
                                    <li>Improve our AI models (anonymized data only).</li>
                                    <li>Communicate with you regarding your account or updates.</li>
                                </ul>

                                <h3>4. Data Storage & Security</h3>
                                <p><strong>Local-First Storage:</strong> To maximize privacy, sensitive document data and form inputs are primarily stored in your browser's local storage. When data is sent to our servers or AI providers (e.g., Google Gemini), it is transmitted via encrypted channels (TLS/SSL).</p>
                                <p>We implement appropriate technical and organizational security measures to protect your data. However, no electronic transmission over the Internet is 100% secure.</p>

                                <h3>5. Third-Party Services</h3>
                                <p>We may share data with third-party vendors, service providers, contractors, or agents who perform services for us, such as:</p>
                                <ul>
                                    <li><strong>AI Processing:</strong> Google Cloud (Vertex AI/Gemini).</li>
                                    <li><strong>Payment Processing:</strong> Stripe.</li>
                                    <li><strong>Hosting:</strong> Cloud infrastructure providers.</li>
                                </ul>

                                <h3>6. Your Rights</h3>
                                <p>You have the right to access, correct, or delete your personal information. You can delete your data by clearing your browser cache or using the "Delete Account" feature in settings.</p>

                                <h3>7. Contact Us</h3>
                                <p>If you have questions about this privacy policy, please contact us at: <a href="mailto:mail@visaguideai.com" className="text-blue-600 hover:underline">mail@visaguideai.com</a></p>
                            </>
                        ) : (
                            <>
                                <h3>1. Acceptance of Terms</h3>
                                <p>By accessing or using <strong>Visa Guide AI</strong> (visaguideai.com), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>

                                <h3>2. Not Legal Advice</h3>
                                <p className="bg-red-50 p-4 border-l-4 border-red-500 text-red-800 font-medium my-4">
                                    CRITICAL DISCLAIMER: Visa Guide AI is an artificial intelligence tool, NOT a law firm. We do not provide legal advice, legal representation, or attorney-client privilege.
                                </p>
                                <p>The information, forms, and guidance provided by Visa Guide AI are for informational and educational purposes only. They should not be considered a substitute for the advice of a qualified immigration attorney. Immigration laws are complex and subject to change.</p>

                                <h3>3. User Responsibilities</h3>
                                <p>You are solely responsible for:</p>
                                <ul>
                                    <li>The accuracy, truthfulness, and completeness of all information you provide.</li>
                                    <li>Reviewing all generated forms and documents for errors before submission to any government authority (USCIS, DOS, etc.).</li>
                                    <li>Ensuring your use of the service complies with applicable laws.</li>
                                </ul>

                                <h3>4. Service Availability</h3>
                                <p>We strive to provide uninterrupted service but do not guarantee that the site will be available at all times. We reserve the right to modify, suspend, or discontinue any part of the service without notice.</p>

                                <h3>5. Limitation of Liability</h3>
                                <p>In no event shall Visa Guide AI, its directors, employees, or partners be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of data, denied visa applications, or other intangible losses, resulting from your use of the service.</p>

                                <h3>6. Subscription & Refunds</h3>
                                <p>Premium features are billed on a subscription or one-time basis. Refunds are handled on a case-by-case basis within 7 days of purchase if the service was not utilized.</p>

                                <h3>7. Governing Law</h3>
                                <p>These terms shall be governed by the laws of the State of Delaware, United States, without regard to its conflict of law provisions.</p>

                                <h3>8. Contact</h3>
                                <p>For legal inquiries, contact: <a href="mailto:mail@visaguideai.com" className="text-blue-600 hover:underline">mail@visaguideai.com</a></p>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 text-right">
                    <button 
                        onClick={onClose}
                        className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};