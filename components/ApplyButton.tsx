import { useAlert } from '@/contexts/AlertContext';
import { Calendar, Users } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ApplyButtonProps {
  deadline: string;
  applicationCount: number;
  onApply?: () => void;
  disabled?: boolean;
}

const ApplyButton: React.FC<ApplyButtonProps> = ({ 
  deadline, 
  applicationCount, 
  onApply,
  disabled = false 
}) => {
  const insets = useSafeAreaInsets();

  const formatDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays <= 7) {
      return `${diffDays} days left`;
    } else {
      return deadlineDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const alert = useAlert();

  const isExpired = new Date(deadline) < new Date();

  const handleApply = () => {
    if (isExpired) {
      alert.warning('Application Closed', 'The application deadline for this job has passed.');
      return;
    }
    
    if (disabled) {
      return;
    }

    onApply?.();
  };

  return (
    <View 
      className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200"
      style={{ 
        paddingBottom: insets.bottom + 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      <View className="px-4 pt-4">
        {/* Deadline and Application Info */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <Calendar size={16} color="#6B7280" />
            <Text className="text-gray-600 text-sm ml-1">
              Deadline: <Text className={isExpired ? 'text-red-500' : 'text-gray-900'}>{formatDeadline(deadline)}</Text>
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Users size={16} color="#6B7280" />
            <Text className="text-gray-600 text-sm ml-1">
              {applicationCount} applications
            </Text>
          </View>
        </View>

        {/* Apply Button */}
        <TouchableOpacity
          onPress={handleApply}
          className={`
            w-full rounded-2xl py-4 items-center
            ${isExpired || disabled 
              ? 'bg-gray-300' 
              : 'bg-blue-600'
            }
          `}
          activeOpacity={isExpired || disabled ? 1 : 0.8}
          disabled={disabled}
        >
          <Text className={`
            font-bold text-lg
            ${isExpired || disabled ? 'text-gray-500' : 'text-white'}
          `}>
            {isExpired ? 'Application Closed' : 'Apply Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ApplyButton;
