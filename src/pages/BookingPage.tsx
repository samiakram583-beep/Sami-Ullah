import React from 'react';
import { BookingFlow } from '../components/booking/BookingFlow';

interface BookingPageProps {
  initialServiceId?: string;
  onNavigate: (path: string) => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({ initialServiceId, onNavigate }) => {
  return (
    <div className="py-8">
      <BookingFlow
        initialServiceId={initialServiceId}
        onNavigate={onNavigate}
        onBookingComplete={() => {}}
      />
    </div>
  );
};
