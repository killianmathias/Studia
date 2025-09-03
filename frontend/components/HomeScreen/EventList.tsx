import { StyleSheet, Text, View, SectionList, Dimensions } from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { supabase } from "../../lib/supabase";
import { ThemeContext } from "../../context/ThemeContext";
import ThemedText from "../Themed/ThemedText";
import { fetchEvents } from "../../functions/functions";
const { width, height } = Dimensions.get("window");
import { Section } from "../../types/types";
import { SupabaseEvent } from "../../types/types";
import CustomButton from "../CustomButton";
import { useNavigation } from "@react-navigation/native";

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const groupEventsByDay = (events: SupabaseEvent[]): Section[] => {
  const grouped: Record<string, SupabaseEvent[]> = {};

  events.forEach((event) => {
    const day = event.date.split("T")[0];
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(event);
  });

  Object.keys(grouped).forEach((day) => {
    grouped[day].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  });

  return Object.keys(grouped)
    .sort()
    .map((day) => ({
      title: formatDate(grouped[day][0].date), // Utilise le format lisible
      data: grouped[day],
    }));
};

const EventList = () => {
  const [events, setEvents] = useState<SupabaseEvent[]>([]);
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();

  useEffect(() => {
    const loadEvents = async () => {
      const data = await fetchEvents();
      setEvents(data);
    };
    loadEvents();
  }, []);

  const sections = groupEventsByDay(events);

  const renderItem = ({ item }: { item: Event }) => (
    <View style={[styles.item, { backgroundColor: theme.surface }]}>
      <Text style={styles.time}>{item.date.split("T")[1].slice(0, 5)}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <View
        style={[
          styles.indicator,
          {
            backgroundColor: item.type === "exam" ? theme.error : theme.primary,
          },
        ]}
      ></View>
    </View>
  );

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={styles.header}>
      <Text style={styles.headerText}>{section.title}</Text>
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
    height: 0.9 * height,
  },
  titleContainer: {
    height: 0.05 * height,
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
    width: width * 0.9,
    marginLeft: width * 0.05,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignItems: "center",
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
