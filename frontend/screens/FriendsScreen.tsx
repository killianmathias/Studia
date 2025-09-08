import { Dimensions, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import ThemedSafeAreaView from "../components/Themed/ThemedSafeAreaView";
import ThemedText from "../components/Themed/ThemedText";
import FriendSearch from "../components/FriendsScreen/FriendSearch";
import TabSelector from "../components/FriendsScreen/Tab/TabSelector";
import ListOfFriends from "../components/FriendsScreen/ListOfFriends";
import ListOfAskings from "../components/FriendsScreen/ListOfAskings";
import { useRoute } from "@react-navigation/native";
const { width, height } = Dimensions.get("window");

const FriendsScreen = () => {
  const [tab, setTab] = useState("friends");
  const route = useRoute();
  const { userId } = route.params;
  return (
    <ThemedSafeAreaView style={styles.friendsScreenContainer}>
      {/* <ThemedText style={styles.friendsScreenTitle} type="title">
        Amis
      </ThemedText> */}
      <FriendSearch />
      <TabSelector setTab={setTab} tab={tab} />
      {tab === "friends" ? (
        <ListOfFriends user_id={userId} />
      ) : (
        <ListOfAskings user_id={userId} />
      )}
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
