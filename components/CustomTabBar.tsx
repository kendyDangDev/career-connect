// import React from "react";
// import {
//   View,
//   TouchableOpacity,
//   Text,
//   Dimensions,
//   Platform,
// } from "react-native";
// import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
// import Animated, {
//   useAnimatedStyle,
//   withSpring,
//   withTiming,
//   interpolate,
//   Extrapolate,
// } from "react-native-reanimated";
// import {
//   Home,
//   Briefcase,
//   FileText,
//   Bell,
//   User,
//   Book,
// } from "lucide-react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// const AnimatedTouchableOpacity =
//   Animated.createAnimatedComponent(TouchableOpacity);

// interface TabIconProps {
//   name: string;
//   focused: boolean;
//   color: string;
// }

// const TabIcon: React.FC<TabIconProps> = ({ name, focused, color }) => {
//   const iconSize = 24;

//   const iconMap: Record<string, React.ComponentType<any>> = {
//     index: Home,
//     jobs: Briefcase,
//     "saved-jobs": FileText,
//     notifications: Bell,
//     profile: User,
//     "create-cv": Book,
//   };

//   const Icon = iconMap[name] || Home;

//   return <Icon size={iconSize} color={color} strokeWidth={focused ? 2.5 : 2} />;
// };

// const CustomTabBar: React.FC<BottomTabBarProps> = ({
//   state,
//   descriptors,
//   navigation,
// }) => {
//   const insets = useSafeAreaInsets();
//   const { width } = Dimensions.get("window");

//   // Filter out hidden tabs first
//   const visibleRoutes = state.routes.filter((route) => {
//     const { options } = descriptors[route.key];
//     return options.href !== null;
//   });

//   const tabWidth = width / visibleRoutes.length;

//   return (
//     <View
//       style={{
//         backgroundColor: "white",
//         borderTopWidth: 1,
//         borderTopColor: "#E5E7EB",
//         paddingBottom: insets.bottom,
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: -2 },
//         shadowOpacity: 0.05,
//         shadowRadius: 8,
//         elevation: 10,
//       }}
//     >
//       <View style={{ flexDirection: "row", height: 60 }}>
//         {state.routes.map((route, index) => {
//           const { options } = descriptors[route.key];
//           const label =
//             options.tabBarLabel !== undefined
//               ? options.tabBarLabel
//               : options.title !== undefined
//                 ? options.title
//                 : route.name;

//           // Hide tabs with href: null
//           if (options.href === null) {
//             return null;
//           }

//           const isFocused = state.index === index;

//           const onPress = () => {
//             const event = navigation.emit({
//               type: "tabPress",
//               target: route.key,
//               canPreventDefault: true,
//             });

//             if (!isFocused && !event.defaultPrevented) {
//               navigation.navigate(route.name);
//             }
//           };

//           const onLongPress = () => {
//             navigation.emit({
//               type: "tabLongPress",
//               target: route.key,
//             });
//           };

//           const animatedIconStyle = useAnimatedStyle(() => {
//             const translateY = withSpring(isFocused ? -15 : 0, {
//               damping: 15,
//               stiffness: 150,
//             });

//             const scale = withSpring(isFocused ? 1.15 : 1, {
//               damping: 15,
//               stiffness: 200,
//             });

//             return {
//               transform: [{ translateY }, { scale }],
//             };
//           });

//           const animatedBackgroundStyle = useAnimatedStyle(() => {
//             const opacity = withTiming(isFocused ? 1 : 0, {
//               duration: 200,
//             });

//             const scale = withSpring(isFocused ? 1 : 0.8, {
//               damping: 15,
//               stiffness: 200,
//             });

//             return {
//               opacity,
//               transform: [{ scale }],
//             };
//           });

//           const animatedLabelStyle = useAnimatedStyle(() => {
//             // Hide label when focused
//             const opacity = withTiming(isFocused ? 0 : 1, {
//               duration: 200,
//             });

//             return {
//               opacity,
//             };
//           });

//           return (
//             <TouchableOpacity
//               key={route.key}
//               accessibilityRole="button"
//               accessibilityState={isFocused ? { selected: true } : {}}
//               accessibilityLabel={options.tabBarAccessibilityLabel}
//               testID={options.tabBarTestID}
//               onPress={onPress}
//               onLongPress={onLongPress}
//               style={{
//                 flex: 1,
//                 alignItems: "center",
//                 justifyContent: "center",
//                 paddingVertical: 4,
//               }}
//             >
//               <View
//                 style={{
//                   alignItems: "center",
//                   justifyContent: "center",
//                   height: 50,
//                   width: "100%",
//                 }}
//               >
//                 {/* Background circle for active tab */}
//                 <Animated.View
//                   style={[
//                     {
//                       position: "absolute",
//                       width: 48,
//                       height: 48,
//                       borderRadius: 24,
//                       backgroundColor: "#2563EB",
//                       top: isFocused ? -5 : 12,
//                     },
//                     animatedBackgroundStyle,
//                   ]}
//                 />

//                 {/* Icon */}
//                 <Animated.View style={[animatedIconStyle, { zIndex: 1 }]}>
//                   <TabIcon
//                     name={route.name}
//                     focused={isFocused}
//                     color={isFocused ? "white" : "#6B7280"}
//                   />
//                 </Animated.View>

//                 {/* Label - Hidden when focused */}
//                 {!isFocused && (
//                   <Animated.Text
//                     style={[
//                       {
//                         fontSize: 10,
//                         marginTop: 2,
//                         color: "#6B7280",
//                         fontWeight: "500",
//                         position: "absolute",
//                         bottom: 0,
//                       },
//                       animatedLabelStyle,
//                     ]}
//                     numberOfLines={1}
//                   >
//                     {label as string}
//                   </Animated.Text>
//                 )}
//               </View>
//             </TouchableOpacity>
//           );
//         })}
//       </View>
//     </View>
//   );
// };

// export default CustomTabBar;
