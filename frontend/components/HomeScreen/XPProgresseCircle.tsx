import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  Dimensions,
  Animated,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { ThemeContext } from "../../context/ThemeContext";
import {
  getLevelFromXp,
  getSignedUrlFromPath,
  useUserXp,
} from "../../functions/functions";

const { height } = Dimensions.get("window");

interface XPProgressCircleProps {
  size: number;
  strokeWidth: number;
  imageUri: string;
  uid: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function XPProgressCircle({
  size,
  strokeWidth,
  imageUri,
  uid,
}: XPProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const { theme } = useContext(ThemeContext);
  const userXp = useUserXp(uid);
  const [signedUrl, setSignedUrl] = useState("");
  const [level, setLevel] = useState(0);
  const [progress, setProgress] = useState(0); // 0 à 1

  const animatedValue = useRef(new Animated.Value(circumference)).current;

  // Charger l'image
  useEffect(() => {
    async function setUrl() {
      setSignedUrl(await getSignedUrlFromPath(imageUri));
    }
    setUrl();
  }, [imageUri]);

  // Met à jour le niveau et la progression à chaque changement de XP
  useEffect(() => {
    const xpData = getLevelFromXp(userXp);
    const newProgress = Math.min(xpData.currentXp / xpData.nextLevelXp, 1);
    console.log(xpData.currentXp);
    setLevel(xpData.level);
    setProgress(newProgress);

    const finalOffset = circumference * (1 - newProgress);

    Animated.timing(animatedValue, {
      toValue: finalOffset,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [userXp]);

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        position: "relative",
      }}
    >
      <Svg width={size} height={size}>
        <Circle
          stroke="#eee"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          stroke={theme.primary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={animatedValue}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <Image
        source={
          imageUri
            ? { uri: signedUrl }
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

      <View
        style={[
          styles.levelContainer,
          {
            backgroundColor: theme.primary,
            width: height * 0.02 + (size / height) * 50,
            height: height * 0.02 + (size / height) * 50,
            bottom: -size / 8,
            left: "50%",
            transform: [
              { translateX: -(height * 0.02 + (size / height) * 50) / 2 },
            ],
          },
        ]}
      >
        <Text style={[styles.level]}>{level}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  levelContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
  },
  level: {
    fontWeight: "700",
    fontSize: 15,
    color: "#FFFFFF",
  },
});
