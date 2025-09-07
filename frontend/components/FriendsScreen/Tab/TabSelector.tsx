import { StyleSheet, Text, View, Dimensions } from "react-native";
import React, { useContext } from "react";
import TabButton from "./TabButton";
import { ThemeContext } from "../../../context/ThemeContext";
const { width, height } = Dimensions.get("window");
import {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useEffect } from "react";
import Animated from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const TabSelector = ({ setTab, tab }) => {
  const tabPositionX = useSharedValue(0);
  const { theme, mode, setMode } = useContext(ThemeContext);
  let index = tab === "friends" ? 0 : 1;
  const buttonWidth = (width * 0.9) / 2;

  useEffect(() => {
    index = tab === "friends" ? 0 : 1;
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
            backgroundColor: theme.primary,
            borderRadius: 15,
            marginHorizontal: 6,
            height: 40,
            width: width / 2.5,
          },
        ]}
      ></Animated.View>

      <TabButton
        title={"friends"}
        onPress={() => {
          setTab("friends");
          Haptics.selectionAsync();
        }}
        tab={tab}
      />
      <TabButton
        title={"askings"}
        onPress={() => {
          setTab("askings");
          Haptics.selectionAsync();
        }}
        tab={tab}
      />
    </View>
  );
};

export default TabSelector;
const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    height: height * 0.06,
    backgroundColor: "red",
    borderRadius: 15,
    justifyContent: "space-around",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
});
