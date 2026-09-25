import React, { useState, useEffect } from 'react';
import { ServiceItem } from '../types';
import { servicesService } from '../services/services.service';
import { Clock, Scissors, Check, Sparkles } from 'lucide-react';
import { handleImageError, getImageUrl } from '../lib/images';

interface ServicesPageProps {
  onNavigate: (path: string, initialServiceId?: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    async function load() {
      try {
        const list = await servicesService.getAll(false);
        setServices(list);
      } catch (err) {
        console.error('Error loading services:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = ['All', ...Array.from(new Set(services.map((s) => s.category)))];

  const filteredServices =
    selectedCategory === 'All'
      ? services
      : services.filter((s) => s.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
          Tailored Grooming
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#F5F2EA]">
          Services & Grooming Menu
        </h1>
        <p className="text-sm text-[#B8B5AE] leading-relaxed">
          Every service is performed with dedicated attention to detail, traditional hot towels, and premium styling finishes. Select any service to reserve your appointment online.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded transition-colors ${
              selectedCategory === cat
                ? 'bg-[#C5A059] text-[#121314]'
                : 'bg-[#1A1B1D] text-[#B8B5AE] hover:text-[#F5F2EA] border border-[#2E3035]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-24 text-center text-[#B8B5AE] text-sm">
          Loading service menu...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="py-24 text-center text-[#B8B5AE] text-sm">
          No services found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-[#1A1B1D] border border-[#2E3035] rounded overflow-hidden flex flex-col justify-between hover:border-[#C5A059]/60 transition-all group"
            >
              {service.image_url && (
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={getImageUrl(service.image_url)}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1B1D] via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 bg-[#121314]/80 px-2.5 py-1 rounded text-[11px] font-semibold tracking-wider uppercase text-[#C5A059] border border-[#2E3035]">
                    {service.category}
                  </div>
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-serif text-xl text-[#F5F2EA] leading-snug">
                      {service.name}
                    </h3>
                    <span className="text-xl font-semibold text-[#C5A059] tabular-nums whitespace-nowrap">
                      ${service.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-[#B8B5AE] leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#2E3035] flex items-center justify-between">
                  <span className="text-xs text-[#B8B5AE] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                    {service.duration_minutes} minutes
                  </span>
                  <button
                    onClick={() => onNavigate('/book', service.id)}
                    className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    BOOK NOW
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note on pricing / custom services */}
      <div className="p-6 bg-[#161719] border border-[#2E3035] rounded text-center text-xs text-[#B8B5AE] max-w-2xl mx-auto space-y-1">
        <p className="font-semibold text-[#F5F2EA]">Custom Services & Special Consultations</p>
        <p>
          Have questions about a specific haircut or beard restoration? Give our Catonsville shop a call at{' '}
          <a href="tel:+14107885156" className="text-[#C5A059] hover:underline">
            +1 (410) 788-5156
          </a>.
        </p>
      </div>
    </div>
  );
};
