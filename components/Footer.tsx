import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-border py-16 px-6 mt-12 pb-24 lg:pb-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 transform -rotate-6">
               <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 17C7.89543 17 7 17.8954 7 19C7 20.1046 7.89543 21 9 21C10.1046 21 11 20.1046 11 19C11 17.8954 10.1046 17 9 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
            </div>
            <h2 className="text-2xl font-black italic text-text-main tracking-tighter uppercase">Vexo<span className="text-accent">Kart</span></h2>
          </div>
          <p className="text-sm text-text-secondary font-medium leading-relaxed max-w-xs uppercase tracking-tighter italic">Vexo Kart Private Limited: India's authorized multi-vendor marketplace dedicated to premium quality and secure fulfillment.</p>
          <div className="flex gap-4">
             <div className="w-8 h-8 bg-white border border-border rounded-lg flex items-center justify-center text-gray-400 hover:text-accent cursor-pointer transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
             </div>
             <div className="w-8 h-8 bg-white border border-border rounded-lg flex items-center justify-center text-gray-400 hover:text-accent cursor-pointer transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
             </div>
          </div>
        </div>

        {/* Company Column */}
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-main italic border-b border-border pb-2">Transparency Hub</h3>
          <ul className="space-y-3">
            <li><Link to="/about-us" className="text-xs font-bold text-text-secondary hover:text-accent uppercase tracking-tighter transition-colors">Our Story</Link></li>
            <li><Link to="/contact-us" className="text-xs font-bold text-text-secondary hover:text-accent uppercase tracking-tighter transition-colors">Contact Support</Link></li>
            <li><Link to="/help" className="text-xs font-bold text-text-secondary hover:text-accent uppercase tracking-tighter transition-colors">Help Center (FAQ)</Link></li>
            <li><Link to="/privacy-policy" className="text-xs font-bold text-text-secondary hover:text-accent uppercase tracking-tighter transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Informational Column */}
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-main italic border-b border-border pb-2">Intelligence</h3>
          <ul className="space-y-3">
            <li><Link to="/blog/safe-shopping" className="text-xs font-bold text-text-secondary hover:text-accent uppercase tracking-tighter transition-colors">Safe Shopping Guide</Link></li>
            <li><Link to="/blog/quality-guide" className="text-xs font-bold text-text-secondary hover:text-accent uppercase tracking-tighter transition-colors">Authenticity Check</Link></li>
            <li><Link to="/blog/ecommerce-india" className="text-xs font-bold text-text-secondary hover:text-accent uppercase tracking-tighter transition-colors">Digital India Insights</Link></li>
            <li><Link to="/products" className="text-xs font-bold text-text-secondary hover:text-accent uppercase tracking-tighter transition-colors">Market Catalog</Link></li>
          </ul>
        </div>

        {/* Compliance Column */}
        <div className="space-y-6">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-main italic border-b border-border pb-2">Verified Trust</h3>
           <div className="flex flex-wrap gap-2 mb-4">
              <div className="bg-white px-3 py-1.5 border border-border rounded-lg text-[8px] font-black text-text-main shadow-sm uppercase italic">Registered Entity</div>
              <div className="bg-white px-3 py-1.5 border border-border rounded-lg text-[8px] font-black text-text-main shadow-sm uppercase italic">SSL Secured</div>
              <div className="bg-white px-3 py-1.5 border border-border rounded-lg text-[8px] font-black text-text-main shadow-sm uppercase italic">AdSense Partner</div>
           </div>
           <p className="text-[10px] text-text-muted font-bold tracking-tight leading-relaxed italic">This site uses cookies for analytics and personalized content (Google AdSense). By using this site, you agree to our Privacy Policy.</p>
           <p className="text-[9px] text-text-muted font-black tracking-widest mt-4">© 2024 Vexo Kart Private Limited. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;