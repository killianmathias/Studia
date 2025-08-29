import { StyleSheet, Text as RNText, useColorScheme, View } from "react-native";
import React, { useContext } from "react";
import { darkTheme, lightTheme } from "../../themes/themes";
import { typography } from "../../constants/typography";
import { ThemeContext } from "../../context/ThemeContext";
const ThemedText = ({ style, type = "paragraph", ...props }) => {
  const textStyle = typography[type] || typography["paragraph"];
  const { theme, mode, setMode } = useContext(ThemeContext);
  return (
    <RNText
      style={[
        {
          color: theme.textprimary,
        },
        style,
        textStyle,
      ]}
      {...props}
    />
  );
};

export default ThemedText;

const styles = StyleSheet.create({});
