import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { UserProfile } from '@/components/UserProfile';

export const Profile: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      <UserProfile />
      <Footer />
    </div>
  );
};
