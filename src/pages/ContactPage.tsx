import React, { useState } from 'react';
import { contactService } from '../services/contact.service';
import { useToast } from '../components/common/Toast';
import { MapPin, Phone, Clock, Send, ExternalLink, CheckCircle2 } from 'lucide-react';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'Please enter your name.';
    if (!formData.email.trim() || !formData.email.includes('@'))
      newErrors.email = 'Please enter a valid email address.';
    if (!formData.message.trim()) newErrors.message = 'Please enter your message.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await contactService.submit(formData);
      setSubmitted(true);
      showToast('Your message has been sent to our shop team!', 'success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      console.error('Contact submission error:', err);
      showToast('Failed to send message. Please call the shop directly.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
          Get in Touch
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#F5F2EA]">
          Contact & Location
        </h1>
        <p className="text-sm text-[#B8B5AE] leading-relaxed">
          Stop by our shop on Frederick Road, book online, or send us an inquiry directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Business Details & Hours */}
        <div className="space-y-8">
          <div className="bg-[#1A1B1D] border border-[#2E3035] rounded p-8 space-y-6">
            <h2 className="font-serif text-2xl text-[#F5F2EA]">Shop Information</h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F5F2EA] block">U.S. Barber</strong>
                  <span className="text-[#B8B5AE] block">730 Frederick Rd, Suite 103</span>
                  <span className="text-[#B8B5AE] block">Catonsville, MD 21228</span>
                  <span className="text-xs text-[#C5A059] mt-1 block">Free customer parking available</span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Phone className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F5F2EA] block">Telephone</strong>
                  <a
                    href="tel:+14107885156"
                    className="text-[#B8B5AE] hover:text-[#C5A059] transition-colors"
                  >
                    +1 (410) 788-5156
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Clock className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F5F2EA] block">Weekly Hours</strong>
                  <div className="text-xs text-[#B8B5AE] space-y-1 mt-1">
                    <p>Mon – Fri: 8:00 AM – 6:00 PM</p>
                    <p>Saturday: 8:00 AM – 5:00 PM</p>
                    <p>Sunday: 9:00 AM – 4:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#2E3035]">
              <a
                href="tel:+14107885156"
                className="py-3 px-3 bg-[#202124] hover:bg-[#282a2e] text-[#F5F2EA] text-center text-xs font-semibold uppercase tracking-wider border border-[#2E3035] transition-colors"
              >
                CALL NOW
              </a>
              <a
                href="https://maps.google.com/?q=U.S.+Barber+730+Frederick+Rd+Suite+103+Catonsville+MD+21228"
                target="_blank"
                rel="noreferrer"
                className="py-3 px-3 bg-[#202124] hover:bg-[#282a2e] text-[#F5F2EA] text-center text-xs font-semibold uppercase tracking-wider border border-[#2E3035] transition-colors"
              >
                DIRECTIONS
              </a>
              <button
                onClick={() => onNavigate('/book')}
                className="py-3 px-3 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] text-center text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                BOOK
              </button>
            </div>
          </div>

          {/* Interactive Map Embed / Preview Card */}
          <div className="bg-[#1A1B1D] border border-[#2E3035] rounded p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-serif text-lg text-[#F5F2EA]">Google Maps Listing</span>
              <a
                href="https://maps.google.com/?q=U.S.+Barber+730+Frederick+Rd+Suite+103+Catonsville+MD+21228"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#C5A059] hover:underline"
              >
                Open in Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="w-full h-48 bg-[#121314] rounded border border-[#2E3035] flex items-center justify-center text-center p-4">
              <div>
                <MapPin className="w-8 h-8 text-[#C5A059] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#F5F2EA]">U.S. Barber · Catonsville</p>
                <p className="text-[11px] text-[#B8B5AE]">Frederick Rd between Ingleside Ave & Beaumont Ave</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Inquiry Form */}
        <div className="bg-[#1A1B1D] border border-[#2E3035] rounded p-8 space-y-6">
          <div>
            <h2 className="font-serif text-2xl text-[#F5F2EA]">Send an Inquiry</h2>
            <p className="text-xs text-[#B8B5AE] mt-1">
              Have a question regarding styling, group bookings, or special accommodations? Fill out this form and we will get back to you.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 text-center bg-[#202124] rounded border border-emerald-500/30 text-emerald-300 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="font-serif text-xl text-[#F5F2EA]">Message Received</h3>
              <p className="text-xs text-[#B8B5AE]">
                Thank you for contacting U.S. Barber. Our team will review your inquiry shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 bg-[#121314] border border-[#2E3035] text-xs font-semibold text-[#F5F2EA] hover:border-[#C5A059]"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA] mb-1">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] text-sm p-3 rounded focus:outline-none transition-colors"
                />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA] mb-1">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] text-sm p-3 rounded focus:outline-none transition-colors"
                />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA] mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="(410) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] text-sm p-3 rounded focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#F5F2EA] mb-1">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="How can we assist you?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#121314] border border-[#2E3035] focus:border-[#C5A059] text-[#F5F2EA] text-sm p-3 rounded focus:outline-none transition-colors resize-none"
                />
                {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#C5A059] hover:bg-[#D4B06A] active:bg-[#A4833E] disabled:opacity-50 text-[#121314] font-semibold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Sending message...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>SEND INQUIRY</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
