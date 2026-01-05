
import React from 'react';
import Header from '../components/Header';

const AboutUsPage: React.FC = () => {
  return (
    <div className="bg-surface min-h-screen">
      <Header title="About Us" />
      <div className="max-w-3xl mx-auto p-6 md:p-10 bg-white shadow-sm border border-border mt-6 rounded-3xl mb-12">
        <div className="text-center mb-10">
           <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 17C7.89543 17 7 17.8954 7 19C7 20.1046 7.89543 21 9 21C10.1046 21 11 20.1046 11 19C11 17.8954 10.1046 17 9 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
           </div>
           <h1 className="text-3xl font-black text-text-main italic uppercase tracking-tight">Vexo<span className="text-accent">Kart</span></h1>
           <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">Shop Online • Shop Smart</p>
        </div>

        <div className="prose prose-sm text-text-secondary space-y-8">
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-text-main border-b-2 border-accent pb-2 inline-block mb-4 italic">Our Mission</h2>
            <p className="text-base leading-relaxed">VexoKart is a modern, authorized multi-vendor e-commerce marketplace dedicated to providing a premium shopping experience. Our mission is to bridge the gap between quality manufacturers and discerning customers through a secure, transparent, and high-performance digital platform.</p>
          </section>

          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-text-main border-b-2 border-accent pb-2 inline-block mb-4 italic">Authenticity Guaranteed</h2>
            <p className="text-base leading-relaxed">We pride ourselves on the integrity of our listings. Every product hosted on VexoKart undergoes a rigorous verification process to ensure authenticity. We partner exclusively with certified vendors and authorized distributors to provide you with genuine products and reliable service.</p>
          </section>

          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-text-main border-b-2 border-accent pb-2 inline-block mb-4 italic">Why Choose Us?</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                <li className="bg-surface p-4 rounded-2xl border border-border flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 font-bold">✓</div>
                    <span className="font-bold text-xs uppercase italic">Verified Marketplace</span>
                </li>
                <li className="bg-surface p-4 rounded-2xl border border-border flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 font-bold">✓</div>
                    <span className="font-bold text-xs uppercase italic">Secure Transactions</span>
                </li>
                <li className="bg-surface p-4 rounded-2xl border border-border flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 font-bold">✓</div>
                    <span className="font-bold text-xs uppercase italic">Direct to Consumer</span>
                </li>
                <li className="bg-surface p-4 rounded-2xl border border-border flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 font-bold">✓</div>
                    <span className="font-bold text-xs uppercase italic">Premium Logistics</span>
                </li>
            </ul>
          </section>

          <div className="bg-text-main text-white p-8 rounded-3xl mt-12 text-center">
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2">Join the VexoKart Ecosystem</h3>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Experience the future of lifestyle commerce.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
