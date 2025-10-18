import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { authService } from '@/services/authService';
import { AuthDebugger } from '@/utils/authDebug';
import { useAuth } from '@/hooks/useAuth';

export const AuthDebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const { user, token, isAuthenticated } = useAuth();

  const checkAuthStatus = async () => {
    let info = '=== AUTH STATUS DEBUG ===\n';
    info += `Platform: ${typeof window !== 'undefined' ? 'Web' : 'Native'}\n`;
    info += `API URL: ${authService.getBaseURL()}\n\n`;
    
    // Check hook state
    info += '--- Hook State ---\n';
    info += `Is Authenticated: ${isAuthenticated}\n`;
    info += `User: ${user ? user.email : 'Not logged in'}\n`;
    info += `Token in State: ${token ? 'Present' : 'Missing'}\n\n`;
    
    // Check stored data
    info += '--- Stored Data ---\n';
    const storedToken = await authService.getStoredToken();
    const storedUser = await authService.getStoredUser();
    
    info += `Stored Token: ${storedToken ? `Present (${storedToken.substring(0, 20)}...)` : 'Missing'}\n`;
    info += `Stored User: ${storedUser ? storedUser.email : 'Missing'}\n\n`;
    
    // Check backend verification
    if (storedToken) {
      info += '--- Backend Verification ---\n';
      try {
        const isValid = await authService.checkAuthStatus();
        info += `Token Valid: ${isValid}\n`;
      } catch (error) {
        info += `Verification Error: ${error}\n`;
      }
    }
    
    setDebugInfo(info);
  };

  useEffect(() => {
    if (isVisible) {
      checkAuthStatus();
    }
  }, [isVisible, user, token]);

  if (!__DEV__) {
    return null; // Only show in development
  }

  return (
    <View style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 9999 }}>
      <TouchableOpacity
        onPress={() => setIsVisible(!isVisible)}
        style={{
          backgroundColor: isAuthenticated ? '#10b981' : '#ef4444',
          padding: 10,
          borderRadius: 25,
          width: 50,
          height: 50,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>AUTH</Text>
      </TouchableOpacity>
      
      {isVisible && (
        <View
          style={{
            position: 'absolute',
            bottom: 60,
            right: 0,
            backgroundColor: 'white',
            padding: 15,
            borderRadius: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            width: 350,
            maxHeight: 400,
          }}
        >
          <ScrollView>
            <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>{debugInfo}</Text>
          </ScrollView>
          
          <View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
            <TouchableOpacity
              onPress={checkAuthStatus}
              style={{
                backgroundColor: '#3b82f6',
                padding: 8,
                borderRadius: 5,
                flex: 1,
              }}
            >
              <Text style={{ color: 'white', textAlign: 'center' }}>Refresh</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => AuthDebugger.checkAuthStatus()}
              style={{
                backgroundColor: '#8b5cf6',
                padding: 8,
                borderRadius: 5,
                flex: 1,
              }}
            >
              <Text style={{ color: 'white', textAlign: 'center' }}>Full Debug</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => AuthDebugger.clearAuth()}
              style={{
                backgroundColor: '#ef4444',
                padding: 8,
                borderRadius: 5,
                flex: 1,
              }}
            >
              <Text style={{ color: 'white', textAlign: 'center' }}>Clear Auth</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
