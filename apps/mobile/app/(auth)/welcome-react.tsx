import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>This is a placeholder welcome screen</Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push("/(auth)/login")}
      >
        <Text style={styles.buttonText}>Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Commented old code below
// export default function WelcomeScreenOld() {
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [isAnimating, setIsAnimating] = useState(false);

//   const slides = [
//     {
//       id: 1,
//       title: "Chào mừng đến với CareerFind",
//       subtitle: "Nền tảng tìm việc làm hàng đầu Việt Nam",
//       description:
//         "Kết nối bạn với hàng ngàn cơ hội việc làm từ các công ty uy tín. Tìm kiếm công việc mơ ước chỉ với vài thao tác đơn giản.",
//       icon: <Briefcase className="w-16 h-16 text-white" />,
//       gradient: "from-blue-600 to-indigo-600",
//       bgGradient: "from-blue-50 to-indigo-50",
//     },
//     {
//       id: 2,
//       title: "Tìm kiếm thông minh",
//       subtitle: "AI giúp tìm việc phù hợp nhất",
//       description:
//         "Hệ thống AI thông minh phân tích kỹ năng và kinh nghiệm của bạn để gợi ý những công việc phù hợp nhất với hồ sơ cá nhân.",
//       icon: <Search className="w-16 h-16 text-white" />,
//       gradient: "from-purple-600 to-pink-600",
//       bgGradient: "from-purple-50 to-pink-50",
//     },
//     {
//       id: 3,
//       title: "Kết nối doanh nghiệp",
//       subtitle: "Trực tiếp với nhà tuyển dụng",
//       description:
//         "Chat trực tiếp với HR, nhận feedback nhanh chóng và cập nhật tiến trình tuyển dụng theo thời gian thực.",
//       icon: <Users className="w-16 h-16 text-white" />,
//       gradient: "from-green-600 to-emerald-600",
//       bgGradient: "from-green-50 to-emerald-50",
//     },
//   ];

//   const features = [
//     {
//       icon: <Star className="w-6 h-6" />,
//       title: "10K+ Việc làm",
//       desc: "Cập nhật hàng ngày",
//     },
//     {
//       icon: <Users className="w-6 h-6" />,
//       title: "5K+ Công ty",
//       desc: "Đối tác tin cậy",
//     },
//     {
//       icon: <Award className="w-6 h-6" />,
//       title: "95% Thành công",
//       desc: "Tỷ lệ tìm được việc",
//     },
//     {
//       icon: <Clock className="w-6 h-6" />,
//       title: "Hỗ trợ 24/7",
//       desc: "Luôn sẵn sàng giúp đỡ",
//     },
//   ];

//   useEffect(() => {
//     const timer = setInterval(() => {
//       handleNextSlide();
//     }, 4000);

//     return () => clearInterval(timer);
//   }, [currentSlide]);

//   const handleNextSlide = () => {
//     if (!isAnimating) {
//       setIsAnimating(true);
//       setCurrentSlide((prev) => (prev + 1) % slides.length);
//       setTimeout(() => setIsAnimating(false), 300);
//     }
//   };

//   const handlePrevSlide = () => {
//     if (!isAnimating) {
//       setIsAnimating(true);
//       setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
//       setTimeout(() => setIsAnimating(false), 300);
//     }
//   };

//   const handleGetStarted = () => {
//     console.log("Getting started...");
//     // Navigate to registration/login
//   };

//   const handleSkip = () => {
//     console.log("Skipping welcome...");
//     // Navigate to main app
//   };

//   const currentSlideData = slides[currentSlide];

//   return (
//     <div
//       className={`min-h-screen bg-gradient-to-br ${currentSlideData.bgGradient} transition-all duration-700 ease-in-out`}
//     >
//       {/* Skip button */}
//       <div className="absolute top-6 right-6 z-10">
//         <button
//           onClick={handleSkip}
//           className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
//         >
//           Bỏ qua
//         </button>
//       </div>

//       <div className="flex flex-col min-h-screen">
//         {/* Main Content */}
//         <div className="flex-1 flex items-center justify-center p-6">
//           <div className="w-full max-w-4xl mx-auto">
//             <div className="text-center space-y-8">
//               {/* Icon with gradient background */}
//               <div className="flex justify-center mb-8">
//                 <div
//                   className={`w-32 h-32 bg-gradient-to-br ${currentSlideData.gradient} rounded-3xl flex items-center justify-center shadow-2xl transform transition-all duration-500 ${isAnimating ? "scale-110 rotate-6" : "scale-100"}`}
//                 >
//                   {currentSlideData.icon}
//                 </div>
//               </div>

//               {/* Text Content */}
//               <div
//                 className={`space-y-6 transition-all duration-500 ${isAnimating ? "opacity-0 transform translate-y-4" : "opacity-100 transform translate-y-0"}`}
//               >
//                 <div>
//                   <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
//                     {currentSlideData.title}
//                   </h1>
//                   <p
//                     className={`text-xl font-semibold bg-gradient-to-r ${currentSlideData.gradient} bg-clip-text text-transparent mb-6`}
//                   >
//                     {currentSlideData.subtitle}
//                   </p>
//                 </div>

//                 <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
//                   {currentSlideData.description}
//                 </p>
//               </div>

