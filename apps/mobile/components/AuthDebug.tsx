import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useSafeAuthContext } from '@/contexts/AuthContext';

export function AuthDebug({ location }: { location: string }) {
  const authContext = useSafeAuthContext();
  
  useEffect(() => {
    console.log(`[AuthDebug @ ${location}] Context status:`, {
      hasContext: !!authContext,
      isAuthenticated: authContext?.isAuthenticated,
      isLoading: authContext?.isLoading,
      hasUser: !!authContext?.user,
      userEmail: authContext?.user?.email,
    });
  }, [authContext, location]);
  
  if (!__DEV__) return null;
  
  return (
    <View style={{ 
      position: 'absolute', 
      top: 50, 
      right: 10, 
      backgroundColor: 'rgba(255,255,0,0.8)',
      padding: 5,
      borderRadius: 5,
      zIndex: 9999 
    }}>
      <Text style={{ fontSize: 10, color: 'black' }}>
        {location}: {authContext ? 'CTX OK' : 'NO CTX'}
      </Text>
      {authContext && (
        <Text style={{ fontSize: 9, color: 'black' }}>
          Auth: {authContext.isAuthenticated ? 'YES' : 'NO'}
        </Text>
      )}
    </View>
  );
}