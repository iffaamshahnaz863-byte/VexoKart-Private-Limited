import React from 'react';
import Header from '../components/Header';

const AboutUsPage: React.FC = () => {
  return (
    <div className="bg-surface min-h-screen">
      <Header title="About Us" />
      <div className="max-w-4xl mx-auto p-6 md:p-12 bg-white shadow-premium border border-border mt-6 rounded-3xl mb-12">
        <div className="text-center mb-12">
           <div className="w-24 h-24 bg-accent rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-accent/30 transform -rotate-3">
              <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 17C7.89543 17 7 17.8954 7 19C7 20.1046 7.89543 21 9 21C10.1046 21 11 20.1046 11 19C11 17.8954 10.1046 17 9 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
           </div>
           <h1 className="text-4xl font-black text-text-main italic uppercase tracking-tighter">The <span className="text-accent">VexoKart</span> Story</h1>
           <p className="text-text-muted text-xs font-black uppercase tracking-[0.3em] mt-2">Empowering Digital Commerce Since 2023</p>
        </div>

        <div className="prose prose-sm text-text-secondary space-y-12 leading-relaxed text-lg">
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-text-main border-b-2 border-accent pb-2 inline-block mb-6 italic">Our Origin & Vision</h2>
            <p>VexoKart was founded on a simple realization: the Indian digital marketplace was becoming fragmented. Customers were forced to choose between speed and reliability. Our mission was to eliminate this compromise. By building a high-tech marketplace that empowers authorized local vendors with global-standard logistics tools, we've created an ecosystem where "Smart Shopping" is the default experience.</p>
            <p className="mt-4">We envision a future where every small and medium enterprise (SME) in India has the capability to compete at a national level through our platform, providing consumers with unique, high-quality lifestyle products that aren't available in massive, impersonal retail chains.</p>
          </section>

          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-text-main border-b-2 border-accent pb-2 inline-block mb-6 italic">The VexoShield Integrity</h2>
            <p>In a world of digital anonymity, authenticity is our highest priority. The VexoKart Marketplace isn't open to everyone. We operate as an "Authorized-Only" platform. This means every product listed—from high-end electronics to artisanal lifestyle goods—is checked for supply chain legitimacy. Our "Verified Partner" badge isn't just a UI element; it's a promise that the item you receive is 100% genuine and sourced directly from official distribution channels.</p>
          </section>

          <section className="bg-surface p-10 rounded-[2.5rem] border border-gray-100 shadow-inner">
            <h2 className="text-sm font-black uppercase tracking-widest text-text-main mb-6 italic text-center">Our Core Pillars</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shrink-0 font-bold">01</div>
                    <div>
                        <p className="font-black text-xs uppercase text-gray-900 mb-1">Hyper-Local Logistics</p>
                        <p className="text-sm">We use intelligent routing to fulfill orders from the nearest available inventory node.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shrink-0 font-bold">02</div>
                    <div>
                        <p className="font-black text-xs uppercase text-gray-900 mb-1">Frictionless Payments</p>
                        <p className="text-sm">Our 1-tap UPI and secure COD options make transactions effortless and safe.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shrink-0 font-bold">03</div>
                    <div>
                        <p className="font-black text-xs uppercase text-gray-900 mb-1">Vendor Empowerment</p>
                        <p className="text-sm">We provide merchants with the data insights they need to scale their business sustainably.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shrink-0 font-bold">04</div>
                    <div>
                        <p className="font-black text-xs uppercase text-gray-900 mb-1">Sustainability</p>
                        <p className="text-sm">Optimized routes mean fewer miles traveled and a lower carbon footprint for every box.</p>
                    </div>
                </div>
            </div>
          </section>

          <section className="text-center py-10">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-gray-900">Experience Excellence</h3>
            <p className="max-w-2xl mx-auto">VexoKart is more than a platform; it's a commitment to the Indian consumer. We invite you to join our growing community of smart shoppers and discover the difference that authenticity makes.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;