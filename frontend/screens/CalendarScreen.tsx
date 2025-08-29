import React, { useState } from "react";
import { SafeAreaView } from "react-native";
import AnimatedCalendar from "../components/CustomCalendar";
import ThemedSafeAreaView from "../components/Themed/ThemedSafeAreaView";
export default function CalendarScreen() {
  return (
    <ThemedSafeAreaView style={[{ flex: 1, paddingTop: 40 }]}>
      <AnimatedCalendar />
    </ThemedSafeAreaView>
  );
}
