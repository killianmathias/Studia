import "react-native-reanimated";
import React, { useContext, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from "react-native-reanimated";
import { ThemeContext } from "../../context/ThemeContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width } = Dimensions.get("window");
export default function AnimatedProgressCircle({
  strokeWidth = 12,
  progress = 0.75,
  color = "#00BCD4",
  children,
}) {
  const size = width * 0.8;
  const radius = (size - strokeWidth) / 2; // rayon du cercle de fond
  const adjustedRadius = (size - strokeWidth * 2) / 2; // rayon ajusté pour AnimatedCircle
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useSharedValue(progress);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 800 });
  }, [progress]);
  const { theme } = useContext(ThemeContext);
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Cercle de fond */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={adjustedRadius}
          stroke="#eee"
          strokeWidth={strokeWidth}
          // fill={theme.background}
        />
        {/* Cercle animé parfaitement aligné */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
          fill={theme.background}
        />
      </Svg>

      {/* Contenu centré */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});
