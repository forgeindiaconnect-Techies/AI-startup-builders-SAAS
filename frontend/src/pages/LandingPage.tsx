import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import AICapabilities from '../components/landing/AICapabilities';
import HowItWorks from '../components/landing/HowItWorks';
import Roles from '../components/landing/Roles';
import Pricing from '../components/landing/Pricing';
import Testimonials from '../components/landing/Testimonials';
import Stats from '../components/landing/Stats';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';

const LandingPage: React.FC = () => {
  useScrollReveal();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <AICapabilities />
        <HowItWorks />
        <Roles />
        <Testimonials />
        <Pricing />
        <Stats />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
