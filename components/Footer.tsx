
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-border py-12 px-6 mt-12 pb-24 lg:pb-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
               <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 17C7.89543 17 7 17.8954 7 19C7 20.1046 7.89543 21 9 21C10.1046 21 11 20.1046 11 19C11 17.8954 10.1046 17 9 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
            </div>
            <h2 className="text-lg font-black italic text-text-main">Vexo<span className="text-accent">Kart</span></h2>
          </div>
          <p className="text-xs text-text-muted font-medium leading-relaxed max-w-xs uppercase tracking-tighter">Authorized multi-vendor marketplace specializing in verified lifestyle products.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-text-main italic border-b border-border pb-1">Platform</h3>
             <ul className="space-y-2">
                <li><Link to="/about-us" className="text-xs font-bold text-text-secondary hover:text-accent uppercase tracking-tighter">About Us</Link></li>
                <li><Link to="/contact-us" className="text-xs font-bold text-text-secondary hover:text-accent uppercase tracking-tighter">Contact Support</Link></li>
                <li><Link to="/products" className="text-xs font-bold text-text-secondary hover:text-accent uppercase tracking-tighter">Our Catalog</Link></li>
             </ul>
          </div>
          <div className="space-y-3">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-text-main italic border-b border-border pb-1">Legal</h3>
             <ul className="space-y-2">
                <li><Link to="/privacy-policy" className="text-xs font-bold text-text-secondary hover:text-accent uppercase tracking-tighter">Privacy Policy</Link></li>
                <li><a href="#" className="text-xs font-bold text-text-secondary hover:text-accent uppercase tracking-tighter">Terms of Service</a></li>
             </ul>
          </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-text-main italic border-b border-border pb-1">Secure Payments</h3>
           <div className="flex gap-2">
              <div className="bg-white px-3 py-1.5 border border-border rounded-lg text-[8px] font-black text-text-main shadow-sm uppercase italic">Razorpay</div>
              <div className="bg-white px-3 py-1.5 border border-border rounded-lg text-[8px] font-black text-text-main shadow-sm uppercase italic">UPI / Cards</div>
              <div className="bg-white px-3 py-1.5 border border-border rounded-lg text-[8px] font-black text-text-main shadow-sm uppercase italic">COD</div>
           </div>
           <p className="text-[9px] text-text-muted font-bold tracking-tight mt-6">© 2024 VexoKart authorized marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
