import React, { useContext } from "react";
import { View, Image, StyleSheet, Text, Dimensions } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { ThemeContext } from "../../context/ThemeContext";
import ThemedText from "../Themed/ThemedText";
import {
  getLevelFromXp,
  getSignedUrlFromPath,
  getUserXp,
} from "../../functions/functions";
import { useState, useEffect } from "react";

const { height, width } = Dimensions.get("window");

interface XPProgressCircleProps {
  size: number;
  strokeWidth: number;
  imageUri: string;
  uid: string;
}

export default function XPProgressCircle({
  size,
  strokeWidth,
  imageUri,
  uid,
}: XPProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const { theme } = useContext(ThemeContext);
  const [userXp, setUserXp] = useState(0);
  const [signedUrl, setSignedUrl] = useState("");
  useEffect(() => {
    const loadUser = async () => {
      const xp = await getUserXp(uid);
      const xpValue = xp[0]?.xp || 0;
      setUserXp(xpValue || 0);
    };
    loadUser();
  }, []);

  useEffect(() => {
    async function setUrl() {
      setSignedUrl(await getSignedUrlFromPath(imageUri));
    }
    setUrl();
  }, [imageUri]);
  const strokeDashoffset =
    circumference * (1 - userXp / getLevelFromXp(userXp).nextLevelXp);
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
              { translateX: -(height * 0.02 + (size / height) * 50) / 2 }, // centrage horizontal
            ],
          },
        ]}
      >
        <Text style={[styles.level]}>{getLevelFromXp(userXp).level}</Text>
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
    fontWeight: 700,
    fontSize: 15,
    color: "#FFFFFF",
  },
});
