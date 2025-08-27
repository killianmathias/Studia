import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  useColorScheme,
  Touchable,
  TouchableOpacity,
} from "react-native";
import { darkTheme, lightTheme } from "../themes/themes";
import { Dimensions } from "react-native";
import { useState } from "react";

const { width, height } = Dimensions.get("window");

import { Ionicons } from "@expo/vector-icons";

interface InputProps extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap; // Sécurité sur les noms d'icônes Ionicons
  iconColor?: string;
  iconSize?: number;
  containerStyle?: ViewStyle | ViewStyle[];
  inputStyle?: TextStyle | TextStyle[];
  type?: string;
}

const Input: React.FC<InputProps> = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  style,
  iconColor = "#666",
  inputStyle,
  containerStyle,
  type,
  number = 1,
  ...props
}) => {
  const scheme = useColorScheme();
  const [visible, setVisible] = useState(false);
  return (
    <View
      style={[
        styles.container,
        containerStyle,
        {
          backgroundColor:
            scheme === "dark" ? darkTheme.surface : lightTheme.surface,
        },
        {
          borderColor:
            scheme === "dark" ? darkTheme.primary : lightTheme.primary,
        },
        { width: (width * 0.9) / number - (number - 1) * 5 },
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={height * 0.035}
          color={scheme === "dark" ? darkTheme.primary : lightTheme.primary}
          style={styles.icon}
        />
      )}
      <TextInput
        style={[
          styles.input,
          inputStyle,
          style,
          {
            color:
              scheme === "dark"
                ? darkTheme.textprimary
                : lightTheme.textprimary,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={
          scheme === "dark" ? darkTheme.primary : lightTheme.primary
        }
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!visible && type === "password"}
        keyboardType={keyboardType}
        {...props}
      />
      {type === "password" ? (
        <TouchableOpacity onPress={() => setVisible(!visible)}>
          <Ionicons
            name={visible ? "eye-off" : "eye"}
            size={height * 0.035}
            color={scheme === "dark" ? darkTheme.primary : lightTheme.primary}
            style={styles.icon}
          />
        </TouchableOpacity>
      ) : (
        <></>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 0.07 * height,
    width: 0.9 * width,
    borderWidth: 3,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});

export default Input;
