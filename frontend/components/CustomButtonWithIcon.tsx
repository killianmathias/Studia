import React from "react";
import { TouchableOpacity, Text, StyleSheet, Dimensions } from "react-native";
import { lightTheme, darkTheme } from "../themes/themes";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const { height, width } = Dimensions.get("window");
const CustomButton = ({
  title,
  onPress,
  backgroundColor = "#6200ee",
  textColor = "#fff",
  disabled = false,
  icon = "",
  color = "#3B82F6",
}) => {
  const { theme, setMode, mode } = useContext(ThemeContext);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: disabled ? "#aaa" : color,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={height * 0.035}
        color={"#FFF"}
        style={styles.icon}
      />
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
    paddingHorizontal: 10,
    width: width * 0.35,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 5,
    gap: 10,
  },
  icon: {},
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CustomButton;
