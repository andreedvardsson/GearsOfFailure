'use client';

import ProtectedRoute from '../components/ProtectedRoute';
import Navigation from '../components/Navigation';

export default function StudentPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Navigation />
      {children}
    </ProtectedRoute>
  );
}
