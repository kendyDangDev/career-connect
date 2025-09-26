import React, { useState } from "react";
import { View } from "react-native";
import BottomNavigation from "./BottomNavigation";
import HomePage from "./HomePage";
import JobDetailScreen from "./JobDetailScreen";
import DebugScreen from "./DebugScreen";
import SavedJobsScreen from "./SavedJobsScreen";
import { Job } from "../types/job";
import JobListScreen from "./JobListScreen";

// Placeholder components for other screens
const ApplicationsScreen = () => <View className="flex-1 bg-gray-50" />;
const SearchScreen = () => <View className="flex-1 bg-gray-50" />;
const NotificationsScreen = () => <View className="flex-1 bg-gray-50" />;
const ProfileScreen = () => <View className="flex-1 bg-gray-50" />;

interface AppLayoutProps {
  initialTab?: string;
}

type Screen =
  | "home"
  | "applications"
  | "job-list"
  | "notifications"
  | "profile"
  | "jobDetail"
  | "saved-jobs";

const AppLayout: React.FC<AppLayoutProps> = ({ initialTab = "home" }) => {
  const [activeScreen, setActiveScreen] = useState<Screen>(
    initialTab as Screen
  );
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const handleTabPress = (tabId: string) => {
    setActiveScreen(tabId as Screen);
  };

  const handleJobPress = (job: Job) => {
    console.log("Job pressed:", job.title);
    setSelectedJobId(job.id);
    setActiveScreen("jobDetail");
  };

  const handleBackToHome = () => {
    setActiveScreen("home");
    setSelectedJobId(null);
  };

  const handleNotificationPress = () => {
    console.log("Notification pressed");
    setActiveScreen("notifications");
  };

  const handleSeeAllPress = () => {
    console.log("See all pressed");
    setActiveScreen("search");
  };

  const handleJobApply = (job: Job) => {
    console.log("Apply for job:", job.title);
    // TODO: Implement job application logic
  };

  const renderCurrentScreen = () => {
    switch (activeScreen) {
      case "home":
        return (
          <HomePage
            onJobPress={handleJobPress}
            onNotificationPress={handleNotificationPress}
            onSeeAllPress={handleSeeAllPress}
          />
        );
      case "jobDetail":
        if (!selectedJobId) {
          return (
            <HomePage
              onJobPress={handleJobPress}
              onNotificationPress={handleNotificationPress}
              onSeeAllPress={handleSeeAllPress}
            />
          );
        }
        return (
          <JobDetailScreen
            jobId={selectedJobId}
            onBack={handleBackToHome}
            onApply={handleJobApply}
          />
        );
      case "applications":
        return <ApplicationsScreen />;
      case "saved-jobs":
        return <SavedJobsScreen />;
      case "job-list":
        return <JobListScreen />;
      case "notifications":
        return <NotificationsScreen />;
      case "profile":
        return <ProfileScreen />;
      case "debug":
        return __DEV__ ? (
          <DebugScreen />
        ) : (
          <HomePage
            onJobPress={handleJobPress}
            onNotificationPress={handleNotificationPress}
            onSeeAllPress={handleSeeAllPress}
          />
        );
      default:
        return (
          <HomePage
            onJobPress={handleJobPress}
            onNotificationPress={handleNotificationPress}
            onSeeAllPress={handleSeeAllPress}
          />
        );
    }
  };

  // Hide bottom navigation on job detail screen
  const showBottomNavigation = activeScreen !== "jobDetail";

  return (
    <View className="flex-1">
      {renderCurrentScreen()}
      {showBottomNavigation && (
        <BottomNavigation
          activeTab={activeScreen === "jobDetail" ? "home" : activeScreen}
          onTabPress={handleTabPress}
        />
      )}
    </View>
  );
};

export default AppLayout;
