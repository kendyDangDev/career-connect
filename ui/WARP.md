# UI Development Rules for Career Connect App

## Tech Stack Requirements

When developing UI components for this React Native application, ALWAYS follow these technology requirements:

### Primary UI Framework
- **GlueStack UI**: Use as the primary component library
  - Import components from `@gluestack-ui/themed`
  - Follow GlueStack's accessibility guidelines
  - Use built-in theming system

### Styling Approach
- **NativeWind + Tailwind CSS**: For custom styling
  - Use utility classes for layout and spacing
  - Combine with GlueStack components using `className` prop
  - Follow mobile-first approach

### Animation Requirements
- **React Native Reanimated**: For all animations
  - Use `useSharedValue`, `useAnimatedStyle` for smooth animations
  - Implement gesture-driven interactions with `react-native-gesture-handler`
  - Target 60 FPS performance

## Component Development Rules

### 1. File Structure
```typescript
// Component file structure
components/
├── common/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.types.ts
│   │   └── index.ts
│   └── ...
└── features/
    ├── JobCard/
    │   ├── JobCard.tsx
    │   ├── JobCard.types.ts
    │   └── index.ts
    └── ...
```

### 2. Component Template
```typescript
// Always use this template for new components
import React from 'react';
import { View } from 'react-native';
import { styled } from '@gluestack-style/react';
import { Text } from '@gluestack-ui/themed';
import Animated from 'react-native-reanimated';

interface ComponentNameProps {
  // Define props with TypeScript
}

export const ComponentName: React.FC<ComponentNameProps> = ({ ...props }) => {
  // Component logic
  
  return (
    <View className="flex-1">
      {/* Component JSX */}
    </View>
  );
};
```

### 3. Styling Rules

#### GlueStack Components
```typescript
// Prefer GlueStack components with built-in styling
import { Button, ButtonText } from '@gluestack-ui/themed';

<Button size="md" variant="solid" action="primary">
  <ButtonText>Click me</ButtonText>
</Button>
```

#### Custom Styling with NativeWind
```typescript
// Use Tailwind utility classes for custom layouts
<View className="flex-1 items-center justify-center p-4">
  <Text className="text-lg font-bold text-gray-800">
    Hello World
  </Text>
</View>
```

#### Responsive Design
```typescript
// Always consider different screen sizes
<View className="w-full px-4 md:px-8 lg:px-16">
  <Text className="text-base md:text-lg lg:text-xl">
    Responsive Text
  </Text>
</View>
```

### 4. Animation Patterns

#### Basic Animation
```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const AnimatedComponent = () => {
  const opacity = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  
  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
  }, []);
  
  return <Animated.View style={animatedStyle} />;
};
```

#### Gesture Animation
```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const gesture = Gesture.Pan()
  .onUpdate((e) => {
    translateX.value = e.translationX;
  });
```

## Accessibility Rules

### 1. Always Include Accessibility Props
```typescript
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Submit button"
  accessibilityHint="Double tap to submit the form"
  accessibilityRole="button"
>
  <Text>Submit</Text>
</TouchableOpacity>
```

### 2. Use Semantic Components
- Use GlueStack components which have built-in accessibility
- Add proper labels for screen readers
- Test with VoiceOver (iOS) and TalkBack (Android)

## Performance Guidelines

### 1. Optimize Re-renders
```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});

// Use useCallback and useMemo appropriately
const memoizedCallback = useCallback(() => {
  // Callback logic
}, [dependencies]);
```

### 2. Image Optimization
```typescript
import { Image } from 'expo-image';

// Always use expo-image for better performance
<Image
  source={{ uri: imageUrl }}
  style={{ width: 200, height: 200 }}
  contentFit="cover"
  transition={200}
/>
```

### 3. List Performance
```typescript
// Use FlashList for large lists
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={data}
  renderItem={renderItem}
  estimatedItemSize={100}
  keyExtractor={(item) => item.id}
/>
```

## State Management in UI

### 1. Local State for UI
```typescript
// Use local state for UI-only concerns
const [isVisible, setIsVisible] = useState(false);
const [selectedTab, setSelectedTab] = useState(0);
```

### 2. React Query for Server State
```typescript
// Use React Query for data fetching
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['jobs'],
  queryFn: fetchJobs,
});
```

### 3. Context for Theme/Global UI State
```typescript
// Use Context API for theme or global UI state
const { theme, toggleTheme } = useTheme();
```

## Testing Requirements

### 1. Component Testing
```typescript
// Write tests for all components
import { render, fireEvent } from '@testing-library/react-native';

describe('Button', () => {
  it('should render correctly', () => {
    const { getByText } = render(<Button title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });
});
```

## Code Style Rules

### 1. Import Order
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. React Native imports
import { View, Text } from 'react-native';

// 3. Third-party imports
import { useQuery } from '@tanstack/react-query';
import { Button } from '@gluestack-ui/themed';

// 4. Local imports
import { useAuth } from '@/hooks/useAuth';
import { JobCard } from '@/components/features/JobCard';

// 5. Type imports
import type { JobType } from '@/types';
```

### 2. Props Interface Naming
```typescript
// Always use Props suffix for component props
interface ComponentNameProps {
  title: string;
  onPress?: () => void;
}
```

### 3. Event Handler Naming
```typescript
// Use handle prefix for event handlers
const handlePress = () => {
  // Handler logic
};

const handleInputChange = (text: string) => {
  // Handler logic
};
```

## Common Patterns to Follow

### 1. Loading States
```typescript
if (isLoading) {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" />
    </View>
  );
}
```

### 2. Error States
```typescript
if (error) {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-red-500 text-center">{error.message}</Text>
      <Button onPress={retry} className="mt-4">
        <ButtonText>Retry</ButtonText>
      </Button>
    </View>
  );
}
```

### 3. Empty States
```typescript
if (data.length === 0) {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-gray-500 text-center">No items found</Text>
    </View>
  );
}
```

## DO NOT

1. **DO NOT** use inline styles - use Tailwind classes or styled components
2. **DO NOT** use AsyncStorage for sensitive data - use Expo SecureStore
3. **DO NOT** create components without TypeScript interfaces
4. **DO NOT** forget accessibility props
5. **DO NOT** use React Native's FlatList for large lists - use FlashList
6. **DO NOT** hardcode colors or dimensions - use theme values or Tailwind
7. **DO NOT** create animations without React Native Reanimated

## ALWAYS

1. **ALWAYS** use TypeScript for all components
2. **ALWAYS** follow the component file structure
3. **ALWAYS** use GlueStack UI components when available
4. **ALWAYS** test on both iOS and Android
5. **ALWAYS** optimize images with expo-image
6. **ALWAYS** handle loading and error states
7. **ALWAYS** make components accessible
8. **ALWAYS** use React Query for server state management
