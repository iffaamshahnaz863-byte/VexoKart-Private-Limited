
import React from 'react';
import Header from '../../components/Header';

const ProductQualityPage: React.FC = () => {
    return (
        <div className="bg-surface min-h-screen">
            <Header title="Quality Control" />
            <article className="max-w-4xl mx-auto p-6 md:p-12 bg-white mt-10 rounded-[3rem] shadow-premium mb-20">
                <header className="mb-10">
                    <span className="bg-green-100 text-green-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">Operational Excellence</span>
                    <h1 className="text-4xl font-black text-gray-900 italic uppercase tracking-tight mt-4 leading-none">How DAR CYCLE HUB Ensures<br/><span className="text-accent">Authentic Quality</span></h1>
                    <p className="text-gray-400 font-bold text-sm mt-4 uppercase tracking-widest">Published: October 2024 • 6 Min Read</p>
                </header>

                <div className="prose prose-lg text-gray-600 leading-relaxed space-y-8">
                    <p className="text-xl font-medium text-gray-800">Quality isn't accidental—it's a product of rigorous systems. At DAR CYCLE HUB, we've pioneered the **DCHShield Manifest**, a multi-tier verification process designed to filter out sub-standard inventory.</p>
                    
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase italic mb-4">Tier 1: Vendor Sourcing Audit</h2>
                        <p>We don't accept everyone. Vendors wishing to join the DAR CYCLE HUB ecosystem must provide verifiable proof of authorization from brands or manufacturers. This initial gate ensures that the products enter our digital ecosystem through legitimate, legal channels.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase italic mb-4">Tier 2: Physical Inspection Samples</h2>
                        <p>Our quality assurance team performs regular spot checks at vendor warehouses. We evaluate packaging integrity, batch numbers, and manufacturing dates to ensure they align with the digital descriptions provided on our platform.</p>
                    </section>

                    <section className="grid grid-cols-2 gap-4 my-10">
                        <div className="bg-surface p-6 rounded-2xl border border-gray-100">
                            <p className="font-black text-accent text-3xl mb-2">99.2%</p>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Authenticity Score</p>
                        </div>
                        <div className="bg-surface p-6 rounded-2xl border border-gray-100">
                            <p className="font-black text-accent text-3xl mb-2">24h</p>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Review Turnaround</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase italic mb-4">Tier 3: The Consumer Feedback Loop</h2>
                        <p>We leverage advanced sentiment analysis on our reviews. If multiple customers report a quality discrepancy, our Intelligent Audit system automatically places the listing on "Temporary Hold" until a manual investigation is completed by our logistics nodes.</p>
                    </section>

                    <footer className="pt-10 border-t border-gray-100 text-center">
                        <p className="text-sm font-bold text-gray-400 italic">"Our mission is to make 'Verified Partner' the gold standard of online retail."</p>
                    </footer>
                </div>
            </article>
        </div>
    );
};

export default ProductQualityPage;
