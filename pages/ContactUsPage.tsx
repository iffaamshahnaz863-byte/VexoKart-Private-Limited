import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import GlassmorphicCard from '../components/GlassmorphicCard';
import Footer from '../components/Footer';

const ContactUsPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      <div className="max-w-5xl mx-auto p-4 md:p-10 mt-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-black text-text-main italic uppercase tracking-tight leading-none">Customer<br/><span className="text-accent">Support</span></h1>
              <p className="text-text-secondary mt-4 font-medium leading-relaxed">
                Vexo Kart Private Limited is dedicated to providing exemplary service. Our support team operates from our headquarters in India to assist you with order tracking, returns, and general inquiries.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-white p-6 rounded-3xl border border-border shadow-sm">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Official Support Email</p>
                  <p className="text-sm font-bold text-text-main">support@vexokart.com</p>
                  <p className="text-xs text-text-secondary mt-1">Secondary: bictcomputereducation1@gmail.com</p>
                  <p className="text-[10px] text-accent font-bold mt-2 uppercase tracking-wide">Response Time: Within 24 Business Hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-6 rounded-3xl border border-border shadow-sm">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shrink-0">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Operating Hours</p>
                  <p className="text-sm font-bold text-text-main">Monday - Saturday</p>
                  <p className="text-sm font-medium text-text-secondary">10:00 AM - 7:00 PM (IST)</p>
                  <p className="text-[10px] text-text-muted mt-2 italic">Closed on National Holidays</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-6 rounded-3xl border border-border shadow-sm">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shrink-0">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Registered Office</p>
                  <p className="text-sm font-bold text-text-main">Vexo Kart Private Limited</p>
                  <p className="text-xs text-text-secondary mt-1">
                    BICT Computer Education Premises,<br/>
                    Sector 4, Urban Estate,<br/>
                    India - 122001
                  </p>
                </div>
              </div>
            </div>
          </div>

          <GlassmorphicCard className="p-8 bg-white h-fit">
            {submitted ? (
              <div className="text-center py-20 animate-in fade-in zoom-in">
                <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-black italic uppercase text-text-main">Ticket Created</h3>
                <p className="text-text-muted text-xs font-bold uppercase mt-2 tracking-widest">Reference ID: VX-{Math.floor(Math.random()*10000)}</p>
                <p className="text-text-secondary text-sm mt-4">We have received your message. A support representative will contact you via email shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border-b border-border pb-4 mb-4">
                    <h3 className="text-lg font-bold text-text-main">Send us a Message</h3>
                    <p className="text-xs text-text-muted">For faster resolution, please include your Order ID if applicable.</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-text-muted ml-2 tracking-widest">Your Name</label>
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
                  <label className="text-[10px] font-black uppercase text-text-muted ml-2 tracking-widest">How can we help?</label>
                  <textarea 
                    required 
                    rows={5} 
                    placeholder="Please describe your issue or inquiry..." 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className={`${inputClasses} resize-none`}
                  />
                </div>
                <button type="submit" className="w-full bg-accent text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-xl shadow-accent/20 active:scale-95 transition-all hover:bg-orange-600">
                  Submit Inquiry
                </button>
              </form>
            )}
          </GlassmorphicCard>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactUsPage;