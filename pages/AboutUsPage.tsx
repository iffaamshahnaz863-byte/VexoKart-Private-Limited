import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const AboutUsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-surface min-h-screen">
      <Header />
      <article className="max-w-4xl mx-auto p-6 md:p-16 bg-white shadow-premium border border-border mt-10 rounded-3xl mb-20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 -mr-20 -mt-20 rounded-full blur-3xl"></div>
        
        <header className="text-center mb-16 relative z-10">
           <div className="w-20 h-20 bg-accent rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-accent/30 transform -rotate-6">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 17C7.89543 17 7 17.8954 7 19C7 20.1046 7.89543 21 9 21C10.1046 21 11 20.1046 11 19C11 17.8954 10.1046 17 9 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-text-main italic uppercase tracking-tighter">About <span className="text-accent">Vexo Kart</span></h1>
           <p className="text-text-muted text-xs font-black uppercase tracking-[0.4em] mt-3">Operated by Vexo Kart Private Limited</p>
        </header>

        <div className="prose prose-sm text-text-secondary space-y-12 leading-relaxed text-base">
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-main border-b-2 border-accent pb-2 inline-block italic">Our Corporate Mission</h2>
            <p className="text-lg font-medium text-gray-800 leading-relaxed italic">
              Vexo Kart Private Limited is a registered Indian e-commerce entity committed to bridging the gap between authentic manufacturers and the modern Indian consumer.
            </p>
            <p>
              Founded with a vision to organize the fragmented retail sector, Vexo Kart operates as a managed marketplace. We do not just list products; we curate experiences. By partnering directly with verified SMEs (Small and Medium Enterprises) across India, we ensure that every product shipped meets strict quality benchmarks while supporting the domestic economy.
            </p>
          </section>

          <section className="bg-surface p-10 rounded-[2.5rem] border border-gray-100 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-2">
                <p className="text-accent font-black text-xl italic">Authenticity First</p>
                <p className="text-sm">We operate a zero-tolerance policy towards counterfeits. Every vendor on the Vexo Kart platform undergoes a rigorous KYC (Know Your Customer) and sourcing audit before going live.</p>
            </div>
            <div className="space-y-2">
                <p className="text-accent font-black text-xl italic">Pan-India Logistics</p>
                <p className="text-sm">Leveraging a network of hyper-local fulfillment centers, we ensure secure and timely delivery to 26,000+ pincodes across the Indian subcontinent.</p>
            </div>
            <div className="space-y-2">
                <p className="text-accent font-black text-xl italic">Consumer Protection</p>
                <p className="text-sm">Your trust is our asset. We offer transparent pricing, GST-compliant invoicing, and a dedicated grievance redressal mechanism for all our users.</p>
            </div>
            <div className="space-y-2">
                <p className="text-accent font-black text-xl italic">Sustainable Growth</p>
                <p className="text-sm">We are building for the long term. Our business model prioritizes sustainable unit economics over short-term discounts, ensuring we remain your reliable partner for years to come.</p>
            </div>
          </section>

          <section className="text-center pt-8">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-gray-900">Experience the Standard</h3>
            <p className="max-w-2xl mx-auto">
              Whether you are shopping for the latest electronics or ethnic fashion, Vexo Kart guarantees a transaction rooted in integrity. We are not just a website; we are a responsible corporate citizen dedicated to Digital Bharat.
            </p>
            <div className="mt-8 flex justify-center gap-4">
                <Link to="/products" className="bg-accent text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-accent/20">View Catalog</Link>
                <Link to="/contact-us" className="bg-white text-gray-800 border border-gray-200 px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm">Corporate Contact</Link>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
};

export default AboutUsPage;