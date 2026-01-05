
import React from 'react';
import Header from '../components/Header';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-surface min-h-screen">
      <Header title="Privacy Policy" />
      <div className="max-w-3xl mx-auto p-6 md:p-10 bg-white shadow-sm border border-border mt-6 rounded-3xl mb-12">
        <h1 className="text-3xl font-black text-text-main italic uppercase tracking-tight mb-8">Privacy Policy</h1>
        
        <div className="prose prose-sm text-text-secondary space-y-6">
          <section>
            <h2 className="text-lg font-bold text-text-main uppercase tracking-widest text-xs">Introduction</h2>
            <p>At VexoKart, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our website.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-main uppercase tracking-widest text-xs">Data Collection</h2>
            <p>We may collect information you provide directly to us, such as your name, email address, phone number, and shipping address when you create an account or make a purchase. We also automatically collect certain information when you browse our site, including your IP address and browsing behavior.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-main uppercase tracking-widest text-xs">Cookies and Tracking</h2>
            <p>VexoKart uses cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can choose to disable cookies through your browser settings, though this may affect site functionality.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-main uppercase tracking-widest text-xs">Google AdSense & Third-Party Advertising</h2>
            <p>We use third-party advertising companies, including Google AdSense, to serve ads when you visit our website. These companies may use information about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.</p>
            <p>Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of the DART cookie enables it to serve ads to our users based on their visit to our sites and other sites on the Internet.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-main uppercase tracking-widest text-xs">Your Consent</h2>
            <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-main uppercase tracking-widest text-xs">Contact Information</h2>
            <p>If you have any questions about our privacy practices, please contact us at <span className="text-accent font-bold">bictcomputereducation1@gmail.com</span>.</p>
          </section>

          <p className="text-[10px] text-text-muted italic pt-8 border-t border-border">Last updated: October 2023</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
