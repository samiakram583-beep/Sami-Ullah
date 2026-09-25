import React, { useState, useEffect } from 'react';
import { BarberItem } from '../types';
import { barbersService } from '../services/barbers.service';
import { User, Scissors, Star, CheckCircle, Phone } from 'lucide-react';
import { getImageUrl, handleImageError } from '../lib/images';

interface BarbersPageProps {
  onNavigate: (path: string, serviceId?: string) => void;
}

export const BarbersPage: React.FC<BarbersPageProps> = ({ onNavigate }) => {
  const [barbers, setBarbers] = useState<BarberItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await barbersService.getAll(false);
        setBarbers(list);
      } catch (err) {
        console.error('Error loading barbers:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
          Master Craftsmen
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#F5F2EA]">
          Our Barbers & Chairs
        </h1>
        <p className="text-sm text-[#B8B5AE] leading-relaxed">
          Our team combines classic barbershop traditions with razor precision. Book directly with your preferred chair or choose the first available master barber.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center text-[#B8B5AE] text-sm">
          Loading barber roster...
        </div>
      ) : barbers.length === 0 ? (
        <div className="py-24 text-center text-[#B8B5AE] text-sm">
          No barber profiles currently published. Please check back shortly.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="bg-[#1A1B1D] border border-[#2E3035] rounded overflow-hidden flex flex-col justify-between hover:border-[#C5A059]/60 transition-all group"
            >
              {barber.image_url ? (
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={getImageUrl(barber.image_url)}
                    alt={barber.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1B1D] via-transparent to-transparent" />
                </div>
              ) : (
                <div className="h-64 bg-[#202124] flex items-center justify-center text-[#C5A059]">
                  <User className="w-16 h-16 opacity-40" />
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl text-[#F5F2EA]">
                    {barber.name}
                  </h3>
                  <p className="text-xs text-[#B8B5AE] leading-relaxed">
                    {barber.bio || 'Dedicated master barber at U.S. Barber in Catonsville.'}
                  </p>

                  {barber.specialties && barber.specialties.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] uppercase tracking-wider text-[#B8B5AE] block mb-1 font-semibold">
                        Specialties
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {barber.specialties.map((spec, idx) => (
                          <span
                            key={idx}
                            className="bg-[#121314] text-[#C5A059] px-2.5 py-0.5 rounded text-[11px] border border-[#2E3035]"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#2E3035]">
                  <button
                    onClick={() => onNavigate('/book')}
                    className="w-full py-3 bg-[#202124] hover:bg-[#C5A059] hover:text-[#121314] text-[#F5F2EA] text-xs font-semibold uppercase tracking-wider transition-colors border border-[#2E3035]"
                  >
                    BOOK WITH THIS CHAIR
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Staff Booking Callout */}
      <div className="bg-[#161719] border border-[#2E3035] rounded p-8 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-serif text-xl text-[#F5F2EA]">Flexible Scheduling</h4>
          <p className="text-xs text-[#B8B5AE]">
            Need the earliest available appointment? Select "Any Available Barber" in the booking system.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/book')}
          className="px-6 py-3 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] font-semibold text-xs tracking-wider uppercase whitespace-nowrap"
        >
          VIEW LIVE OPENINGS
        </button>
      </div>
    </div>
  );
};
