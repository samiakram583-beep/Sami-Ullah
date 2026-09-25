import React from 'react';
import { MapPin, Phone, Clock, Star, ExternalLink, Shield } from 'lucide-react';
import { authService } from '../../services/auth.service';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const slotAvailable = authService.isAdminSlotAvailable();
  return (
    <footer className="bg-[#0D0E0F] border-t border-[#2E3035] text-[#B8B5AE] text-sm pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand & Craft */}
          <div className="space-y-4">
            <span className="font-serif text-2xl tracking-widest text-[#F5F2EA] block uppercase font-medium">
              U.S. BARBER
            </span>
            <p className="text-xs tracking-wider uppercase text-[#C5A059] font-medium">
              CLASSIC CRAFT. MODERN GROOMING.
            </p>
            <p className="text-xs text-[#B8B5AE] leading-relaxed">
              Catonsville’s destination for traditional master barbering, precision tapers, hot towel straight razor shaves, and beard care.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-[#F5F2EA]">
              <div className="flex text-[#C5A059]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#C5A059]" />
                ))}
              </div>
              <span className="font-medium text-[#F5F2EA]">4.4 / 5</span>
              <span>·</span>
              <span className="text-[#B8B5AE]">271+ Reviews</span>
            </div>
          </div>

          {/* Column 2: Hours */}
          <div className="space-y-4">
            <h3 className="font-serif text-[#F5F2EA] text-base tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C5A059]" />
              Business Hours
            </h3>
            <ul className="text-xs space-y-2 text-[#B8B5AE]">
              <li className="flex justify-between py-1 border-b border-[#202124]">
                <span>Monday – Friday</span>
                <span className="font-medium text-[#F5F2EA]">8:00 AM – 6:00 PM</span>
              </li>
              <li className="flex justify-between py-1 border-b border-[#202124]">
                <span>Saturday</span>
                <span className="font-medium text-[#F5F2EA]">8:00 AM – 5:00 PM</span>
              </li>
              <li className="flex justify-between py-1 border-b border-[#202124]">
                <span>Sunday</span>
                <span className="font-medium text-[#F5F2EA]">9:00 AM – 4:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Location & Phone */}
          <div className="space-y-4">
            <h3 className="font-serif text-[#F5F2EA] text-base tracking-wide flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C5A059]" />
              Catonsville Shop
            </h3>
            <p className="text-xs text-[#B8B5AE] leading-relaxed">
              730 Frederick Rd, Suite 103<br />
              Catonsville, MD 21228<br />
              United States
            </p>
            <div className="pt-1">
              <a
                href="tel:+14107885156"
                className="flex items-center gap-2 text-xs font-semibold text-[#F5F2EA] hover:text-[#C5A059] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                +1 (410) 788-5156
              </a>
            </div>
            <div className="pt-2">
              <a
                href="https://maps.google.com/?q=U.S.+Barber+730+Frederick+Rd+Suite+103+Catonsville+MD+21228"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#C5A059] hover:underline"
              >
                Get Directions
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Column 4: Quick Action & Links */}
          <div className="space-y-4">
            <h3 className="font-serif text-[#F5F2EA] text-base tracking-wide">
              Appointments
            </h3>
            <p className="text-xs text-[#B8B5AE]">
              Reserve your seat with your preferred barber or choose the next available chair.
            </p>
            <button
              onClick={() => onNavigate('/book')}
              className="w-full py-3 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] font-semibold text-xs tracking-wider uppercase transition-colors"
            >
              BOOK AN APPOINTMENT
            </button>
            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 text-xs">
              <button onClick={() => onNavigate('/services')} className="hover:text-[#F5F2EA]">Services</button>
              <button onClick={() => onNavigate('/barbers')} className="hover:text-[#F5F2EA]">Barbers</button>
              <button onClick={() => onNavigate('/gallery')} className="hover:text-[#F5F2EA]">Gallery</button>
              <button onClick={() => onNavigate('/about')} className="hover:text-[#F5F2EA]">About</button>
              <button onClick={() => onNavigate('/contact')} className="hover:text-[#F5F2EA]">Contact</button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#202124] flex flex-col sm:flex-row items-center justify-between text-xs text-[#B8B5AE]/60 gap-4">
          <p>© {new Date().getFullYear()} U.S. Barber · Catonsville, MD. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('/admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141517] border border-[#2E3035] hover:border-[#C5A059] text-[#B8B5AE] hover:text-[#C5A059] transition-colors rounded"
            >
              <Shield className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="font-medium">
                {slotAvailable ? 'Admin Setup (1 Slot Available)' : 'Admin Login'}
              </span>
            </button>
            <a
              href="https://maps.google.com/?q=U.S.+Barber+730+Frederick+Rd+Suite+103+Catonsville+MD+21228"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#B8B5AE]"
            >
              Google Maps
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
