
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
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 -mr-20 -mt-20 rounded-full blur-3xl"></div>
        
        <header className="text-center mb-16 relative z-10">
           <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/30 transform -rotate-6">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 17.5l-8.5-10h12l-8.5 10zM5.5 17.5h13"/>
              </svg>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-text-main italic uppercase tracking-tighter">About <span className="text-primary">VEXOKART</span></h1>
           <p className="text-text-muted text-xs font-black uppercase tracking-[0.4em] mt-3">Your Premier Destination for High-Quality Products</p>
        </header>

        <div className="prose prose-sm text-text-secondary space-y-12 leading-relaxed text-base">
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-main border-b-2 border-primary pb-2 inline-block italic">Our Mission</h2>
            <p className="text-lg font-medium text-gray-800 leading-relaxed italic">
              VEXOKART is a premier destination for quality-conscious shoppers, committed to bridging the gap between high-quality manufacturers and our passionate community.
            </p>
            <p>
              Founded with a vision to organize and elevate the retail market, we operate as a curated platform. We don't just sell products; we build experiences. By partnering directly with verified brands and suppliers, we ensure every product meets strict quality benchmarks while supporting our customers' needs.
            </p>
          </section>

          <section className="bg-surface p-10 rounded-[2.5rem] border border-gray-100 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-2">
                <p className="text-primary font-black text-xl italic">Authenticity First</p>
                <p className="text-sm">We operate a zero-tolerance policy towards counterfeits. Every brand on the VEXOKART platform is an authorized partner, ensuring genuine products and warranties.</p>
            </div>
            <div className="space-y-2">
                <p className="text-primary font-black text-xl italic">Expert Service</p>
                <p className="text-sm">Our team consists of passionate experts. We provide expert advice, professional support, and after-sales care to ensure your satisfaction is always perfect.</p>
            </div>
            <div className="space-y-2">
                <p className="text-primary font-black text-xl italic">Community Focused</p>
                <p className="text-sm">Your trust is our asset. We offer transparent pricing, GST-compliant invoicing, and a dedicated support system for all our customers.</p>
            </div>
            <div className="space-y-2">
                <p className="text-primary font-black text-xl italic">Sustainable Passion</p>
                <p className="text-sm">We are building for the long term. Our business model prioritizes sustainable growth and fostering a healthy community of satisfied customers.</p>
            </div>
          </section>

          <section className="text-center pt-8">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-gray-900">Experience the Standard</h3>
            <p className="max-w-2xl mx-auto">
              Whether you are a professional or a casual shopper, VEXOKART guarantees a product and service rooted in integrity. We are more than a store; we are the hub of your shopping journey.
            </p>
            <div className="mt-8 flex justify-center gap-4">
                <Link to="/products" className="bg-primary text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">View Catalog</Link>
                <Link to="/contact-us" className="bg-white text-gray-800 border border-gray-200 px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm">Contact Us</Link>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
};

export default AboutUsPage;
