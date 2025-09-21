import React, { useContext, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { ThemeContext } from "../../context/ThemeContext";

const ProgressBar = ({
  progress,
  target,
  duration = 1000,
  width = 300,
  height = 20,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Calcul du pourcentage
    const percentage = Math.min(progress / target, 1);

    // Animation
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: duration,
      useNativeDriver: false, // width n'est pas supporté par useNativeDriver
    }).start();
  }, [progress, target]);

  const barWidth = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width],
  });
  const { theme } = useContext(ThemeContext);
  return (
    <View style={[styles.container, { width, height }]}>
      <Animated.View
        style={[
          styles.bar,
          { width: barWidth, height },
          { backgroundColor: theme.success },
        ]}
      />
      <View style={styles.textContainer}>
        <Text style={styles.text}>{`${Math.round(
          (progress / target) * 100
        )}%`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    overflow: "hidden",
  },
  textContainer: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    top: 0,
    bottom: 0,
  },
  text: {
    color: "#000",
    fontWeight: "bold",
  },
});

export default ProgressBar;
