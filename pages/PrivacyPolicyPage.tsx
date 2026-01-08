import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-surface min-h-screen">
      <Header />
      <article className="max-w-4xl mx-auto p-6 md:p-16 bg-white shadow-premium border border-border mt-10 rounded-3xl mb-20">
        <header className="mb-12 border-b border-gray-100 pb-8">
            <span className="text-[10px] font-black uppercase text-accent tracking-[0.3em] mb-2 block">Transparency Protocol</span>
            <h1 className="text-4xl font-black text-text-main italic uppercase tracking-tight leading-none">Privacy & Data<br/>Sovereignty Manifest</h1>
        </header>
        
        <div className="prose prose-sm text-text-secondary space-y-12 leading-relaxed text-base">
          <section>
            <h2 className="text-lg font-black text-text-main uppercase tracking-[0.2em] italic mb-4 border-l-4 border-accent pl-4">1. Data Governance</h2>
            <p>At VexoKart, we treat user data as a critical asset requiring the highest level of security. When you interact with our authorized marketplace, we collect specific identifiers to provide a personalized, frictionless commerce experience. This includes Identity Data (full name, email, phone) and Logistics Data (shipping addresses and transaction history).</p>
          </section>

          <section className="bg-accent/5 p-8 rounded-3xl border border-accent/10">
            <h2 className="text-lg font-black text-accent uppercase tracking-[0.2em] italic mb-4">2. Google AdSense & Third-Party Cookies</h2>
            <p>We partner with third-party advertising entities, specifically **Google AdSense**, to deliver relevant promotional content. These partners may use cookies, web beacons, and unique identifiers to understand your browsing patterns on VexoKart and other digital nodes.</p>
            <ul className="list-disc pl-6 mt-4 space-y-3 font-medium text-gray-700">
                <li>Google, as a third-party vendor, uses cookies to serve ads based on your visits to our platform and other sites on the Internet.</li>
                <li>Google's use of the **DART cookie** enables it to serve ads to our users based on their browsing behavior across the web.</li>
                <li>You may opt-out of personalized advertising by visiting the Google ad and content network privacy policy at: <a href="https://policies.google.com/technologies/ads" className="text-accent underline font-bold" target="_blank" rel="noopener noreferrer">policies.google.com/technologies/ads</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-text-main uppercase tracking-[0.2em] italic mb-4 border-l-4 border-accent pl-4">3. Information Sovereignty</h2>
            <p>Consistent with global protection standards like GDPR and CCPA, VexoKart users possess the right to access, rectify, or erase their personal data manifests. You can request a digital copy of your data profile or initiate account termination via the User Console or by contacting our Data Protection Officer.</p>
          </section>

          <section className="pt-12 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="flex-1">
                    <p className="text-sm font-black text-text-main uppercase tracking-widest italic mb-2">Support & Inquiries</p>
                    <p className="leading-relaxed">For questions regarding this manifest or to exercise your digital rights, contact our node at:</p>
                    <p className="text-accent font-black mt-2 text-lg">bictcomputereducation1@gmail.com</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex-shrink-0 text-right">
                    <p className="text-[10px] font-black uppercase text-gray-400">Document Version</p>
                    <p className="text-xs font-bold text-gray-900">3.4.0 • October 2024</p>
                    <p className="text-[10px] font-black uppercase text-gray-400 mt-4">Node Identity</p>
                    <p className="text-xs font-bold text-gray-900">VXK-COMPLIANCE-01</p>
                </div>
            </div>
          </section>
        </div>
      </article>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;