import { StyleSheet, Text, View, Dimensions } from "react-native";
import React, { useContext, useState } from "react";
import SelectorButton from "../SelectorButton";
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

const MasterySelector = ({ setValue }: { setValue: any }) => {
  const tabPositionX = useSharedValue(0);
  const [mastery, setMastery] = useState("Moyen");
  const { theme } = useContext(ThemeContext);
  let index = mastery === "Faible" ? 0 : mastery === "Moyen" ? 1 : 2;
  let backgroundColor =
    mastery === "Faible"
      ? theme.error
      : mastery === "Moyen"
      ? theme.warning
      : theme.success;
  const buttonWidth = (width * 0.7) / 3;

  useEffect(() => {
    index = mastery === "Faible" ? 0 : mastery === "Moyen" ? 1 : 2;
    setValue(mastery);
  }, [mastery]);
  useEffect(() => {
    backgroundColor =
      mastery === "Faible"
        ? theme.error
        : mastery === "Moyen"
        ? theme.warning
        : theme.success;
  }, [mastery]);

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View
        style={[
          animatedStyle,
          {
            position: "absolute",
            left: 3,
            backgroundColor: backgroundColor,
            borderRadius: 15,
            marginHorizontal: width * 0.7 * 0.03,
            height: height * 0.04,
            width: (width * 0.7) / 4,
          },
        ]}
      ></Animated.View>
      <SelectorButton
        setMastery={setMastery}
        mastery="Faible"
        color={mastery === "Faible" ? theme.surface : theme.textprimary}
      />
      <SelectorButton
        setMastery={setMastery}
        mastery="Moyen"
        color={mastery === "Moyen" ? theme.surface : theme.textprimary}
      />
      <SelectorButton
        setMastery={setMastery}
        mastery="Bon"
        color={mastery === "Bon" ? theme.surface : theme.textprimary}
      />
    </View>
  );
};

export default MasterySelector;

const styles = StyleSheet.create({
  container: {
    width: width * 0.7,
    height: height * 0.05,
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
