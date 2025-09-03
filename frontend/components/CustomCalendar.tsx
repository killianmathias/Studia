import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Calendar } from "react-native-big-calendar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import * as Haptics from "expo-haptics";
import { ThemeContext } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";
import { fetchUserId, fetchEvents } from "../functions/functions";
import { CalendarEvent, SupabaseEvent } from "../types/types";

const { width, height } = Dimensions.get("window");
const BUTTONS = ["day", "week", "month"];

const CustomCalendar = () => {
  const { theme } = useContext(ThemeContext);
  const [mode, setMode] = useState<"day" | "week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateToString, setDateToString] = useState("");
  const now = new Date();
  const scrollToHour = now.getHours() + now.getMinutes() / 60;
  const sliderX = useSharedValue(width / 3);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      const supabaseEvents = await fetchEvents();
      const formattedEvents: CalendarEvent[] = supabaseEvents.map((e) => ({
        title: e.title,
        start: new Date(e.date),
        end: new Date(new Date(e.date).getTime() + e.duration * 60 * 1000), // calcul fin
      }));
      setEvents(formattedEvents);
    };
    loadEvents();
  }, []);
  console.log(events);
  useEffect(() => {
    const str = dayjs(currentDate)
      .locale("fr")
      .format("MMMM YYYY")
      .replace(/^./, (c) => c.toUpperCase());
    setDateToString(str);
  }, [currentDate]);

  const handleModeChange = async (
    selectedMode: "day" | "week" | "month",
    index: number
  ) => {
    setMode(selectedMode);
    sliderX.value = withSpring(index * (width / 3));
    await Haptics.selectionAsync();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sliderX.value }],
  }));

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Boutons avec curseur animé */}
      <View style={styles.buttonContainer}>
        {BUTTONS.map((btn, index) => {
          const isActive = mode === btn;
          return (
            <TouchableOpacity
              key={btn}
              style={styles.button}
              onPress={() =>
                handleModeChange(btn as "day" | "week" | "month", index)
              }
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: isActive ? "#FFF" : theme.primary,
                  },
                ]}
              >
                {btn === "day" ? "Jour" : btn === "week" ? "Semaine" : "Mois"}
              </Text>
            </TouchableOpacity>
          );
        })}
        <Animated.View
          style={[
            styles.slider,
            animatedStyle,
            {
              backgroundColor: theme.primary,
              width: width / 3 - 20,
            },
          ]}
        />
      </View>

      {/* Nom du mois */}
      <View style={{ alignItems: "center", paddingVertical: 10 }}>
        <Text
          style={{ fontSize: 20, fontWeight: "bold", color: theme.textprimary }}
        >
          {dateToString}
        </Text>
      </View>

      <Calendar
        mode={mode}
        events={events}
        locale="fr"
        height={height - 200}
        ampm={false}
        minHour={6}
        maxHour={22}
        hideNowIndicator={false}
        swipeEnabled
        weekStartsOn={1}
        onSwipeEnd={(date) => setCurrentDate(date)}
        moreLabel="{moreCount} de plus"
        initialDate={now}
        hourRowHeight={60}
        scrollOffsetMinutes={scrollToHour * 60 - 600}
      />
    </SafeAreaView>
  );
};

export default CustomCalendar;

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    position: "relative",
    height: 50,
  },
  button: {
    width: width / 3,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    zIndex: 1,
  },
  buttonText: {
    fontWeight: "bold",
  },
  slider: {
    position: "absolute",
    height: "80%",
    top: "10%",
    left: 10,
    borderRadius: 8,
    zIndex: 0,
  },
});
