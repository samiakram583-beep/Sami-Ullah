# U.S. Barber — Catonsville, MD

Professional barbering and modern appointment scheduling web application for **U.S. Barber**, located in Catonsville, Maryland.

## Overview

U.S. Barber provides high-quality grooming, classic cuts, hot towel shaves, and beard grooming services. This web application offers an end-to-end customer booking flow, business hours management, service showcase, gallery, and a dedicated admin portal.

## Features

- **Online Booking System**: Multi-step booking flow with service selection, barber preference, real-time slot generation, and instant confirmation.
- **Service Catalog**: Detailed list of haircut, beard trimming, shaving, and grooming packages with pricing and durations.
- **Barber Showcase**: Team profiles, specialties, and schedule availability.
- **Admin Workspace**:
  - Appointments management (view, filter, status updates).
  - Business hours and slot intervals configuration.
  - Blocked dates and holiday management.
  - Customer directory and booking history.
  - Service and pricing editor.
  - Gallery showcase management.
- **Client & Fallback Resilience**: Built with Supabase integration and robust in-memory mock store fallback for preview and offline environments.
- **SEO & Structured Data**: Rich Schema.org `BarberShop` JSON-LD metadata and OpenGraph tags for local search visibility.

## Tech Stack

- **Framework**: React 19 with Vite & TypeScript
- **Styling**: Tailwind CSS v4 with custom brass/dark heritage aesthetic
- **Icons & Motion**: Lucide React & Motion
- **Backend / Database**: Supabase with client-side reactive store fallback
- **Effects**: Canvas Confetti for booking completion celebration

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or bun

### Installation

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

### Production Build

```bash
npm run build
```

---

*U.S. Barber — 730 Frederick Rd, Suite 103, Catonsville, MD 21228*
