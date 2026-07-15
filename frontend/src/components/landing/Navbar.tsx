import React, { useState, useEffect } from 'react';
import { Menu, X, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'AI Power', href: '#ai-capabilities' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Roles', href: '#roles' },
    { name: 'Pricing', href: '#pricing' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-[#5B21B6] text-[#FBBF24] p-2 rounded-lg">
              <Rocket size={24} />
            </div>
            <span className="font-bold text-xl text-[#1F2937] tracking-tight">
              AI Startup Builder
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[#6B7280] hover:text-[#5B21B6] font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={() => navigate('/login')} className="text-[#1F2937] font-medium hover:text-[#5B21B6] transition-colors">
              Log in
            </button>
            <button onClick={() => navigate('/signup')} className="bg-[#5B21B6] hover:bg-[#7C3AED] text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg">
              Sign up
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#1F2937] hover:text-[#5B21B6]"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass absolute top-full left-0 w-full border-t border-gray-200">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-3 py-3 text-base font-medium text-[#1F2937] hover:bg-[#F3F4F6] hover:text-[#5B21B6] rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col space-y-3">
              <button onClick={() => navigate('/login')} className="w-full text-center px-4 py-2 border border-[#E5E7EB] rounded-lg text-[#1F2937] font-medium">
                Log in
              </button>
              <button onClick={() => navigate('/signup')} className="w-full text-center px-4 py-2 bg-[#5B21B6] text-white rounded-lg font-medium">
                Sign up
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
