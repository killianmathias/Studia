import React, { useEffect, useState } from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Calendar } from "react-native-big-calendar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { darkTheme, lightTheme } from "../themes/themes";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");
const events = [
  {
    title: "Réunion projet",
    start: new Date(2025, 7, 18, 9, 30), // 18 août 2025 à 09h30
    end: new Date(2025, 7, 18, 11, 0),
  },
  {
    title: "Déjeuner avec Marie",
    start: new Date(2025, 7, 18, 12, 30),
    end: new Date(2025, 7, 18, 14, 0),
  },
  {
    title: "Cours de yoga",
    start: new Date(2025, 7, 19, 18, 0),
    end: new Date(2025, 7, 19, 19, 0),
  },
  {
    title: "Call client (Zoom)",
    start: new Date(2025, 7, 20, 15, 0),
    end: new Date(2025, 7, 20, 15, 45),
  },
  {
    title: "Travail concentré",
    start: new Date(2025, 7, 21, 10, 0),
    end: new Date(2025, 7, 21, 12, 0),
  },
  {
    title: "Afterwork 🍻",
    start: new Date(2025, 7, 21, 19, 0),
    end: new Date(2025, 7, 21, 22, 0),
  },
  {
    title: "Sortie famille",
    start: new Date(2025, 7, 23, 11, 0),
    end: new Date(2025, 7, 23, 17, 0),
  },
];

const BUTTONS = ["day", "week", "month"];

const CustomCalendar = () => {
  const scheme = useColorScheme();
  const [mode, setMode] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateToString, setDateToString] = useState("");
  const now = new Date();
  const scrollToHour = now.getHours() + now.getMinutes() / 60;

  const sliderX = useSharedValue(width / 3);

  useEffect(() => {
    const str = dayjs(currentDate)
      .locale("fr")
      .format("MMMM YYYY")
      .replace(/^./, (c) => c.toUpperCase());
    setDateToString(str);
  }, [currentDate]);

  const handleModeChange = (selectedMode, index) => {
    setMode(selectedMode);
    sliderX.value = withSpring(index * (width / 3));
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sliderX.value }],
  }));

  return (
    <SafeAreaView>
      {/* Boutons avec curseur animé */}
      <View style={styles.buttonContainer}>
        {BUTTONS.map((btn, index) => {
          const isActive = mode === btn;
          return (
            <TouchableOpacity
              key={btn}
              style={styles.button}
              onPress={() => {
                Haptics.selectionAsync();
                handleModeChange(btn, index);
              }}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: isActive
                      ? "#FFF"
                      : scheme === "dark"
                      ? darkTheme.primary
                      : lightTheme.primary, // texte blanc si actif, bleu sinon
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
              backgroundColor:
                scheme === "dark" ? darkTheme.primary : lightTheme.primary,
              width: 100,
            },
          ]}
        />
      </View>

      {/* Nom du mois */}
      <View style={{ alignItems: "center", paddingVertical: 10 }}>
        <Text
          style={[
            { fontSize: 20, fontWeight: "bold" },
            {
              color:
                scheme === "dark"
                  ? darkTheme.textprimary
                  : lightTheme.textprimary,
            },
          ]}
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
        swipeEnabled={true}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  slider: {
    position: "absolute",
    height: "80%",
    top: "10%",
    left: 17.5,
    borderRadius: 8,
    zIndex: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
  },
});
