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
            <span className="text-[10px] font-black uppercase text-accent tracking-[0.3em] mb-2 block">Vexo Kart Private Limited</span>
            <h1 className="text-4xl font-black text-text-main italic uppercase tracking-tight leading-none">Privacy Policy &<br/>Data Protection</h1>
            <p className="text-text-muted text-xs font-bold mt-4 uppercase tracking-widest">Effective Date: October 2024</p>
        </header>
        
        <div className="prose prose-sm text-text-secondary space-y-12 leading-relaxed text-base">
          <section>
            <h2 className="text-lg font-black text-text-main uppercase tracking-[0.2em] italic mb-4 border-l-4 border-accent pl-4">1. Introduction</h2>
            <p>At Vexo Kart (operated by Vexo Kart Private Limited), we value the trust you place in us. This policy outlines how we collect, use, and protect your personal information when you use our website. We are committed to processing your data with transparency and in accordance with the Information Technology Act, 2000 (India) and global best practices.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-text-main uppercase tracking-[0.2em] italic mb-4 border-l-4 border-accent pl-4">2. Information We Collect</h2>
            <p>We collect information to provide and improve our services. This includes:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Personal Information:</strong> Name, email address, phone number, and shipping address, collected during account creation or checkout.</li>
                <li><strong>Transactional Data:</strong> Details of orders, payments (processed securely via gateways), and service requests.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, and device information to optimize site performance and security.</li>
            </ul>
          </section>

          <section className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
            <h2 className="text-lg font-black text-blue-900 uppercase tracking-[0.2em] italic mb-4">3. Advertising & Cookies (Google AdSense)</h2>
            <p>We use third-party advertising companies, specifically <strong>Google AdSense</strong>, to serve ads when you visit our website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.</p>
            <div className="mt-4 space-y-3 font-medium text-blue-800 text-sm">
                <p><strong>Cookie Usage:</strong> Google uses cookies to serve ads based on a user's prior visits to your website or other websites.</p>
                <p><strong>DoubleClick DART Cookie:</strong> Google's use of the DART cookie enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</p>
                <p><strong>Opt-Out:</strong> Users may opt-out of the use of the DART cookie by visiting the Google ad and content network privacy policy at <a href="https://policies.google.com/technologies/ads" className="underline font-bold" target="_blank" rel="noopener noreferrer">policies.google.com/technologies/ads</a>.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-black text-text-main uppercase tracking-[0.2em] italic mb-4 border-l-4 border-accent pl-4">4. How We Use Your Data</h2>
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
            <h2 className="text-lg font-black text-text-main uppercase tracking-[0.2em] italic mb-4 border-l-4 border-accent pl-4">5. Data Security</h2>
            <p>We implement industry-standard security measures, including SSL encryption and secure server environments, to protect your data from unauthorized access, alteration, or destruction. Payment information is processed by PCI-DSS compliant gateways and is never stored on our servers.</p>
          </section>

          <section className="pt-12 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="flex-1">
                    <p className="text-sm font-black text-text-main uppercase tracking-widest italic mb-2">Contact Grievance Officer</p>
                    <p className="leading-relaxed text-sm">If you have any questions regarding this Privacy Policy or wish to exercise your data rights, please contact our Grievance Officer:</p>
                    <p className="font-bold text-gray-900 mt-4">Mr. Compliance Lead</p>
                    <p className="text-accent font-bold">support@vexokart.com</p>
                    <p className="text-xs text-gray-500 mt-1">Vexo Kart Private Limited, India.</p>
                </div>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
};

export default PrivacyPolicyPage;