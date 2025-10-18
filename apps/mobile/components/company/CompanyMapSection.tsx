import React from 'react';
import { Linking, Platform, Text, TouchableOpacity, View } from 'react-native';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapPin, Navigation } from 'lucide-react-native';

interface CompanyMapSectionProps {
  company: {
    companyName: string;
    address: string;
    city: string;
    province: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

const CompanyMapSection: React.FC<CompanyMapSectionProps> = ({ company }) => {
  const defaultCoordinates = {
    latitude: 10.7340344,
    longitude: 106.7217427
  };

  const coordinates = company.coordinates || defaultCoordinates;
  const fullAddress = [company.address, company.city, company.province]
    .filter(Boolean)
    .join(', ');

  const openInMaps = () => {
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:'
    });
    
    const url = Platform.select({
      ios: `${scheme}${coordinates.latitude},${coordinates.longitude}?q=${encodeURIComponent(company.companyName)}`,
      android: `${scheme}${coordinates.latitude},${coordinates.longitude}?q=${encodeURIComponent(fullAddress)}`
    });

    if (url) {
      Linking.openURL(url).catch(err => {
        console.error('Error opening maps:', err);
        // Fallback to Google Maps URL
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`;
        Linking.openURL(googleMapsUrl);
      });
    }
  };

  return (
    <View className="bg-white mx-4 mb-4 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-bold text-gray-900">Office Location</Text>
          <TouchableOpacity
            onPress={openInMaps}
            className="flex-row items-center px-3 py-1.5 bg-blue-50 rounded-lg"
          >
            <Navigation size={14} color="#2563EB" />
            <Text className="text-blue-600 text-sm font-medium ml-1">Directions</Text>
          </TouchableOpacity>
        </View>
        
        <View className="flex-row items-start mb-3">
          <MapPin size={16} color="#6B7280" style={{ marginTop: 2 }} />
          <Text className="text-gray-600 text-sm ml-2 flex-1">
            {fullAddress}
          </Text>
        </View>
      </View>

      {/* <View className="h-48">
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={{
            ...coordinates,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          <Marker
            coordinate={coordinates}
            title={company.companyName}
            description={fullAddress}
          >
            <View className="bg-blue-600 p-2 rounded-full">
              <MapPin size={20} color="white" fill="white" />
            </View>
          </Marker>
        </MapView>
      </View> */}
    </View>
  );
};

export default CompanyMapSection;