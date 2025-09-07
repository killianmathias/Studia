import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import ThemedText from "../Themed/ThemedText";
import { supabase } from "../../lib/supabase";
import { fetchUserIdFromUsers } from "../../functions/functions";
import { ThemeContext } from "../../context/ThemeContext";

const { height, width } = Dimensions.get("window");

const Item = ({ title, theme }) => (
  <View style={[styles.item, { backgroundColor: theme.surface }]}>
    <ThemedText type="paragraph" style={styles.text}>
      {title}
    </ThemedText>
  </View>
);
const ListOfAskings = ({ user_id }) => {
  const [askings, setAskings] = useState([]);
  const [userId, setUserId] = useState("");

  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    async function fetchUserId() {
      const id = await fetchUserIdFromUsers(user_id);
      console.log(id);
      setUserId(id);
    }
    fetchUserId();
  }, [user_id]);
  useEffect(() => {
    async function fetchAskings() {
      const { data, error } = await supabase
        .from("Friendships")
        .select("requester")
        .eq("addressee", userId);

      if (error) {
        Alert.alert("Une erreur est survenue", error.message);
        return;
      }

      let requesters = data?.map((r) => r.requester) || [];

      const { data: askingData, error: askingError } = await supabase
        .from("Users")
        .select("*")
        .in("id", requesters);

      if (askingError) {
        Alert.alert("Une erreur est survenue", askingError.message);
        return;
      }
      setAskings(askingData);
    }

    if (typeof userId === "string" && userId.trim() !== "") {
      fetchAskings();
    }
  }, [userId]);
  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Utilisateurs en attente
      </ThemedText>
      <FlatList
        data={askings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Item title={item.username || item.email} theme={theme} />
        )}
      />
    </View>
  );
};

export default ListOfAskings;

const styles = StyleSheet.create({
  container: {
    height: height * 0.6,
    width: width * 0.9,
    justifyContent: "center",
    alignItems: "center",
  },
  item: {
    width: 0.9 * width,
    height: height * 0.06,
    borderRadius: 15,
    justifyContent: "space-around",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  text: {
    color: "black",
  },
});
