import React, { useState, useEffect } from 'react';
import { ServiceItem, BarberItem, BusinessHoursItem } from '../types';
import { servicesService } from '../services/services.service';
import { barbersService } from '../services/barbers.service';
import { businessHoursService } from '../services/business-hours.service';
import { handleImageError, getServiceImageUrl } from '../lib/images';
import {
  Scissors,
  Clock,
  MapPin,
  Phone,
  Star,
  ExternalLink,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string, initialServiceId?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [barbers, setBarbers] = useState<BarberItem[]>([]);
  const [hours, setHours] = useState<BusinessHoursItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [srv, brb, hrs] = await Promise.all([
          servicesService.getAll(false),
          barbersService.getAll(false),
          businessHoursService.getAll(),
        ]);
        setServices(srv.slice(0, 4));
        setBarbers(brb);
        setHours(hrs);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-24">
      {/* ==================================================================== */}
      {/* HERO SECTION */}
      {/* ==================================================================== */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-[#2E3035]">
        {/* Background Image with Dark Contrast Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero_us_barber_1790211473323.jpg"
            alt="U.S. Barber Shop Interior Catonsville"
            className="w-full h-full object-cover object-center filter brightness-[0.42] contrast-[1.08]"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121314] via-[#121314]/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A059] font-semibold bg-[#121314]/80 px-4 py-1.5 rounded-full border border-[#C5A059]/30 backdrop-blur-sm">
            <MapPin className="w-3.5 h-3.5" />
            730 Frederick Rd · Catonsville, MD
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-[#F5F2EA] leading-[1.05] uppercase max-w-4xl mx-auto">
            Classic Craft.<br />
            <span className="italic font-normal text-[#C5A059]">Modern Grooming.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#B8B5AE] max-w-2xl mx-auto font-light leading-relaxed">
            Professional barbering in Catonsville, Maryland. Timeless craftsmanship, master razor work, and precision tailored haircuts.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('/book')}
              className="w-full sm:w-auto px-9 py-4 bg-[#C5A059] hover:bg-[#D4B06A] active:bg-[#A4833E] text-[#121314] font-semibold text-xs tracking-widest uppercase transition-all shadow-xl"
            >
              BOOK AN APPOINTMENT
            </button>

            <a
              href="tel:+14107885156"
              className="w-full sm:w-auto px-8 py-4 bg-[#1A1B1D]/80 hover:bg-[#202124] text-[#F5F2EA] border border-[#2E3035] hover:border-[#C5A059] font-medium text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
              CALL THE SHOP
            </a>
          </div>

          {/* Scroll Down Indicator */}
          <div className="pt-12 text-[#B8B5AE]/60 flex flex-col items-center gap-1 animate-pulse">
            <span className="text-[11px] uppercase tracking-widest font-mono">Explore</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* TRUST / FACTUAL BUSINESS INFORMATION */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1A1B1D] border border-[#2E3035] rounded p-8 sm:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center divide-y md:divide-y-0 md:divide-x divide-[#2E3035]">
            
            {/* Stat 1: Rating */}
            <div className="text-center md:text-left md:pr-8 space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-1 text-[#C5A059]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C5A059]" />
                ))}
              </div>
              <div className="font-serif text-4xl text-[#F5F2EA] tabular-nums">4.4 / 5.0</div>
              <p className="text-xs text-[#B8B5AE] uppercase tracking-wider">
                Google Business Rating
              </p>
            </div>

            {/* Stat 2: Review Count */}
            <div className="text-center md:text-left md:px-8 pt-6 md:pt-0 space-y-2">
              <div className="font-serif text-4xl text-[#F5F2EA] tabular-nums">271+</div>
              <p className="text-xs text-[#B8B5AE] uppercase tracking-wider">
                Public Verified Reviews
              </p>
              <p className="text-xs text-[#B8B5AE]/70">
                Community recognized barbering standard in Baltimore County.
              </p>
            </div>

            {/* Stat 3: Action */}
            <div className="text-center md:text-left md:pl-8 pt-6 md:pt-0 space-y-4">
              <div>
                <span className="text-xs text-[#C5A059] uppercase tracking-widest font-semibold block">
                  Catonsville, Maryland
                </span>
                <span className="text-sm text-[#F5F2EA] font-medium block mt-1">
                  730 Frederick Rd, Suite 103
                </span>
              </div>
              <a
                href="https://maps.google.com/?q=U.S.+Barber+730+Frederick+Rd+Suite+103+Catonsville+MD+21228"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#202124] hover:bg-[#282a2e] text-[#F5F2EA] text-xs font-semibold uppercase tracking-wider border border-[#2E3035] hover:border-[#C5A059] transition-colors"
              >
                VIEW ON GOOGLE
                <ExternalLink className="w-3.5 h-3.5 text-[#C5A059]" />
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* FEATURED SERVICES PREVIEW */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold block mb-2">
              Artisan Grooming
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#F5F2EA]">
              Selected Barber Services
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/services')}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C5A059] hover:text-[#D4B06A] transition-colors"
          >
            View All Services
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#B8B5AE] text-sm">Loading services...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-[#1A1B1D] border border-[#2E3035] rounded overflow-hidden flex flex-col justify-between group hover:border-[#C5A059]/60 transition-all"
              >
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={getServiceImageUrl(service)}
                    alt={`${service.name} barber service at U.S. Barber`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={handleImageError}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1B1D] via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-serif text-lg text-[#F5F2EA] leading-snug">
                        {service.name}
                      </h3>
                      <span className="text-base font-semibold text-[#C5A059] tabular-nums whitespace-nowrap">
                        ${service.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-[#B8B5AE] leading-relaxed line-clamp-3">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#2E3035] flex items-center justify-between">
                    <span className="text-xs text-[#B8B5AE] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                      {service.duration_minutes} min
                    </span>
                    <button
                      onClick={() => onNavigate('/book', service.id)}
                      className="px-4 py-2 bg-[#202124] hover:bg-[#C5A059] hover:text-[#121314] text-[#F5F2EA] text-xs font-semibold uppercase tracking-wider transition-colors border border-[#2E3035]"
                    >
                      BOOK
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ==================================================================== */}
      {/* EDITORIAL CRAFT SPOTLIGHT */}
      {/* ==================================================================== */}
      <section className="bg-[#161719] py-20 border-y border-[#2E3035]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
                Catonsville Craftsmanship
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#F5F2EA] leading-tight">
                Traditional Standards.<br />
                Contemporary Detail.
              </h2>
              <p className="text-sm text-[#B8B5AE] leading-relaxed">
                At U.S. Barber, we uphold the storied traditions of American barbering. Every cut begins with consultation and attention to personal style, finished with hot towel razor work and clean edges.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4 text-xs">
                <div className="space-y-1">
                  <span className="font-semibold text-[#F5F2EA] block">Master Precision</span>
                  <span className="text-[#B8B5AE]">Expert shear work, skin fades, and classic tapers.</span>
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-[#F5F2EA] block">Steamed Towel Ritual</span>
                  <span className="text-[#B8B5AE]">Warm lather straight razor shaves and beard sculpting.</span>
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-[#F5F2EA] block">Walk-Ins & Appointments</span>
                  <span className="text-[#B8B5AE]">Book online in advance or call the shop directly.</span>
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-[#F5F2EA] block">Convenient Location</span>
                  <span className="text-[#B8B5AE]">Frederick Rd in historic Catonsville with easy parking.</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onNavigate('/about')}
                  className="px-6 py-3 bg-[#202124] hover:bg-[#282a2e] text-[#F5F2EA] text-xs font-semibold uppercase tracking-wider border border-[#2E3035] transition-colors"
                >
                  READ OUR STORY
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img
                src="/images/barber_craft_cut_1790211484330.jpg"
                alt="Haircut precision"
                className="w-full h-64 object-cover rounded border border-[#2E3035]"
                onError={handleImageError}
              />
              <img
                src="/images/barber_hot_towel_shave_1790211495750.jpg"
                alt="Hot towel shave"
                className="w-full h-64 object-cover rounded border border-[#2E3035] mt-6"
                onError={handleImageError}
              />
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* SHOP LOCATION & HOURS */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Hours Card */}
          <div className="bg-[#1A1B1D] border border-[#2E3035] rounded p-8 space-y-6">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#C5A059]" />
              <h3 className="font-serif text-2xl text-[#F5F2EA]">Hours of Operation</h3>
            </div>
            
            <div className="space-y-3 text-xs">
              {hours.map((h) => (
                <div key={h.day_of_week} className="flex justify-between py-2 border-b border-[#2E3035]">
                  <span className="font-medium text-[#F5F2EA]">{h.day_name}</span>
                  <span className="text-[#B8B5AE]">
                    {h.is_closed ? 'Closed' : `${h.open_time} – ${h.close_time}`}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-xs text-[#B8B5AE]">
              Operating hours in <span className="text-[#F5F2EA]">America/New_York (Eastern Time)</span>.
            </div>
          </div>

          {/* Location & Contact Card */}
          <div className="bg-[#1A1B1D] border border-[#2E3035] rounded p-8 space-y-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#C5A059]" />
              <h3 className="font-serif text-2xl text-[#F5F2EA]">Visit U.S. Barber</h3>
            </div>

            <div className="space-y-2 text-sm text-[#B8B5AE]">
              <p className="font-semibold text-[#F5F2EA]">U.S. Barber</p>
              <p>730 Frederick Rd, Suite 103</p>
              <p>Catonsville, MD 21228</p>
              <p className="pt-2">
                Telephone:{' '}
                <a href="tel:+14107885156" className="text-[#C5A059] font-medium hover:underline">
                  +1 (410) 788-5156
                </a>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <a
                href="https://maps.google.com/?q=U.S.+Barber+730+Frederick+Rd+Suite+103+Catonsville+MD+21228"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 px-4 bg-[#202124] hover:bg-[#282a2e] text-[#F5F2EA] text-center text-xs font-semibold uppercase tracking-wider border border-[#2E3035] transition-colors"
              >
                GET DIRECTIONS
              </a>
              <button
                onClick={() => onNavigate('/book')}
                className="flex-1 py-3 px-4 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] text-center text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                BOOK APPOINTMENT
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* CALL TO ACTION BANNER */}
      {/* ==================================================================== */}
      <section className="bg-[#1A1B1D] border-t border-[#2E3035] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <span className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
            Reserve Your Appointment
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#F5F2EA]">
            Ready for Your Next Cut?
          </h2>
          <p className="text-sm text-[#B8B5AE] max-w-xl mx-auto">
            Book online anytime with real-time schedule availability or call our shop during open hours.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('/book')}
              className="w-full sm:w-auto px-8 py-4 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] font-semibold text-xs tracking-wider uppercase transition-colors"
            >
              BOOK ONLINE NOW
            </button>
            <a
              href="tel:+14107885156"
              className="w-full sm:w-auto px-8 py-4 bg-[#202124] hover:bg-[#282a2e] text-[#F5F2EA] border border-[#2E3035] text-xs font-semibold tracking-wider uppercase transition-colors"
            >
              CALL (410) 788-5156
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
