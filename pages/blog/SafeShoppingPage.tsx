
import React from 'react';
import Header from '../../components/Header';

const SafeShoppingPage: React.FC = () => {
    return (
        <div className="bg-surface min-h-screen">
            <Header title="Shopping Guide" />
            <article className="max-w-4xl mx-auto p-6 md:p-12 bg-white mt-10 rounded-[3rem] shadow-premium mb-20">
                <header className="mb-10">
                    <span className="bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">Consumer Protection</span>
                    <h1 className="text-4xl font-black text-gray-900 italic uppercase tracking-tight mt-4 leading-none">The Definitive Guide to<br/><span className="text-accent">Safe Online Shopping</span></h1>
                    <p className="text-gray-400 font-bold text-sm mt-4 uppercase tracking-widest">Published: October 2024 • 8 Min Read</p>
                </header>

                <div className="prose prose-lg text-gray-600 leading-relaxed space-y-8">
                    <p className="text-xl font-medium text-gray-800">As digital commerce in India expands at an unprecedented rate, staying informed about online safety has never been more critical. This guide provides actionable steps to protect your data and ensure a secure shopping journey.</p>
                    
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase italic mb-4">1. Verify the Digital Certificate (HTTPS)</h2>
                        <p>Before entering any personal information, ensure the website you are visiting is encrypted. Look for the padlock icon in the browser address bar. A secure connection ensures that the data sent between your device and the marketplace server cannot be intercepted by malicious actors.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase italic mb-4">2. Understand Payment Gateway Safety</h2>
                        <p>A trustworthy marketplace like VEXOKART never asks for your PIN or password directly. Always check if the payment interface is hosted by a recognized provider such as Razorpay or CCAvenue. When using UPI, verify the merchant name on your banking app before authorizing the transaction.</p>
                    </section>

                    <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100 italic">
                        "Secure shopping is about vigilance. Always check for the 'Verified Partner' badge and read real customer reviews before committing to a purchase." — VEXOKART Security Team
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase italic mb-4">3. The Role of Multi-Factor Authentication (MFA)</h2>
                        <p>Always enable MFA on your shopping accounts and linked banking apps. Whether it's an OTP (One-Time Password) or biometric verification, an extra layer of security drastically reduces the risk of unauthorized access even if your password is compromised.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase italic mb-4">4. Guard Your Personal Identifiers</h2>
                        <p>Be wary of phishing emails or SMS alerts that claim you've won a prize from a marketplace. Authentic brands will communicate through their official app or verified domain. Never share your Aadhaar number or other sensitive documents unless through a secure, official KYC process.</p>
                    </section>

                    <footer className="pt-10 border-t border-gray-100 text-center">
                        <p className="text-sm font-bold text-gray-400">VEXOKART is committed to your safety. Browse our <a href="/privacy-policy" className="text-accent underline">Privacy Protocol</a> for more information.</p>
                    </footer>
                </div>
            </article>
        </div>
    );
};

export default SafeShoppingPage;
