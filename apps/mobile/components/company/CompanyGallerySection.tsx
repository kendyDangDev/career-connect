import React, { useRef } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Camera } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface CompanyGallerySectionProps {
  images: string[];
  companyName: string;
}

const CompanyGallerySection: React.FC<CompanyGallerySectionProps> = ({ 
  images, 
  companyName 
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <View className="mb-4">
      <Text className="text-lg font-bold text-gray-900 mb-3 mx-4">
        Company Gallery
      </Text>
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {images.map((image, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.9}
            className="mr-3"
          >
            <Image
              source={{ uri: image }}
              className="rounded-xl"
              style={{
                width: screenWidth * 0.7,
                height: 200
              }}
              resizeMode="cover"
            />
            {index === 0 && (
              <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded-lg flex-row items-center">
                <Camera size={12} color="white" />
                <Text className="text-white text-xs ml-1">
                  {images.length} photos
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default CompanyGallerySection;