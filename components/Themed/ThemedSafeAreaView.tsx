import {
  StyleSheet,
  SafeAreaView as RNSafeAreaView,
  useColorScheme,
  Dimensions,
} from "react-native";
import React from "react";
const { height, width } = Dimensions.get("window");
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

const ThemedSafeAreaView = ({ style, ...props }) => {
  const scheme = useColorScheme();
  const { theme, mode, setMode } = useContext(ThemeContext);
  return (
    <RNSafeAreaView
      style={[
        {
          backgroundColor: theme.background,
          height,
          width,
        },
        style,
      ]}
      {...props}
    />
  );
};

export default ThemedSafeAreaView;

const styles = StyleSheet.create({});
