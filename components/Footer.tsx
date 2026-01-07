
import React from 'react';
import { Facebook, Instagram, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-black pt-16 pb-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="col-span-1">
             <div className="text-4xl font-black tracking-tighter mb-6 uppercase">Moca</div>
             <p className="text-sm text-gray-600 leading-relaxed max-w-xs mb-8">
               Museum of Contemporary Art Gandhinagar.
               <br/>Veer Residency, Gandhinagar Mahudi Highway.
             </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest">Services</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link to="/shop" className="hover:text-black">MOCA Shop</Link></li>
              <li><Link to="/booking" className="hover:text-black">Book Tickets</Link></li>
              <li><Link to="/order-status" className="hover:text-black">Track Order</Link></li>
            </ul>
          </div>

          <div>
             <h4 className="font-bold mb-4 uppercase text-xs tracking-widest">Follow Us</h4>
             <div className="flex space-x-4">
                <a href="https://www.instagram.com/mocagandhinagar" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href="https://www.facebook.com/share/1ZP14kakpn/" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
             </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 group">
          <div className="flex items-center gap-4">
            <span>© 2024 Museum of Contemporary Art Gandhinagar.</span>
            <Link 
              to="/admin" 
              className="opacity-0 group-hover:opacity-20 transition-opacity flex items-center gap-1 cursor-default"
              title="Staff Portal"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Staff</span>
            </Link>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
             <p>mocagandhinagar@gmail.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
