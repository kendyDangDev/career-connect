// import React from 'react';
// import { View, TouchableOpacity, Text, Platform, StyleSheet } from 'react-native';
// import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// const SimpleTabBarDebug: React.FC<BottomTabBarProps> = ({ 
//   state, 
//   descriptors, 
//   navigation 
// }) => {
//   const insets = useSafeAreaInsets();
  
//   console.log('SimpleTabBarDebug rendering', {
//     routesCount: state.routes.length,
//     currentIndex: state.index,
//     platform: Platform.OS,
//     insets
//   });

//   return (
//     <View 
//       style={[
//         styles.container,
//         { 
//           paddingBottom: Platform.OS === 'ios' ? insets.bottom : 10,
//           position: 'absolute',
//           bottom: 0,
//           left: 0,
//           right: 0,
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
//               onPress={onPress}
//               style={styles.tab}
//             >
//               <View style={[
//                 styles.iconContainer,
//                 isFocused && styles.iconContainerFocused
//               ]}>
//                 <Text style={styles.iconPlaceholder}>
//                   {label.substring(0, 2).toUpperCase()}
//                 </Text>
//               </View>
//               <Text 
//                 style={[
//                   styles.label,
//                   isFocused ? styles.labelFocused : styles.labelUnfocused
//                 ]}
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
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 8,
//     minHeight: 60,
//   },
//   tabBar: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//   },
//   tab: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 8,
//     minHeight: 50,
//   },
//   iconContainer: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: '#f3f4f6',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   iconContainerFocused: {
//     backgroundColor: '#dbeafe',
//   },
//   iconPlaceholder: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#374151',
//   },
//   label: {
//     fontSize: 11,
//     marginTop: 4,
//   },
//   labelFocused: {
//     color: '#3B82F6',
//     fontWeight: '600',
//   },
//   labelUnfocused: {
//     color: '#6B7280',
//     fontWeight: '400',
//   },
// });

// export default SimpleTabBarDebug;