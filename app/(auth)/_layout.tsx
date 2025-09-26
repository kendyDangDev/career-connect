import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  // console.log('[AuthLayout] Rendering auth layout');
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {/* <Stack.Screen
        name="welcome"
        options={{
          title: 'Welcome',
        }}
      /> */}
      <Stack.Screen
        name="login"
        options={{
          title: "Đăng nhập",
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "Đăng ký",
        }}
      />
      <Stack.Screen
        name="verify-email"
        options={{
          title: "Xác thực email",
        }}
      />
      {/* <Stack.Screen
        name="forgot-password"
        options={{
          title: "Quên mật khẩu",
        }}
      /> */}
    </Stack>
  );
}
