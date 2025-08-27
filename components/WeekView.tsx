import React from "react";
import { View, Text, ScrollView } from "react-native";

const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

export default function WeekView() {
  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      {/* Colonne heures */}
      <View style={{ width: 50, backgroundColor: "#F9FAFB" }}>
        {hours.map((hour, i) => (
          <View key={i} style={{ height: 60 }}>
            <Text style={{ fontSize: 12, color: "#6B7280" }}>{hour}</Text>
          </View>
        ))}
      </View>

      {/* Grille horaire scrollable */}
      <ScrollView
        style={{ flex: 1, borderLeftWidth: 1, borderColor: "#E5E7EB" }}
      >
        <View style={{ height: 60 * 24, position: "relative" }}>
          {events.map((event, i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                top: event.start * 60,
                height: (event.end - event.start) * 60,
                left: 10,
                right: 10,
                backgroundColor: event.color,
                borderRadius: 8,
                padding: 4,
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                {event.title}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
