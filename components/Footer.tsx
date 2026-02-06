
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-border py-16 px-6 mt-12 pb-24 lg:pb-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transform -rotate-6">
               <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 17.5l-8.5-10h12l-8.5 10zM5.5 17.5h13"/>
               </svg>
            </div>
            <h2 className="text-2xl font-black italic text-text-main tracking-tighter uppercase">DAR CYCLE<span className="text-primary">HUB</span></h2>
          </div>
          <p className="text-sm text-text-secondary font-medium leading-relaxed max-w-xs uppercase tracking-tighter italic">Kashmir's premier destination for high-quality cycles and accessories.</p>
          <div className="flex gap-4">
             <div className="w-8 h-8 bg-white border border-border rounded-lg flex items-center justify-center text-gray-400 hover:text-primary cursor-pointer transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
             </div>
             <div className="w-8 h-8 bg-white border border-border rounded-lg flex items-center justify-center text-gray-400 hover:text-primary cursor-pointer transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-main italic border-b border-border pb-2">Company</h3>
          <ul className="space-y-3">
            <li><Link to="/about-us" className="text-xs font-bold text-text-secondary hover:text-primary uppercase tracking-tighter transition-colors">About Us</Link></li>
            <li><Link to="/contact-us" className="text-xs font-bold text-text-secondary hover:text-primary uppercase tracking-tighter transition-colors">Contact</Link></li>
            <li><Link to="/privacy-policy" className="text-xs font-bold text-text-secondary hover:text-primary uppercase tracking-tighter transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-main italic border-b border-border pb-2">Support</h3>
          <ul className="space-y-3">
            <li><Link to="/help" className="text-xs font-bold text-text-secondary hover:text-primary uppercase tracking-tighter transition-colors">Help Center (FAQ)</Link></li>
            <li><Link to="/orders" className="text-xs font-bold text-text-secondary hover:text-primary uppercase tracking-tighter transition-colors">Track Order</Link></li>
            <li><Link to="/blog/safe-shopping" className="text-xs font-bold text-text-secondary hover:text-primary uppercase tracking-tighter transition-colors">Safe Shopping</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-main italic border-b border-border pb-2">Legal</h3>
           <p className="text-xs text-text-muted font-medium tracking-tight leading-relaxed italic">This site uses cookies for analytics and personalized content. By using this site, you agree to our Privacy Policy.</p>
           <p className="text-xs text-text-muted font-bold tracking-widest mt-4">© 2024 DAR CYCLE HUB. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
