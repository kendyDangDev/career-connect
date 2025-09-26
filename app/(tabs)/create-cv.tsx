// import { LinearGradient } from 'expo-linear-gradient';
// import { useRouter } from 'expo-router';
// import {
//   Award,
//   Briefcase,
//   ChevronRight,
//   Clock,
//   Download,
//   FileEdit,
//   FileText,
//   GraduationCap,
//   Plus,
//   Sparkles,
//   Star,
//   TrendingUp,
//   Upload
// } from 'lucide-react-native';
// import { useState } from 'react';
// import { Alert, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// const { width } = Dimensions.get('window');

// export default function CreateCVScreen() {
//   const router = useRouter();
//   const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

//   const savedCVs = [
//     {
//       id: '1',
//       title: 'CV Thực Tập Sinh NodeJS',
//       updatedAt: '2 ngày trước',
//       completeness: 85,
//       views: 23,
//       downloads: 5,
//       icon: '📑',
//     },
//     {
//       id: '2',
//       title: 'CV React Native Developer',
//       updatedAt: '1 tuần trước',
//       completeness: 92,
//       views: 45,
//       downloads: 12,
//       icon: '📄',
//     },
//     {
//       id: '3',
//       title: 'CV Frontend Engineer',
//       updatedAt: '2 tuần trước',
//       completeness: 78,
//       views: 18,
//       downloads: 3,
//       icon: '📋',
//     },
//   ];

//   const templates = [
//     {
//       id: '1',
//       name: 'Professional',
//       description: 'Clean & Modern',
//       gradient: ['#3b82f6', '#2563eb'],
//       icon: <Briefcase size={24} color="white" />,
//       badge: 'Popular',
//     },
//     {
//       id: '2',
//       name: 'Creative',
//       description: 'Unique Design',
//       gradient: ['#a855f7', '#9333ea'],
//       icon: <Sparkles size={24} color="white" />,
//       badge: 'New',
//     },
//     {
//       id: '3',
//       name: 'Academic',
//       description: 'For Students',
//       gradient: ['#10b981', '#059669'],
//       icon: <GraduationCap size={24} color="white" />,
//     },
//     {
//       id: '4',
//       name: 'Executive',
//       description: 'Senior Level',
//       gradient: ['#f59e0b', '#d97706'],
//       icon: <Award size={24} color="white" />,
//       badge: 'Premium',
//     },
//   ];

//   const features = [
//     { icon: <FileEdit size={20} color="#3b82f6" />, text: 'Chỉnh sửa dễ dàng' },
//     { icon: <Download size={20} color="#10b981" />, text: 'Xuất PDF chất lượng' },
//     { icon: <TrendingUp size={20} color="#f59e0b" />, text: 'Tối ưu ATS' },
//     { icon: <Upload size={20} color="#a855f7" />, text: 'Lưu trữ đám mây' },
//   ];

//   return (
//     <SafeAreaView className="flex-1 bg-gray-50">
//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Hero Section with Gradient */}
//         <LinearGradient
//           colors={['#3b82f6', '#6366f1', '#a855f7']}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//           className="px-6 pt-8 pb-12"
//         >
//           <View className="flex-row items-center justify-between mb-4">
//             <View className="flex-1">
//               <Text className="text-white text-3xl font-bold mb-2">
//                 CV Chuyên Nghiệp
//               </Text>
//               <Text className="text-white/90 text-base">
//                 Tạo CV ấn tượng trong vài phút
//               </Text>
//             </View>
//             <View className="bg-white/20 rounded-2xl p-4">
//               <FileText size={40} color="white" />
//             </View>
//           </View>

//           {/* Quick Stats */}
//           <View className="flex-row mt-6">
//             <View className="flex-1 bg-white/20 rounded-xl p-3 mr-2">
//               <Text className="text-white/80 text-xs">CV đã tạo</Text>
//               <Text className="text-white text-xl font-bold">3</Text>
//             </View>
//             <View className="flex-1 bg-white/20 rounded-xl p-3 mx-1">
//               <Text className="text-white/80 text-xs">Lượt xem</Text>
//               <Text className="text-white text-xl font-bold">86</Text>
//             </View>
//             <View className="flex-1 bg-white/20 rounded-xl p-3 ml-2">
//               <Text className="text-white/80 text-xs">Tải xuống</Text>
//               <Text className="text-white text-xl font-bold">20</Text>
//             </View>
//           </View>
//         </LinearGradient>

