import React from 'react';
import { View, Text } from 'react-native';
import { JobSkill } from '../types/job';

interface JobSkillsSectionProps {
  skills: JobSkill[] | undefined;
}

const levelMap: Record<string, string> = {
  REQUIRED: 'Required',
  PREFERRED: 'Preferred',
  OPTIONAL: 'Optional',
};

const JobSkillsSection: React.FC<JobSkillsSectionProps> = ({ skills }) => {
  if (!skills || skills.length === 0) return null;

  return (
    <View className="bg-white rounded-2xl mx-4 mb-4 p-6 shadow-sm border border-gray-100">
      <Text className="text-lg font-bold text-gray-900 mb-3">Required Skills</Text>

      {skills.map((js) => (
        <View key={js.id} className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-0">
          <View>
            <Text className="text-gray-900 font-medium">{js.skill.name}</Text>
            <Text className="text-gray-500 text-xs mt-0.5">{levelMap[js.requiredLevel] || js.requiredLevel}</Text>
          </View>
          <Text className="text-gray-600 text-xs">{js.minYearsExperience}+ yrs</Text>
        </View>
      ))}
    </View>
  );
};

export default JobSkillsSection;
