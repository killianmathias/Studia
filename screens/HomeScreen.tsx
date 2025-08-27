import { StyleSheet, Text, View, SafeAreaView } from "react-native";
import React from "react";
import { Calendar } from "react-native-big-calendar";
import MyCalendar from "../components/CustomCalendar";

const HomeScreen = () => {
  return (
    <SafeAreaView>
      <Text>HomeScreen</Text>
      {/* <Calendar events={events} height={600} /> */}
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
