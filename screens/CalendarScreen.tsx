import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  useColorScheme,
} from "react-native";
import AnimatedCalendar from "../components/CustomCalendar";
import { darkTheme, lightTheme } from "../themes/themes";
// const events = [
//   {
//     title: "Réunion projet",
//     start: new Date(2025, 7, 18, 9, 30), // 18 août 2025 à 09h30
//     end: new Date(2025, 7, 18, 11, 0),
//   },
//   {
//     title: "Déjeuner avec Marie",
//     start: new Date(2025, 7, 18, 12, 30),
//     end: new Date(2025, 7, 18, 14, 0),
//   },
//   {
//     title: "Cours de yoga",
//     start: new Date(2025, 7, 19, 18, 0),
//     end: new Date(2025, 7, 19, 19, 0),
//   },
//   {
//     title: "Call client (Zoom)",
//     start: new Date(2025, 7, 20, 15, 0),
//     end: new Date(2025, 7, 20, 15, 45),
//   },
//   {
//     title: "Travail concentré",
//     start: new Date(2025, 7, 21, 10, 0),
//     end: new Date(2025, 7, 21, 12, 0),
//   },
//   {
//     title: "Afterwork 🍻",
//     start: new Date(2025, 7, 21, 19, 0),
//     end: new Date(2025, 7, 21, 22, 0),
//   },
//   {
//     title: "Sortie famille",
//     start: new Date(2025, 7, 23, 11, 0),
//     end: new Date(2025, 7, 23, 17, 0),
//   },
// ];
export default function CalendarScreen() {
  const scheme = useColorScheme();
  return (
    <SafeAreaView
      style={[
        { flex: 1, paddingTop: 40 },
        {
          backgroundColor:
            scheme === "dark" ? darkTheme.background : lightTheme.background,
        },
      ]}
    >
      <AnimatedCalendar />
    </SafeAreaView>
  );
}
