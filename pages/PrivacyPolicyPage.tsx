import React from 'react';
import Header from '../components/Header';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-surface min-h-screen">
      <Header title="Privacy Policy" />
      <div className="max-w-4xl mx-auto p-6 md:p-12 bg-white shadow-premium border border-border mt-6 rounded-3xl mb-12">
        <h1 className="text-4xl font-black text-text-main italic uppercase tracking-tight mb-10 border-b-4 border-accent pb-4 inline-block">Privacy Protocol</h1>
        
        <div className="prose prose-sm text-text-secondary space-y-10 leading-relaxed text-lg">
          <section>
            <h2 className="text-lg font-black text-text-main uppercase tracking-[0.2em] italic mb-4">1. Information Governance</h2>
            <p>At VexoKart, we treat your data as a critical asset that requires the highest level of protection. When you interact with our authorized marketplace, we collect various identifiers to provide a personalized commerce experience. This includes:</p>
            <ul className="list-disc pl-6 space-y-2 text-base">
                <li><strong>Identity Data:</strong> Full name, verified email address, and encrypted phone number for secure logins.</li>
                <li><strong>Logistics Data:</strong> Delivery addresses, billing history, and session-based checkout manifests.</li>
                <li><strong>Technical Telemetry:</strong> IP address, device type, browser fingerprint, and navigation patterns via secure log files.</li>
            </ul>
          </section>

          <section className="bg-accent/5 p-8 rounded-3xl border border-accent/10">
            <h2 className="text-lg font-black text-accent uppercase tracking-[0.2em] italic mb-4">2. Cookies and Third-Party Advertising</h2>
            <p>VexoKart utilizes standard industry tracking mechanisms, including cookies and web beacons, to enhance platform performance. We also partner with third-party service providers like **Google AdSense** to serve relevant promotional content.</p>
            <div className="mt-4 space-y-3 text-base">
                <p>● <strong>Google AdSense:</strong> Google, as a third-party vendor, uses cookies to serve ads on VexoKart based on your visit to this site and other sites on the Internet.</p>
                <p>● <strong>DART Cookie:</strong> Google's use of the DART cookie enables it to serve ads to our users based on their browsing behavior across the digital ecosystem.</p>
                <p>● <strong>Opt-Out:</strong> Users may opt out of the use of the DART cookie by visiting the Google ad and content network privacy policy at the following URL: <a href="https://policies.google.com/technologies/ads" className="text-accent font-bold underline">https://policies.google.com/technologies/ads</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-black text-text-main uppercase tracking-[0.2em] italic mb-4">3. Data Usage and Settlement</h2>
            <p>Your information is processed exclusively to facilitate order fulfillment, vendor settlement, and security monitoring. We do not sell your personal identifiers to unauthorized data brokers. External processing is limited to verified logistics partners (like Delhivery or BlueDart) and PCI-DSS compliant payment gateways (like Razorpay) to ensure the integrity of your transactions.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-text-main uppercase tracking-[0.2em] italic mb-4">4. User Sovereignty and Rights</h2>
            <p>Consistent with global data protection standards, users of VexoKart have the following rights regarding their digital footprint:</p>
            <ul className="list-disc pl-6 space-y-2 text-base">
                <li><strong>The Right to Access:</strong> You can request a copy of all data points stored in our persistent database.</li>
                <li><strong>The Right to Erasure:</strong> You may request the termination of your account and the permanent deletion of associated manifests.</li>
                <li><strong>The Right to Correction:</strong> You can update your shipping manifests and profile identifiers at any time via the User Console.</li>
            </ul>
          </section>

          <section className="pt-8 border-t border-border">
            <p className="text-sm font-bold text-text-main uppercase tracking-widest">Support & Inquiries</p>
            <p className="mt-2 leading-relaxed">If you have questions regarding this Privacy Protocol or wish to exercise your data rights, contact our Data Protection Officer at:</p>
            <p className="text-accent font-black mt-2 text-xl italic">bictcomputereducation1@gmail.com</p>
          </section>

          <p className="text-[10px] text-text-muted italic pt-8 border-t border-border uppercase tracking-widest">Document Version: 2.4 • Last Synchronized: October 2024 • VexoKart Compliance Node</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;