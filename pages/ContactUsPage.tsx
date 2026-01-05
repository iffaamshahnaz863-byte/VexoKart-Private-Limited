
import React, { useState } from 'react';
import Header from '../components/Header';
import GlassmorphicCard from '../components/GlassmorphicCard';

const ContactUsPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const inputClasses = "w-full mt-2 bg-surface text-text-main border border-border focus:border-accent focus:ring-4 focus:ring-accent/5 rounded-2xl p-4 transition-all outline-none font-medium";

  return (
    <div className="bg-surface min-h-screen">
      <Header title="Contact Support" />
      <div className="max-w-4xl mx-auto p-4 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-black text-text-main italic uppercase tracking-tight leading-none">Get in<br/><span className="text-accent">Touch</span></h1>
              <p className="text-text-secondary mt-4 font-medium leading-relaxed">Our support team is available to assist you with order status, vendor inquiries, or technical support.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-border shadow-sm">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Email Support</p>
                  <p className="text-sm font-bold text-text-main">bictcomputereducation1@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-border shadow-sm">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">HQ Location</p>
                  <p className="text-sm font-bold text-text-main">BICT Computer Education, India</p>
                </div>
              </div>
            </div>
          </div>

          <GlassmorphicCard className="p-8 bg-white">
            {submitted ? (
              <div className="text-center py-20 animate-in fade-in zoom-in">
                <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-black italic uppercase text-text-main">Message Received</h3>
                <p className="text-text-muted text-xs font-bold uppercase mt-2 tracking-widest">We will respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-text-muted ml-2 tracking-widest">Your Identity</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Full Name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={inputClasses} 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-text-muted ml-2 tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="example@email.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={inputClasses} 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-text-muted ml-2 tracking-widest">Inquiry Message</label>
                  <textarea 
                    required 
                    rows={4} 
                    placeholder="How can we help you today?" 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className={`${inputClasses} resize-none`}
                  />
                </div>
                <button type="submit" className="w-full bg-accent text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-xl shadow-accent/20 active:scale-95 transition-all">
                  Dispatch Message
                </button>
              </form>
            )}
          </GlassmorphicCard>

        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
