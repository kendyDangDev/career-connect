// import React from 'react';
// import { View, TouchableOpacity, Text, Platform, StyleSheet } from 'react-native';
// import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
// import { Home, Briefcase, FileText, Bell, User } from 'lucide-react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// interface TabIconProps {
//   name: string;
//   focused: boolean;
// }

// const TabIcon: React.FC<TabIconProps> = ({ name, focused }) => {
//   const iconSize = focused ? 26 : 22;
//   const color = focused ? '#3B82F6' : '#6B7280';
  
//   const iconMap: Record<string, React.ComponentType<any>> = {
//     'index': Home,
//     'jobs': Briefcase,
//     'saved-jobs': FileText,
//     'notifications': Bell,
//     'profile': User,
//   };
  
//   const Icon = iconMap[name] || Home;
  
//   return (
//     <Icon 
//       size={iconSize} 
//       color={color} 
//       strokeWidth={focused ? 2.5 : 2}
//     />
//   );
// };

// const SimpleTabBar: React.FC<BottomTabBarProps> = ({ 
//   state, 
//   descriptors, 
//   navigation 
// }) => {
//   const insets = useSafeAreaInsets();

//   return (
//     <View
//       style={[
//         styles.container,
//         {
//           paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
//         }
//       ]}
//     >
//       <View style={styles.tabBar}>
//         {state.routes.map((route, index) => {
//           const { options } = descriptors[route.key];
//           const label = options.title || route.name;

//           // Skip hidden tabs
//           if (options.href === null) {
//             return null;
//           }

//           const isFocused = state.index === index;

//           const onPress = () => {
//             const event = navigation.emit({
//               type: 'tabPress',
//               target: route.key,
//               canPreventDefault: true,
//             });

//             if (!isFocused && !event.defaultPrevented) {
//               navigation.navigate(route.name);
//             }
//           };

//           return (
//             <TouchableOpacity
//               key={route.key}
//               accessibilityRole="button"
//               accessibilityState={isFocused ? { selected: true } : {}}
//               onPress={onPress}
//               style={styles.tab}
//               activeOpacity={0.8}
//             >
//               <TabIcon name={route.name} focused={isFocused} />
//               <Text
//                 style={[
//                   styles.label,
//                   isFocused ? styles.labelFocused : styles.labelUnfocused
//                 ]}
//                 numberOfLines={1}
//               >
//                 {label}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#ffffff',
//     borderTopWidth: 1,
//     borderTopColor: '#e5e7eb',
//     paddingTop: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 5,
//   },
//   tabBar: {
//     flexDirection: 'row',
//   },
//   tab: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 8,
//   },
//   label: {
//     fontSize: 10,
//     marginTop: 4,
//   },
//   labelFocused: {
//     color: '#3B82F6',
//     fontWeight: '600',
//   },
//   labelUnfocused: {
//     color: '#6B7280',
//     fontWeight: '500',
//   },
// });

// export default SimpleTabBar;
