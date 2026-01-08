import React, { useEffect } from 'react';
/* Fix: Import Link from react-router-dom */
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
           <h1 className="text-5xl font-black text-text-main italic uppercase tracking-tighter">The <span className="text-accent">VexoKart</span> Story</h1>
           <p className="text-text-muted text-xs font-black uppercase tracking-[0.4em] mt-3">Empowering Digital India Since 2023</p>
        </header>

        <div className="prose prose-sm text-text-secondary space-y-12 leading-relaxed text-base">
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-main border-b-2 border-accent pb-2 inline-block italic">Our Genesis & Mission</h2>
            <p className="text-lg font-medium text-gray-800 leading-relaxed italic">VexoKart was founded with a singular objective: to eliminate the friction between authorized quality and high-speed delivery in the Indian digital marketplace.</p>
            <p>Our mission is to democratize access to premium lifestyle products by providing a hyper-efficient, multi-vendor infrastructure. We empower local small-to-medium enterprises (SMEs) to bypass traditional retail barriers and reach millions of consumers directly. By removing intermediaries and optimizing the logistics chain, we deliver better value to both our vendors and our end-users.</p>
          </section>

          <section className="bg-surface p-10 rounded-[2.5rem] border border-gray-100 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-2">
                <p className="text-accent font-black text-xl italic">01. Integrity</p>
                <p className="text-sm">Every vendor node on VexoKart undergoes a rigorous audit for authenticity and reliability.</p>
            </div>
            <div className="space-y-2">
                <p className="text-accent font-black text-xl italic">02. Speed</p>
                <p className="text-sm">We utilize hyper-local fulfillment centers to ensure 48-hour delivery averages in metro cities.</p>
            </div>
            <div className="space-y-2">
                <p className="text-accent font-black text-xl italic">03. Support</p>
                <p className="text-sm">Our human-first support protocol ensures that every query is resolved within 24 operational hours.</p>
            </div>
            <div className="space-y-2">
                <p className="text-accent font-black text-xl italic">04. Growth</p>
                <p className="text-sm">We provide our partners with data-driven insights to help them scale their businesses sustainably.</p>
            </div>
          </section>

          <section className="text-center pt-8">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-gray-900">Join the Smart Revolution</h3>
            <p className="max-w-2xl mx-auto">VexoKart is more than just a store; it’s a community of smart shoppers and elite vendors. Experience the difference that authenticity and speed make in your digital life.</p>
            <div className="mt-8 flex justify-center gap-4">
                <Link to="/products" className="bg-accent text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-accent/20">Explore Catalog</Link>
                <Link to="/contact-us" className="bg-white text-gray-800 border border-gray-200 px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm">Get in Touch</Link>
            </div>
          </section>
        </div>
      </article>
      <Footer />
    </div>
  );
};

export default AboutUsPage;