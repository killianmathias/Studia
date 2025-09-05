import { StyleSheet, Text, View, Dimensions } from "react-native";
import React, { useContext } from "react";
import ThemeButton from "./ThemeButton";
import { ThemeContext } from "../../context/ThemeContext";
const { width, height } = Dimensions.get("window");
import {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useEffect } from "react";
import Animated from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const ThemeSelector = () => {
  const tabPositionX = useSharedValue(0);
  const { theme, mode, setMode } = useContext(ThemeContext);
  let index = mode === "light" ? 0 : mode === "dark" ? 1 : 2;
  const buttonWidth = (width * 0.9) / 3;

  useEffect(() => {
    index = mode === "light" ? 0 : mode === "dark" ? 1 : 2;
  }, [mode]);
  useEffect(() => {
    tabPositionX.value = withSpring(buttonWidth * index, {
      duration: 1500,
    });
  }, [index, tabPositionX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: tabPositionX.value,
        },
      ],
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Animated.View
        style={[
          animatedStyle,
          {
            position: "absolute",
            left: 3,
            backgroundColor: theme.background,
            borderRadius: 15,
            marginHorizontal: 6,
            height: 60,
            width: width / 4,
          },
        ]}
      ></Animated.View>
      <ThemeButton
        mode={"light"}
        onPress={() => {
          setMode("light");
          Haptics.selectionAsync();
        }}
      />
      <ThemeButton
        mode={"dark"}
        onPress={() => {
          setMode("dark");
          Haptics.selectionAsync();
        }}
      />
      <ThemeButton
        mode={"system"}
        onPress={() => {
          setMode("system");
          Haptics.selectionAsync();
        }}
      />
    </View>
  );
};

export default ThemeSelector;

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    height: height * 0.08,
    backgroundColor: "red",
    borderRadius: 15,
    justifyContent: "space-around",
    flexDirection: "row",
    alignItems: "center",
  },
});
