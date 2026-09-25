import React from 'react';
import { MapPin, Phone, Award, Scissors, Clock, Star } from 'lucide-react';
import { handleImageError } from '../lib/images';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Title */}
      <div className="space-y-4">
        <span className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
          Catonsville Tradition
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl text-[#F5F2EA] leading-tight">
          Classic Craftsmanship.<br />
          Rooted in Maryland.
        </h1>
        <p className="text-base text-[#B8B5AE] max-w-2xl leading-relaxed">
          U.S. Barber delivers authentic American barbering on Frederick Road in Catonsville. We are dedicated to the time-tested art of precision shears, clean necklines, and hot lather straight razor shaves.
        </p>
      </div>

      {/* Hero Visual Card */}
      <div className="relative rounded overflow-hidden border border-[#2E3035]">
        <img
          src="/images/hero_us_barber_1790211473323.jpg"
          alt="U.S. Barber Interior Catonsville MD"
          className="w-full h-80 sm:h-96 object-cover"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121314] via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs text-[#B8B5AE]">
          <span>730 Frederick Rd, Suite 103, Catonsville, MD</span>
          <span className="text-[#C5A059] font-medium">4.4 / 5.0 (271+ Reviews)</span>
        </div>
      </div>

      {/* Editorial Story */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-6">
        <div className="md:col-span-1 space-y-4 border-l-2 border-[#C5A059] pl-6">
          <h2 className="font-serif text-2xl text-[#F5F2EA]">The Barber’s Promise</h2>
          <p className="text-xs text-[#B8B5AE] leading-relaxed">
            A haircut should not be rushed. Every gentleman leaves our chairs looking sharp and feeling confident.
          </p>
        </div>

        <div className="md:col-span-2 space-y-6 text-sm text-[#B8B5AE] leading-relaxed">
          <p>
            Located in the heart of Catonsville, Maryland, <strong className="text-[#F5F2EA]">U.S. Barber</strong> was built on a simple philosophy: provide an honest, immaculate haircut and a classic barbershop experience without unnecessary pretension.
          </p>
          <p>
            Whether you are visiting for a regular bi-weekly skin taper, bringing your son in for a school cut, or sitting back for an invigorating eucalyptus hot towel straight razor shave, we honor the craft of traditional barbering with surgical precision and hospitality.
          </p>
          <p>
            Our chairs welcome walk-ins as schedule permits and offer seamless online scheduling so our customers can plan their grooming around busy workdays and weekends.
          </p>
        </div>
      </div>

      {/* Factual Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
        <div className="p-6 bg-[#1A1B1D] border border-[#2E3035] rounded space-y-2">
          <Scissors className="w-5 h-5 text-[#C5A059]" />
          <h3 className="font-serif text-lg text-[#F5F2EA]">Master Shears & Razors</h3>
          <p className="text-xs text-[#B8B5AE]">
            Skilled shear-over-comb techniques, modern fades, and authentic straight razor neck tapers.
          </p>
        </div>

        <div className="p-6 bg-[#1A1B1D] border border-[#2E3035] rounded space-y-2">
          <Clock className="w-5 h-5 text-[#C5A059]" />
          <h3 className="font-serif text-lg text-[#F5F2EA]">7 Days a Week</h3>
          <p className="text-xs text-[#B8B5AE]">
            Convenient scheduling Monday through Sunday, open early at 8:00 AM on weekdays and Saturdays.
          </p>
        </div>

        <div className="p-6 bg-[#1A1B1D] border border-[#2E3035] rounded space-y-2">
          <Star className="w-5 h-5 text-[#C5A059]" />
          <h3 className="font-serif text-lg text-[#F5F2EA]">Community Trusted</h3>
          <p className="text-xs text-[#B8B5AE]">
            Over 271+ public Google reviews with a 4.4-star average serving the Catonsville community.
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-8 border-t border-[#2E3035]">
        <button
          onClick={() => onNavigate('/book')}
          className="px-10 py-4 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] font-semibold text-xs tracking-widest uppercase transition-colors"
        >
          SCHEDULE YOUR APPOINTMENT
        </button>
      </div>
    </div>
  );
};
