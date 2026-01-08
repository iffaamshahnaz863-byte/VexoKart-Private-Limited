import React from 'react';
import Header from '../components/Header';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-surface min-h-screen">
      <Header title="Privacy Policy" />
      <div className="max-w-4xl mx-auto p-6 md:p-12 bg-white shadow-premium border border-border mt-6 rounded-3xl mb-12">
        <h1 className="text-4xl font-black text-text-main italic uppercase tracking-tight mb-10 border-b-4 border-accent pb-4 inline-block">Privacy Protocol</h1>
        
        <div className="prose prose-sm text-text-secondary space-y-10 leading-relaxed">
          <section>
            <h2 className="text-lg font-black text-text-main uppercase tracking-[0.2em] italic mb-4">1. Data Sovereignty and Collection</h2>
            <p>At VexoKart, we treat your data as a critical asset that requires the highest level of protection. When you interact with our platform, we collect certain identifiers to provide a personalized commerce experience. This includes:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Identity Data:</strong> Full name, verified email address, and encrypted phone number.</li>
                <li><strong>Transaction Data:</strong> Delivery addresses, billing history, and order preferences.</li>
                <li><strong>Technical Data:</strong> IP address, device telemetry, browser type, and navigation patterns via log files.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-text-main uppercase tracking-[0.2em] italic mb-4">2. Cookies and Tracking Technologies</h2>
            <p>VexoKart utilizes standard industry tracking mechanisms, including cookies and web beacons, to enhance platform performance. These small data fragments allow us to remember your session state, maintain your shopping bag, and understand traffic distribution across our marketplace nodes.</p>
          </section>

          <section className="bg-accent/5 p-6 rounded-2xl border border-accent/10">
            <h2 className="text-lg font-black text-accent uppercase tracking-[0.2em] italic mb-4">3. Google AdSense & Third-Party Advertising</h2>
            <p>We partner with third-party advertising entities, specifically **Google AdSense**, to deliver relevant promotional content. Please note the following regarding your privacy and these ads:</p>
            <ul className="list-disc pl-6 space-y-3 mt-4">
                <li>Google, as a third-party vendor, uses cookies to serve ads on VexoKart based on your visit to this site and other sites on the Internet.</li>
                <li>Google's use of the **DART cookie** enables it to serve ads to our users based on their browsing behavior across the web.</li>
                <li>Users may opt out of the use of the DART cookie by visiting the Google ad and content network privacy policy at the following URL: <a href="https://policies.google.com/technologies/ads" className="text-accent font-bold underline">https://policies.google.com/technologies/ads</a></li>
                <li>These third-party ad servers or ad networks use technology in their respective advertisements and links that appear on VexoKart, which are sent directly to your browser. They automatically receive your IP address when this occurs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-text-main uppercase tracking-[0.2em] italic mb-4">4. GDPR & CCPA Compliance</h2>
            <p>Consistent with global data protection standards, users have the following rights regarding their personal information stored on VexoKart:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Right to Access:</strong> You can request a digital copy of your data manifest at any time.</li>
                <li><strong>Right to Erasure:</strong> You may request the termination of your account and the deletion of all associated personal identifiers.</li>
                <li><strong>Right to Object:</strong> You can opt-out of marketing communications and behavioral tracking via your Profile Settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-text-main uppercase tracking-[0.2em] italic mb-4">5. Information Security Protocol</h2>
            <p>VexoKart implements SSL (Secure Sockets Layer) encryption for all data transmissions. Financial information is never stored on our local servers; all payment processing is routed through PCI-DSS certified partners like Razorpay to ensure your credit card and UPI details remain immutable and protected.</p>
          </section>

          <section className="pt-8 border-t border-border">
            <p className="text-sm font-bold text-text-main uppercase">Support & Inquiries</p>
            <p className="mt-2 leading-relaxed">If you have questions regarding this protocol or wish to exercise your data rights, please contact our Data Protection Officer at:</p>
            <p className="text-accent font-black mt-2">bictcomputereducation1@gmail.com</p>
          </section>

          <p className="text-[10px] text-text-muted italic pt-8 border-t border-border">Manifest Version: 2.1 • Last Synchronized: October 2024</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;