//               {/* Features Grid (only on first slide) */}
//               {currentSlide === 0 && (
//                 <div
//                   className={`grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 transition-all duration-500 ${isAnimating ? "opacity-0" : "opacity-100"}`}
//                 >
//                   {features.map((feature, index) => (
//                     <div
//                       key={index}
//                       className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
//                     >
//                       <div
//                         className={`w-12 h-12 bg-gradient-to-br ${currentSlideData.gradient} rounded-lg flex items-center justify-center mb-4 mx-auto text-white`}
//                       >
//                         {feature.icon}
//                       </div>
//                       <h3 className="font-bold text-gray-800 text-sm mb-2">
//                         {feature.title}
//                       </h3>
//                       <p className="text-xs text-gray-600">{feature.desc}</p>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* Success Stories (slide 2) */}
//               {currentSlide === 1 && (
//                 <div
//                   className={`bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-2xl mx-auto transition-all duration-500 ${isAnimating ? "opacity-0" : "opacity-100"}`}
//                 >
//                   <div className="flex items-center justify-center space-x-1 mb-4">
//                     {[...Array(5)].map((_, i) => (
//                       <Star
//                         key={i}
//                         className="w-5 h-5 fill-yellow-400 text-yellow-400"
//                       />
//                     ))}
//                   </div>
//                   <p className="text-gray-700 italic mb-6">
//                     "AI của CareerFind đã giúp tôi tìm được vị trí Senior
//                     Developer phù hợp hoàn hảo với kỹ năng. Chỉ sau 1 tuần, tôi
//                     đã có 3 lời mời phỏng vấn!"
//                   </p>
//                   <div className="flex items-center justify-center space-x-3">
//                     <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
//                       <span className="text-white font-bold">LH</span>
//                     </div>
//                     <div className="text-left">
//                       <p className="font-semibold text-gray-800">Lê Hoàng</p>
//                       <p className="text-sm text-gray-600">
//                         Senior Developer tại TechCorp
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Benefits (slide 3) */}
//               {currentSlide === 2 && (
//                 <div
//                   className={`grid md:grid-cols-2 gap-6 max-w-3xl mx-auto transition-all duration-500 ${isAnimating ? "opacity-0" : "opacity-100"}`}
//                 >
//                   {[
//                     {
//                       icon: <CheckCircle className="w-6 h-6" />,
//                       title: "Ứng tuyển nhanh chóng",
//                       desc: "1-click apply cho mọi vị trí",
//                     },
//                     {
//                       icon: <MapPin className="w-6 h-6" />,
//                       title: "Việc làm gần nhà",
//                       desc: "Tìm theo vị trí địa lý",
//                     },
//                     {
//                       icon: <TrendingUp className="w-6 h-6" />,
//                       title: "Theo dõi tiến trình",
//                       desc: "Cập nhật real-time",
//                     },
//                     {
//                       icon: <Award className="w-6 h-6" />,
//                       title: "Hồ sơ chuyên nghiệp",
//                       desc: "Template được thiết kế sẵn",
//                     },
//                   ].map((benefit, index) => (
//                     <div
//                       key={index}
//                       className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-left"
//                     >
//                       <div
//                         className={`w-12 h-12 bg-gradient-to-br ${currentSlideData.gradient} rounded-lg flex items-center justify-center mb-4 text-white`}
//                       >
//                         {benefit.icon}
//                       </div>
//                       <h3 className="font-bold text-gray-800 mb-2">
//                         {benefit.title}
//                       </h3>
//                       <p className="text-gray-600 text-sm">{benefit.desc}</p>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Navigation */}
//         <div className="pb-8 px-6">
//           <div className="flex items-center justify-between max-w-4xl mx-auto">
//             {/* Slide indicators */}
//             <div className="flex space-x-3">
//               {slides.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => !isAnimating && setCurrentSlide(index)}
//                   className={`w-3 h-3 rounded-full transition-all duration-300 ${
//                     index === currentSlide
//                       ? `bg-gradient-to-r ${currentSlideData.gradient} scale-125`
//                       : "bg-gray-300 hover:bg-gray-400"
//                   }`}
//                 />
//               ))}
//             </div>

//             {/* Navigation arrows */}
//             <div className="flex items-center space-x-4">
//               <button
//                 onClick={handlePrevSlide}
//                 disabled={isAnimating}
//                 className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl disabled:opacity-50 transition-all duration-200 hover:scale-110"
//               >
//                 <ChevronLeft className="w-5 h-5 text-gray-600" />
//               </button>

//               {currentSlide === slides.length - 1 ? (
//                 <button
//                   onClick={handleGetStarted}
//                   className={`px-8 py-4 bg-gradient-to-r ${currentSlideData.gradient} text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2`}
//                 >
//                   <span>Bắt đầu ngay</span>
//                   <ArrowRight className="w-5 h-5" />
//                 </button>
//               ) : (
//                 <button
//                   onClick={handleNextSlide}
//                   disabled={isAnimating}
//                   className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl disabled:opacity-50 transition-all duration-200 hover:scale-110"
//                 >
//                   <ChevronRight className="w-5 h-5 text-gray-600" />
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Background decorations */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div
//           className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br ${currentSlideData.gradient} opacity-10 rounded-full blur-3xl transition-all duration-700`}
//         ></div>
//         <div
//           className={`absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr ${currentSlideData.gradient} opacity-10 rounded-full blur-3xl transition-all duration-700`}
//         ></div>
//       </div>
//     </div>
//   );
// }
