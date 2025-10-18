import { Redirect } from "expo-router";
import "../global.css";

export default function IndexScreen() {
  // Redirect to the tabs layout which will handle authentication
  return <Redirect href="/(tabs)" />;
}
