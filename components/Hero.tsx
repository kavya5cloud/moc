
import React, { useEffect, useState } from 'react';
import { ArrowDown, ShoppingBag, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContent = () => {
    const nextSection = document.getElementById('main-content');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({
        top: window.innerHeight - 80, 
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative w-full h-[calc(100vh-80px)] bg-white flex flex-col justify-center overflow-hidden">
      <style>
        {`
          @keyframes subtle-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(6px); }
          }
          .animate-subtle-bounce {
            animation: subtle-bounce 2s ease-in-out infinite;
          }
        `}
      </style>

      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col items-start leading-[0.85] select-none py-10 relative z-10">
        
        <div className={`transition-all duration-1000 ease-out delay-0 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}>
            <div style={{ transform: `translateY(${scrollY * 0.15}px)` }} className="will-change-transform">
                <h1 className="text-[17vw] font-semibold tracking-tighter text-black m-0 z-10 transition-all duration-700 ease-out hover:tracking-wide cursor-default">
                MOCA
                </h1>
            </div>
        </div>

        <div className={`transition-all duration-1000 ease-out delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}>
             <div style={{ transform: `translateY(${scrollY * 0.08}px)` }} className="will-change-transform">
                <h1 className="text-[17vw] font-semibold tracking-tighter text-gray-300 m-0 z-0 transition-all duration-700 ease-out hover:tracking-wide cursor-default">
                GANDHI
                </h1>
            </div>
        </div>

        <div className={`transition-all duration-1000 ease-out delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}>
             <div style={{ transform: `translateY(${scrollY * 0.2}px)` }} className="will-change-transform">
                <h1 className="text-[17vw] font-semibold tracking-tighter text-black m-0 z-10 transition-all duration-700 ease-out hover:tracking-wide cursor-default">
                NAGAR
                </h1>
            </div>
        </div>

        {/* Dynamic CTA Section for Shop & Tickets */}
        <div className={`mt-12 flex flex-wrap gap-4 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
           <Link to="/booking" className="bg-black text-white px-8 py-4 text-sm font-bold flex items-center gap-3 hover:bg-gray-800 transition-all active:scale-95 shadow-xl">
             <Ticket className="w-5 h-4" />
             GET TICKETS
           </Link>
           <Link to="/shop" className="bg-white border-2 border-black text-black px-8 py-4 text-sm font-bold flex items-center gap-3 hover:bg-gray-50 transition-all active:scale-95">
             <ShoppingBag className="w-5 h-4" />
             VISIT SHOP
           </Link>
        </div>
      </div>
      
      {/* Adjusted Scroll Indicator - Moved from bottom-10 to bottom-6 and added bounce */}
      <button 
        onClick={scrollToContent}
        className={`absolute bottom-6 left-6 md:left-12 lg:left-16 flex items-center gap-3 group cursor-pointer transition-all duration-1000 delay-700 z-20 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        aria-label="Scroll down to view museum gallery"
      >
         <div className="w-8 h-8 rounded-full border border-black/20 flex items-center justify-center group-hover:border-black transition-colors animate-subtle-bounce">
            <ArrowDown className="w-4 h-4 text-black" strokeWidth={1} />
         </div>
         <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 group-hover:text-black transition-colors">
           SCROLL
         </span>
      </button>
    </section>
  );
};

export default Hero;
