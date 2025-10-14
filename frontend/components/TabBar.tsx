import React, { useEffect, useState, useContext } from "react";
import { View, Pressable, StyleSheet, LayoutChangeEvent } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemeContext } from "../context/ThemeContext";
import { useUiStore } from "../store/useUIStore";

const icons: Record<string, keyof typeof Feather.glyphMap> = {
  home: "home",
  profile: "user",
  calendar: "calendar",
  add: "plus",
  friends: "users",
};

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { theme } = useContext(ThemeContext);
  const [dimensions, setDimensions] = useState({ height: 20, width: 100 });
  const isRunning = useUiStore((s) => s.isRunning);

  const buttonWidth = dimensions.width / state.routes.length;
  const tabPositionX = useSharedValue(0);

  // TOUJOURS appeler le hook
  useEffect(() => {
    tabPositionX.value = withSpring(buttonWidth * state.index, {
      duration: 1500,
    });
  }, [state.index, buttonWidth, tabPositionX]);

  const onTabbarLayout = (e: LayoutChangeEvent) => {
    setDimensions({
      height: e.nativeEvent.layout.height,
      width: e.nativeEvent.layout.width,
    });
  };

  return (
    <View
      style={[
        styles.tabBar,
        { backgroundColor: theme.surface, opacity: isRunning ? 0.4 : 1 },
      ]}
      onLayout={onTabbarLayout}
      pointerEvents={isRunning ? "none" : "auto"} // bloque les clics si running
    >
      {/* Highlight animé */}
      <Animated.View
        style={[
          useAnimatedStyle(() => ({
            transform: [{ translateX: tabPositionX.value }],
          })),
          {
            position: "absolute",
            backgroundColor: theme.primary,
            borderRadius: 30,
            marginLeft: (buttonWidth - 60) / 2,
            height: 60,
            width: 60,
          },
        ]}
      />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;

        const scale = useSharedValue(isFocused ? 1 : 0);

        const animatedIconStyle = useAnimatedStyle(() => {
          const scaleValue = interpolate(scale.value, [0, 1], [1, 1.3]);
          const top = interpolate(scale.value, [0, 1], [0, 75 / 8]);
          return { transform: [{ scale: scaleValue }], top };
        });

        const animatedTextStyle = useAnimatedStyle(() => ({
          opacity: interpolate(scale.value, [0, 1], [1, 0]),
        }));

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
          Haptics.selectionAsync();
        };

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tabItem}>
            <Animated.View style={animatedIconStyle}>
              <Feather
                name={icons[route.name]}
                size={22}
                color={isFocused ? theme.surface : theme.primary}
              />
            </Animated.View>
            <Animated.Text
              style={[
                {
                  color: isFocused ? theme.surface : theme.primary,
                  fontSize: 14,
                },
                animatedTextStyle,
              ]}
            >
              {label}
            </Animated.Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderRadius: 30,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
});
