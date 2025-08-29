import { StyleSheet, Text, View, SafeAreaView } from "react-native";
import React from "react";
import { Calendar } from "react-native-big-calendar";
import MyCalendar from "../components/CustomCalendar";
import ThemedSafeAreaView from "../components/Themed/ThemedSafeAreaView";
import Header from "../components/HomeScreen/Header";
import EventList from "../components/HomeScreen/EventList";

const HomeScreen = () => {
  return (
    <ThemedSafeAreaView style={styles.homeScreen}>
      <Header />
      <EventList />
      {/* <Calendar events={events} height={600} /> */}
    </ThemedSafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  homeScreen: {
    flexDirection: "column",
    // justifyContent: "center",
    alignItems: "center",
  },
});
