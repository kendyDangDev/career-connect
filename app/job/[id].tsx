import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import JobDetailScreen from '../../components/JobDetailScreen';

export default function JobDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const handleBack = () => {
    router.back();
  };
  
  const handleApply = (job: any) => {
    // Handle job application logic here
    console.log('Applying for job:', job.title);
    // You can navigate to apply screen or show a modal
  };
  
  return (
    <JobDetailScreen 
      jobId={id as string} 
      onBack={handleBack}
      onApply={handleApply}
    />
  );
}
