import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

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
    { id: "all", name: "All", slug: "all" },
    { id: "marketing", name: "Marketing", slug: "marketing" },
    { id: "design", name: "Design", slug: "design" },
    { id: "administration", name: "Administration", slug: "administration" },
    { id: "programming", name: "Programming", slug: "programming" },
    { id: "sales", name: "Sales", slug: "sales" },
  ],
  selectedCategoryId = "all",
  onCategorySelect,
}) => {
  const handleCategoryPress = (categoryId: string) => {
    onCategorySelect?.(categoryId);
  };

  return (
    <View className="mb-6">
      {/* Section Header with Gradient */}
      <View className="px-4 mb-4">
        <Text className="text-xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text mb-1">
          Danh mục công việc
        </Text>
        <View className="w-12 h-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full" />
      </View>

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
                relative px-6 py-3 rounded-full mr-3 min-w-0 overflow-hidden
                ${
                  isSelected
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 shadow-glow-purple"
                    : "bg-white/80 backdrop-blur-sm border border-purple-100"
                }
              `}
              activeOpacity={0.8}
            >
              {/* Background glow for selected item */}
              {isSelected && (
                <View className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-full scale-110" />
              )}

              <Text
                className={`
                  font-semibold text-sm relative z-10
                  ${isSelected ? "text-white" : "text-purple-600"}
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
