import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import CompanyProfileScreen from '../../components/CompanyProfileScreen';

export default function CompanyProfile() {
  const { slug } = useLocalSearchParams();
  
  return (
    <CompanyProfileScreen 
      companySlug={slug as string} 
    />
  );
}