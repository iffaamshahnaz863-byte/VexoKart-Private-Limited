
import React, { useEffect } from 'react';
import Header from '../components/Header';

const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-surface min-h-screen">
      <Header title="Privacy Protocol" />
      <article className="max-w-4xl mx-auto p-6 md:p-16 bg-white shadow-premium border border-border mt-10 rounded-3xl mb-20">
        <header className="mb-12 border-b border-gray-100 pb-8">
            <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-2 block">VEXOKART</span>
            <h1 className="text-4xl font-black text-text-main italic uppercase tracking-tight leading-none">Privacy Policy &<br/>Data Protection</h1>
            <p className="text-text-muted text-xs font-bold mt-4 uppercase tracking-widest">Effective Date: April 2026</p>
        </header>
        
        <div className="prose prose-sm text-text-secondary space-y-12 leading-relaxed text-base">
          <section>
            <h2 className="text-lg font-black text-text-main uppercase tracking-[0.2em] italic mb-4 border-l-4 border-primary pl-4">1. Introduction</h2>
            <p>At VEXOKART, we value the trust you place in us. This policy outlines how we collect, use, and protect your personal information when you use our website. We are committed to processing your data with transparency and in accordance with the Information Technology Act, 2000 (India) and global best practices.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-text-main uppercase tracking-[0.2em] italic mb-4 border-l-4 border-primary pl-4">2. Information We Collect</h2>
            <p>We collect information to provide and improve our services. This includes:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Personal Information:</strong> Name, email address, phone number, and shipping address, collected during account creation or checkout.</li>
                <li><strong>Transactional Data:</strong> Details of orders and service requests. Payments are processed securely via gateways and not stored by us.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, and device information to optimize site performance and security.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-text-main uppercase tracking-[0.2em] italic mb-4 border-l-4 border-primary pl-4">3. How We Use Your Data</h2>
            <p>Your data is used strictly for:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Processing and delivering your orders.</li>
                <li>Communicating with you regarding order status, updates, or support.</li>
                <li>Improving our platform's functionality and user experience.</li>
                <li>Legal compliance and fraud prevention.</li>
            </ul>
            <p className="mt-4 font-bold">We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-text-main uppercase tracking-[0.2em] italic mb-4 border-l-4 border-primary pl-4">4. Data Security</h2>
            <p>We implement industry-standard security measures, including SSL encryption and secure server environments powered by Supabase, to protect your data from unauthorized access, alteration, or destruction.</p>
          </section>

          <section className="pt-12 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="flex-1">
                    <p className="text-sm font-black text-text-main uppercase tracking-widest italic mb-2">Contact Grievance Officer</p>
                    <p className="leading-relaxed text-sm">If you have any questions regarding this Privacy Policy or wish to exercise your data rights, please contact our Grievance Officer:</p>
                    <p className="font-bold text-gray-900 mt-4">Compliance Lead</p>
                    <p className="text-primary font-bold">support@vexokart.com</p>
                    <p className="text-xs text-gray-500 mt-1">VEXOKART, India.</p>
                </div>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
};

export default PrivacyPolicyPage;
