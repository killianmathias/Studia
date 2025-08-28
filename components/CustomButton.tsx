import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { lightTheme, darkTheme } from "../themes/themes";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
const CustomButton = ({
  title,
  onPress,
  backgroundColor = "#6200ee",
  textColor = "#fff",
  disabled = false,
}) => {
  const { theme, setMode, mode } = useContext(ThemeContext);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: disabled ? "#aaa" : theme.primary,
        },
      ]}
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          {
            color: darkTheme.textprimary,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 5,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CustomButton;
