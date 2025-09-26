import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import "../global.css";
import { initializeReanimatedWithFixes } from "../utils/reanimatedFix";

// import { AuthDebugInfo } from "@/components/AuthDebugInfo";
import { AuthProvider, useAuthContext, useSafeAuthContext } from "@/contexts/AuthContext";
import { AlertProvider, useAlertService } from "@/contexts/AlertContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { suppressRNWebWarnings } from "../utils/suppressWarnings";

const queryClient = new QueryClient();

// Navigation wrapper that uses auth context
function NavigationWrapper() {
  // Initialize Alert service with context
  useAlertService();
  
  return (
    <>
      <RootLayoutNav />
      <StatusBar style="auto" />
      {/* <AuthDebugInfo /> */}
      <Toast />
    </>
  );
}

function RootLayoutNav() {
  // Use safe auth context since we might not be wrapped yet
  const authContext = useSafeAuthContext();
  const isAuthenticated = authContext?.isAuthenticated ?? false;
  const isLoading = authContext?.isLoading ?? true;
  const segments = useSegments();
  const router = useRouter();

  // Debug auth context availability (commented out to reduce log spam)
  // useEffect(() => {
  //   console.log('[RootLayoutNav] AuthContext check:', {
  //     contextAvailable: !!authContext,
  //     isAuthenticated,
  //     isLoading,
  //     user: authContext?.user ? 'Present' : 'Missing'
  //   });
  // }, [authContext, isAuthenticated, isLoading]);

  useEffect(() => {
    if (isLoading) {
      // console.log('[Navigation] Still loading, waiting...');
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const currentPath = segments.join('/');

    // console.log('[Navigation] Auth check:', { 
    //   isAuthenticated, 
    //   isLoading, 
    //   inAuthGroup, 
    //   inTabsGroup,
    //   segments,
    //   currentPath,
    //   authContext: !!authContext
    // });

    // Only redirect if we're certain about auth state
    if (!isLoading) {
      if (!isAuthenticated && !inAuthGroup) {
        // Redirect to login screen if not authenticated
        // console.log('[Navigation] Not authenticated and not in auth group, redirecting to login...');
        setTimeout(() => {
          router.replace("/(auth)/login");
        }, 100);
      } else if (isAuthenticated && inAuthGroup) {
        // Redirect to home if authenticated and in auth screens
        // console.log('[Navigation] Authenticated and in auth group, redirecting to home...');
        setTimeout(() => {
          router.replace("/(tabs)/");
        }, 100);
      }
    }
  }, [isAuthenticated, segments, isLoading, router]);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Suppress React Native Web warnings and initialize Reanimated fixes
  useEffect(() => {
    suppressRNWebWarnings();
    initializeReanimatedWithFixes();
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <AlertProvider>
            <NavigationWrapper />
          </AlertProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