//         {/* Create New CV Card */}
//         <View className="px-5 -mt-6">
//           <TouchableOpacity
//             onPress={() => router.push('/cv/template-gallery')}
//             className="bg-white rounded-2xl shadow-lg overflow-hidden"
//             activeOpacity={0.9}
//           >
//             <LinearGradient
//               colors={['#dbeafe', '#ede9fe']}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//               className="p-5"
//             >
//               <View className="flex-row items-center justify-between">
//                 <View className="flex-1">
//                   <View className="bg-primary-500 w-12 h-12 rounded-full items-center justify-center mb-3">
//                     <Plus size={24} color="white" />
//                   </View>
//                   <Text className="text-gray-900 text-lg font-bold mb-1">
//                     Tạo CV Mới
//                   </Text>
//                   <Text className="text-gray-600 text-sm">
//                     Bắt đầu với mẫu chuyên nghiệp
//                   </Text>
//                 </View>
//                 <ChevronRight size={24} color="#6b7280" />
//               </View>
              
//               {/* Features */}
//               <View className="flex-row flex-wrap mt-4 -mx-1">
//                 {features.map((feature, index) => (
//                   <View key={index} className="flex-row items-center bg-white/70 rounded-full px-3 py-1.5 m-1">
//                     {feature.icon}
//                     <Text className="text-xs text-gray-700 ml-1.5">{feature.text}</Text>
//                   </View>
//                 ))}
//               </View>
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>

//         {/* Saved CVs Section */}
//         <View className="px-5 mt-8">
//           <View className="flex-row items-center justify-between mb-4">
//             <Text className="text-gray-900 text-xl font-bold">CV Đã Lưu</Text>
//             <TouchableOpacity>
//               <Text className="text-primary-500 text-sm font-medium">Xem tất cả</Text>
//             </TouchableOpacity>
//           </View>

//           {savedCVs.map((cv) => (
//             <TouchableOpacity
//               key={cv.id}
//               className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
//               activeOpacity={0.7}
//               onPress={() => {
//                 Alert.alert(
//                   'Mở CV',
//                   'Chức năng này sẽ được cập nhật sau khi kết nối với backend.',
//                   [{ text: 'OK' }]
//                 );
//               }}
//             >
//               <View className="flex-row items-start">
//                 <View className="bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl p-3 mr-3">
//                   <Text className="text-2xl">{cv.icon}</Text>
//                 </View>
                
//                 <View className="flex-1">
//                   <Text className="text-gray-900 font-semibold text-base mb-1">
//                     {cv.title}
//                   </Text>
                  
//                   <View className="flex-row items-center mb-2">
//                     <Clock size={12} color="#9ca3af" />
//                     <Text className="text-gray-500 text-xs ml-1">{cv.updatedAt}</Text>
//                   </View>

//                   {/* Progress Bar */}
//                   <View className="mb-2">
//                     <View className="flex-row justify-between items-center mb-1">
//                       <Text className="text-xs text-gray-600">Hoàn thiện</Text>
//                       <Text className="text-xs text-primary-600 font-semibold">{cv.completeness}%</Text>
//                     </View>
//                     <View className="bg-gray-200 rounded-full h-1.5">
//                       <View 
//                         className="bg-primary-500 h-1.5 rounded-full"
//                         style={{ width: `${cv.completeness}%` }}
//                       />
//                     </View>
//                   </View>

//                   {/* Stats */}
//                   <View className="flex-row">
//                     <View className="flex-row items-center mr-4">
//                       <View className="bg-blue-50 rounded-full p-1 mr-1">
//                         <Star size={10} color="#3b82f6" />
//                       </View>
//                       <Text className="text-xs text-gray-600">{cv.views} lượt xem</Text>
//                     </View>
//                     <View className="flex-row items-center">
//                       <View className="bg-green-50 rounded-full p-1 mr-1">
//                         <Download size={10} color="#10b981" />
//                       </View>
//                       <Text className="text-xs text-gray-600">{cv.downloads} tải về</Text>
//                     </View>
//                   </View>
//                 </View>

//                 <ChevronRight size={20} color="#9ca3af" />
//               </View>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* CV Templates Section */}
//         <View className="mt-8">
//           <View className="px-5">
//             <View className="flex-row items-center justify-between mb-4">
//               <Text className="text-gray-900 text-xl font-bold">Mẫu CV Nổi Bật</Text>
//               <TouchableOpacity onPress={() => router.push('/cv/template-gallery')}>
//                 <Text className="text-primary-500 text-sm font-medium">Xem tất cả</Text>
//               </TouchableOpacity>
//             </View>
//           </View>

