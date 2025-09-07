import { Dimensions, StyleSheet, Text, View } from "react-native";
import React from "react";
import ThemedSafeAreaView from "../components/Themed/ThemedSafeAreaView";
import ThemedText from "../components/Themed/ThemedText";
import FriendSearch from "../components/FriendsScreen/FriendSearch";
const { width, height } = Dimensions.get("window");

const FriendsScreen = () => {
  return (
    <ThemedSafeAreaView style={styles.friendsScreenContainer}>
      <ThemedText style={styles.friendsScreenTitle} type="title">
        Amis
      </ThemedText>
      <FriendSearch />
    </ThemedSafeAreaView>
  );
};

export default FriendsScreen;

const styles = StyleSheet.create({
  friendsScreenContainer: {
    width,
    height,
    flexDirection: "column",
    alignItems: "center",
  },
});
