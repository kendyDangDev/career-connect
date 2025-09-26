import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  categories?: Category[];
  selectedCategoryId?: string;
  onCategorySelect?: (categoryId: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories = [
    { id: 'all', name: 'All', slug: 'all' },
    { id: 'marketing', name: 'Marketing', slug: 'marketing' },
    { id: 'design', name: 'Design', slug: 'design' },
    { id: 'administration', name: 'Administration', slug: 'administration' },
    { id: 'programming', name: 'Programming', slug: 'programming' },
    { id: 'sales', name: 'Sales', slug: 'sales' },
  ],
  selectedCategoryId = 'all',
  onCategorySelect
}) => {
  const handleCategoryPress = (categoryId: string) => {
    onCategorySelect?.(categoryId);
  };

  return (
    <View className="mb-4">
      <Text className="text-lg font-bold text-gray-900 mb-4 px-4">
        Category
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="px-4"
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {categories.map((category, index) => {
          const isSelected = category.id === selectedCategoryId;
          
          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleCategoryPress(category.id)}
              className={`
                px-6 py-3 rounded-full mr-3 min-w-0
                ${isSelected 
                  ? 'bg-blue-600' 
                  : 'bg-gray-100'
                }
              `}
              activeOpacity={0.7}
            >
              <Text 
                className={`
                  font-medium text-sm
                  ${isSelected 
                    ? 'text-white' 
                    : 'text-gray-600'
                  }
                `}
                numberOfLines={1}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CategoryFilter;
