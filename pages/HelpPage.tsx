import React, { useEffect } from 'react';
import Header from '../components/Header';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { Link } from 'react-router-dom';

const HelpPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      question: "How do I track my order?",
      answer: "Once your order is shipped, you will receive an SMS and Email with a tracking link. You can also view the status in the 'My Orders' section of your profile."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 7-day return policy for eligible items. Products must be unused and in original packaging. Please visit the 'My Orders' page to initiate a return request."
    },
    {
      question: "How long does delivery take?",
      answer: "Standard delivery takes 3-7 business days depending on your location. Metro cities usually receive orders within 2-4 days."
    },
    {
      question: "Is it safe to use my credit/debit card?",
      answer: "Yes, absolutely. All payments are processed through secure, PCI-DSS compliant payment gateways. Vexo Kart does not store your card details."
    },
    {
      question: "Can I cancel my order?",
      answer: "You can cancel your order before it has been packed by the vendor. Once packed or shipped, cancellations are not possible, but you may refuse delivery or request a return."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, Vexo Kart operates exclusively within India. We ship to over 26,000 pincodes across the country."
    }
  ];

  return (
    <div className="bg-surface min-h-screen">
      <Header title="Help Center" />
      
      <div className="max-w-4xl mx-auto p-4 md:p-10 mt-6 mb-20">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-text-main italic uppercase tracking-tight">How can we <span className="text-accent">help?</span></h1>
            <p className="text-text-muted mt-3 font-medium">Find answers to common questions about your shopping experience.</p>
        </div>

        <div className="grid gap-4">
            {faqs.map((faq, index) => (
                <GlassmorphicCard key={index} className="p-6 bg-white border border-gray-100 shadow-sm hover:border-accent/30 transition-all cursor-default">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                </GlassmorphicCard>
            ))}
        </div>

        <div className="mt-12 bg-white rounded-3xl p-8 border border-border text-center shadow-premium">
            <h2 className="text-xl font-black text-text-main uppercase italic tracking-tight mb-4">Still need assistance?</h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">Our support team is available Monday through Saturday to assist you with any unresolved issues.</p>
            <div className="flex justify-center gap-4">
                <Link to="/contact-us" className="bg-accent text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-accent/20 active:scale-95 transition-all">Contact Support</Link>
                <Link to="/orders" className="bg-gray-100 text-gray-800 px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all hover:bg-gray-200">View My Orders</Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;