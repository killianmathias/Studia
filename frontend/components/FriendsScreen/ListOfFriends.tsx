import { Dimensions, StyleSheet, Text, View } from "react-native";
import React from "react";
import ThemedText from "../Themed/ThemedText";
const { height, width } = Dimensions.get("window");
const ListOfFriends = ({ userId }) => {
  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Amis
      </ThemedText>
    </View>
  );
};

export default ListOfFriends;

const styles = StyleSheet.create({
  container: {
    height: height * 0.6,
    width: width * 0.9,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
});
