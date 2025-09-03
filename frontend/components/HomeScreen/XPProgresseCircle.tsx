import React, { useContext } from "react";
import { View, Image, StyleSheet, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { ThemeContext } from "../../context/ThemeContext";
import ThemedText from "../Themed/ThemedText";
import { getLevelFromXp, getUserXp } from "../../functions/functions";

interface XPProgressCircleProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0 à 1
  imageUri: string;
}

export default function XPProgressCircle({
  size,
  strokeWidth,
  progress,
  imageUri,
}: XPProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const { theme } = useContext(ThemeContext);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Cercle de fond */}
        <Circle
          stroke="#eee"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Cercle de progression */}
        <Circle
          stroke={theme.primary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {/* Image au centre */}
      <Image
        source={
          imageUri
            ? { uri: encodeURI(imageUri) }
            : require("../../assets/default-profile.png")
        }
        style={{
          width: size - strokeWidth * 2,
          height: size - strokeWidth * 2,
          borderRadius: (size - strokeWidth * 2) / 2,
          position: "absolute",
          top: strokeWidth,
          left: strokeWidth,
        }}
      />
    </View>
  );
}
