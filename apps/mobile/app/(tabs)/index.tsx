// Import the reanimated fix FIRST, before any other imports
import "../../utils/reanimatedFix";

import { useRouter } from 'expo-router';
import React from 'react';
import HomePage from '../../components/HomePage';
import { Job } from '../../types/job';

export default function HomeScreen() {
  const router = useRouter();
  
  const handleJobPress = (job: Job) => {
    // Navigate to job detail screen
    // You can implement this navigation as needed
    console.log('Job pressed:', job.title);
  };
  
  const handleNotificationPress = () => {
    router.push('/(tabs)/notifications');
  };
  
  const handleSeeAllPress = () => {
    router.push('/(tabs)/jobs');
  };
  
  return (
    <HomePage 
      onJobPress={handleJobPress}
      onNotificationPress={handleNotificationPress}
      onSeeAllPress={handleSeeAllPress}
    />
  );
}
