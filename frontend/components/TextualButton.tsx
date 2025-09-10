import {
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import ThemedText from "./Themed/ThemedText";
const { height } = Dimensions.get("window");

const TextualButton = ({ onPress, title, disabled = false, style }) => {
  const { theme } = useContext(ThemeContext);
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <ThemedText
        style={[styles.btnText, { color: theme.primary }, style]}
        type="button"
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
};

export default TextualButton;

const styles = StyleSheet.create({
  btnText: {
    fontSize: height * 0.04,
  },
});
