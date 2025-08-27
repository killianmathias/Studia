import React, { useEffect, useState } from "react";
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  LayoutChangeEvent,
  useColorScheme,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { opacity } from "react-native-reanimated/lib/typescript/Colors";
import { lightTheme, darkTheme } from "../themes/themes";
import * as Haptics from "expo-haptics";
const icons: Record<string, keyof typeof Feather.glyphMap> = {
  home: "home",
  profile: "user",
  settings: "settings",
  calendar: "calendar",
  add: "plus",
};

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const scheme = useColorScheme();
  const [dimensions, setDimensions] = useState({ height: 20, width: 100 });

  const buttonWidth = dimensions.width / state.routes.length;
  const onTabbarLayout = (e: LayoutChangeEvent) => {
    setDimensions({
      height: e.nativeEvent.layout.height,
      width: e.nativeEvent.layout.width,
    });
  };

  const tabPositionX = useSharedValue(0);
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
    <View style={styles.tabBar} onLayout={onTabbarLayout}>
      <Animated.View
        style={[
          animatedStyle,
          {
            position: "absolute",
            backgroundColor:
              scheme === "dark" ? darkTheme.primary : lightTheme.primary,
            borderRadius: 30,
            marginHorizontal: 6,
            height: 60,
            width: 60,
          },
        ]}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          tabPositionX.value = withSpring(buttonWidth * index, {
            duration: 1500,
          });
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

        // Bouton central "+"
        // if (route.name === "add") {
        //   return (
        //     <Pressable
        //       key={route.key}
        //       onPress={onPress}
        //       style={styles.addButtonContainer}
        //     >
        //       <View style={styles.addButton}>
        //         <Feather name="plus" size={28} color="#FFF" />
        //       </View>
        //     </Pressable>
        //   );
        // }

        // Animation sur les icônes
        const scale = useSharedValue(0);
        useEffect(() => {
          scale.value = withSpring(
            typeof isFocused === "boolean" ? (isFocused ? 1 : 0) : isFocused,
            { duration: 350 }
          );
        }, [isFocused, scale]);

        const animatedTextStyle = useAnimatedStyle(() => {
          const opacity = interpolate(scale.value, [0, 1], [1, 0]);
          return { opacity };
        });
        const animatedIconStyle = useAnimatedStyle(() => {
          const scaleValue = interpolate(scale.value, [0, 1], [1, 1.3]);
          const top = interpolate(scale.value, [0, 1], [0, 9]);
          return {
            transform: [
              {
                scale: scaleValue,
              },
            ],
            top,
          };
        });
        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tabItem}>
            <Animated.View style={animatedIconStyle}>
              <Feather
                name={icons[route.name]}
                size={22}
                color={
                  isFocused
                    ? "#FFF"
                    : scheme === "dark"
                    ? darkTheme.primary
                    : lightTheme.primary
                }
              />
            </Animated.View>
            <Animated.Text
              style={[
                {
                  color: isFocused
                    ? "#FFF"
                    : scheme === "dark"
                    ? darkTheme.primary
                    : lightTheme.primary,
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
    backgroundColor: "#fff",
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
  addButtonContainer: {
    flex: 1,
    alignItems: "center",
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3498db",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
});
