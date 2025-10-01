import {
  StyleSheet,
  Text,
  View,
  SectionList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { supabase } from "../../lib/supabase";
import { ThemeContext } from "../../context/ThemeContext";
import ThemedText from "../Themed/ThemedText";
import { fetchEvents } from "../../functions/functions";
const { width, height } = Dimensions.get("window");
import { CalendarEvent, Section } from "../../types/types";
import { SupabaseEvent } from "../../types/types";
import CustomButton from "../CustomButton";
import { useNavigation } from "@react-navigation/native";
import { useAppStore } from "../../store/useAppStore";
import { fetchGoogleEvents, useStudiaEvents } from "../../functions/events";

const formatDate = (date: Date): string => {
  let str = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    day: "numeric",
    month: "long",
  });
  return str.charAt(0).toLocaleUpperCase() + str.slice(1);
};

type Section = {
  title: string;
  data: CalendarEvent[];
};

const groupEventsByDay = (events: CalendarEvent[]): Section[] => {
  const grouped: Record<string, CalendarEvent[]> = {};

  events.forEach((event) => {
    const key = event.start.toISOString();
    const dayKey = key.split("T")[0];
    if (!grouped[dayKey]) grouped[dayKey] = [];
    grouped[dayKey].push(event);
  });

  Object.keys(grouped).forEach((day) => {
    grouped[day].sort((a, b) => a.start.getTime() - b.start.getTime());
  });

  return Object.keys(grouped)
    .sort()
    .map((day) => ({
      title: formatDate(grouped[day][0].start),
      data: grouped[day],
    }));
};

const EventList = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  useStudiaEvents();
  const events = useAppStore((s) => s.studiaEvents);

  const sections = groupEventsByDay(events);
  const renderItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: theme.surface }]}
      onPress={() => navigation.navigate("EventDetail", { item: item })}
    >
      <Text style={[styles.time, { color: theme.textprimary }]}>
        {item.start.toISOString().split("T")[1].slice(0, 5)}
      </Text>
      <Text style={[styles.title, { color: theme.textprimary }]}>
        {item.title}
      </Text>
      <View
        style={[
          styles.indicator,
          {
            backgroundColor: item.type === "exam" ? theme.error : theme.primary,
          },
        ]}
      ></View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={styles.header}>
      <Text style={[styles.headerText, { color: theme.primary }]}>
        {section.title}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <ThemedText type="title" style={styles.title}>
          Vos événements à venir
        </ThemedText>
      </View>
      {events.length == 0 ? (
        <View style={styles.noEventContainer}>
          <ThemedText
            style={[styles.noEventText, { color: theme.textsecondary }]}
            type="subtitle"
          >
            Aucun événement à venir
          </ThemedText>
          <CustomButton
            onPress={() => navigation.navigate("add")}
            title={"Ajouter un examen"}
          />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
        />
      )}
    </View>
  );
};

export default EventList;

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 0.7 * height,
  },
  titleContainer: {
    height: 0.04 * height,
    marginTop: height * 0.02,
    marginLeft: width * 0.05,
  },
  header: {
    padding: 10,
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  item: {
    flexDirection: "row",
    paddingLeft: 20,
    height: 0.06 * height,
    backgroundColor: "red",
    width: width * 0.9,
    marginLeft: width * 0.05,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignItems: "center",
    marginTop: height * 0.0,
    marginBottom: height * 0.01,
  },
  time: {
    marginRight: 10,
    width: 60,
    fontWeight: "bold",
  },
  title: {
    fontSize: 18,
    flex: 1,
  },
  indicator: {
    width: 30,
    height: "100%",
    borderEndEndRadius: 15,
    borderTopEndRadius: 15,
  },
  noEventContainer: {
    position: "absolute",
    height,
    width,
    marginTop: -0.151 * height,
    justifyContent: "center",
    alignItems: "center",
  },
  noEventText: {},
});
