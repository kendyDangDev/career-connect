import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Search, X } from "lucide-react-native";

interface SearchBarProps extends Omit<TextInputProps, "onSubmitEditing"> {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: (text: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Tìm kiếm...",
  ...props
}) => {
  const handleClear = () => {
    onChangeText("");
    onSubmit?.("");
  };

  const handleSubmit = () => {
    onSubmit?.(value);
  };

  return (
    <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
      <Search size={20} color="#9CA3AF" />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={handleSubmit}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className="flex-1 ml-3 text-gray-900 text-base outline-none"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
      />

      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} className="ml-2">
          <X size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
