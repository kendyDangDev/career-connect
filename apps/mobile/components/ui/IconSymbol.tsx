// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Tab navigation icons
  'house.fill': 'home',
  'doc.text.fill': 'description',
  'doc.text': 'description',
  'magnifyingglass': 'search',
  'bell.fill': 'notifications',
  'bell': 'notifications-none',
  'person.fill': 'person',
  
  // General icons
  'chevron.right': 'chevron-right',
  'chevron.left.forwardslash.chevron.right': 'code',
  'plus.circle.fill': 'add-circle',
  'bookmark': 'bookmark-border',
  'bookmark.fill': 'bookmark',
  'briefcase.fill': 'work',
  'briefcase': 'work-outline',
  'envelope.fill': 'mail',
  'info.circle.fill': 'info',
  'person.circle': 'account-circle',
  'person.2.fill': 'people',
  'chart.bar.fill': 'bar-chart',
  'lightbulb.fill': 'lightbulb',
  'star.fill': 'star',
  'lock': 'lock',
  'globe': 'language',
  'moon': 'dark-mode',
  'questionmark.circle': 'help-circle',
  'shield': 'security',
  'info.circle': 'info-outline',
  'arrow.right.square': 'logout',
  'pencil': 'edit',
  
  // Additional mappings
  'paperplane.fill': 'send',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
