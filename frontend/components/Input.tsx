import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from "react-native";
import { darkTheme, lightTheme } from "../themes/themes";
import { Dimensions } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
const { width, height } = Dimensions.get("window");

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
  const { theme, setMode, mode } = useContext(ThemeContext);
  const [visible, setVisible] = useState(false);
  return (
    <View
      style={[
        styles.container,
        containerStyle,
        {
          backgroundColor: theme.surface,
        },
        {
          borderColor: theme.primary,
        },
        { width: (width * 0.9) / number - (number - 1) * 5 },
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={height * 0.035}
          color={theme.primary}
          style={styles.icon}
        />
      )}
      <TextInput
        style={[
          styles.input,
          inputStyle,
          style,
          {
            color: theme.textprimary,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.primary}
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
            color={theme.primary}
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
    justifyContent: "center",
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
    height: "100%",
  },
});

export default Input;