//           <ScrollView 
//             horizontal 
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={{ 
//               paddingHorizontal: 20,
//               paddingRight: 40 // Extra padding for last item
//             }}
//             decelerationRate={0.8}
//             snapToInterval={width > 768 ? width * 0.35 + 16 : width * 0.75 + 16} // Responsive snap
//             snapToAlignment="start"
//           >
//             {templates.map((template, index) => {
//               // Responsive card width based on screen size
//               const getCardWidth = () => {
//                 if (width > 768) {
//                   // Tablet/Desktop: 3 cards visible
//                   return width * 0.35;
//                 } else if (width > 400) {
//                   // Large phone: 1.3 cards visible
//                   return width * 0.75;
//                 } else {
//                   // Small phone: 1 card + peek
//                   return width * 0.8;
//                 }
//               };

//               const cardWidth = getCardWidth();
              
//               return (
//                 <TouchableOpacity
//                   key={template.id}
//                   className="mr-4"
//                   style={{ width: cardWidth }}
//                   onPress={() => {
//                     setSelectedTemplate(template.id);
//                     router.push('/cv/template-gallery');
//                   }}
//                   activeOpacity={0.9}
//                 >
//                   <View className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
//                     <LinearGradient
//                       colors={template.gradient}
//                       start={{ x: 0, y: 0 }}
//                       end={{ x: 1, y: 1 }}
//                       style={{ 
//                         height: width > 768 ? 120 : 140, // Responsive height
//                         padding: 16,
//                         alignItems: 'center',
//                         justifyContent: 'center'
//                       }}
//                     >
//                       {template.badge && (
//                         <View className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-full">
//                           <Text 
//                             className="text-xs font-semibold" 
//                             style={{ color: template.gradient[0] }}
//                           >
//                             {template.badge}
//                           </Text>
//                         </View>
//                       )}
//                       <View className="bg-white/20 rounded-2xl p-3">
//                         {template.icon}
//                       </View>
//                     </LinearGradient>
                    
//                     <View style={{ padding: width > 768 ? 12 : 16 }}>
//                       <Text 
//                         className="text-gray-900 font-bold mb-1"
//                         style={{ 
//                           fontSize: width > 768 ? 14 : 16,
//                           lineHeight: width > 768 ? 18 : 20
//                         }}
//                         numberOfLines={1}
//                       >
//                         {template.name}
//                       </Text>
//                       <Text 
//                         className="text-gray-500"
//                         style={{ 
//                           fontSize: width > 768 ? 12 : 14,
//                           lineHeight: width > 768 ? 16 : 18
//                         }}
//                         numberOfLines={2}
//                       >
//                         {template.description}
//                       </Text>
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               );
//             })}
            
//             {/* Add more templates indicator */}
//             <TouchableOpacity 
//               className="items-center justify-center"
//               style={{ 
//                 width: width > 768 ? width * 0.25 : width * 0.6,
//                 minHeight: width > 768 ? 180 : 200
//               }}
//               onPress={() => router.push('/cv/template-gallery')}
//               activeOpacity={0.8}
//             >
//               <View className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl items-center justify-center flex-1 w-full">
//                 <View className="bg-gray-100 rounded-full p-4 mb-3">
//                   <Plus size={24} color="#6B7280" />
//                 </View>
//                 <Text className="text-gray-600 font-medium text-center px-4">
//                   Xem thêm{"\n"}mẫu CV
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           </ScrollView>
//         </View>

//         {/* Tips Section */}
//         <View className="px-5 mt-8 mb-6">
//           <View className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5">
//             <View className="flex-row items-center mb-3">
//               <View className="bg-primary-500 rounded-full p-2 mr-3">
//                 <Sparkles size={20} color="white" />
//               </View>
//               <Text className="text-gray-900 font-bold text-lg">Mẹo tạo CV</Text>
//             </View>
            
//             <Text className="text-gray-700 text-sm leading-5 mb-3">
//               • Sử dụng từ khóa phù hợp với vị trí ứng tuyển{"\n"}
//               • Giới hạn CV trong 1-2 trang{"\n"}
//               • Định dạng rõ ràng, dễ đọc{"\n"}
//               • Cập nhật thường xuyên
//             </Text>
            
//             <TouchableOpacity className="bg-primary-500 rounded-xl py-2 items-center">
//               <Text className="text-white font-semibold">Xem thêm mẹo</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
