import React, { useContext, useEffect, useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Touchable,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { fetchUserId } from "../../functions/user";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import { useAlert } from "../CustomAlertService";

const { width, height } = Dimensions.get("window");

export default function FriendSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visitorId, setVisitorId] = useState("");
  const [userId, setUserId] = useState("");
  const { theme } = useContext(ThemeContext);
  const { showAlert } = useAlert();

  useEffect(() => {
    async function fetchVisitorId() {
      const id = await fetchUserId();
      setVisitorId(id);
    }
    fetchVisitorId();
  }, []);

  const checkFriendship = async (userId1, userId2) => {
    const { data, error } = await supabase
      .from("Friendships")
      .select("requester, addressee, status")
      .or(
        `and(requester.eq.${userId1},addressee.eq.${userId2}),and(requester.eq.${userId2},addressee.eq.${userId1})`
      )
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(error.message);
    }

    if (!data) {
      return { areFriends: false, requestPending: false };
    }

    if (data.status === "accepted") {
      return { areFriends: true, requestPending: false };
    }

    if (data.status === "pending") {
      return { areFriends: false, requestPending: true };
    }

    return { areFriends: false, requestPending: false };
  };

  const handleFriendRequest = async (userId, targetUserId) => {
    const { data, error } = await supabase
      .from("Friendships")
      .select("id, requester, addressee, status")
      .or(
        `and(requester.eq.${userId},addressee.eq.${targetUserId}),and(requester.eq.${targetUserId},addressee.eq.${userId})`
      )
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      await showAlert({
        type: "error",
        title: "Erreur",
        message: error.message,
        buttons: [{ text: "OK", value: true }],
      });
      return;
    }

    if (!data) {
      // Pas de relation existante : créer une demande
      const { error: insertError } = await supabase.from("Friendships").insert([
        {
          requester: userId,
          addressee: targetUserId,
          status: "pending",
        },
      ]);

      if (insertError) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message: error.message,
          buttons: [{ text: "OK", value: true }],
        });
      } else {
        await showAlert({
          type: "success",
          title: "Succès",
          message: "Demande d'amis envoyée !",
          buttons: [{ text: "OK", value: true }],
        });
      }
      return;
    }

    // Relation existante
    if (data.status === "accepted") {
      await showAlert({
        type: "info",
        title: "Information",
        message: "Vous êtes déjà amis",
        buttons: [{ text: "OK", value: true }],
      });
      return;
    }

    if (data.status === "pending") {
      if (data.requester === targetUserId) {
        // L'autre utilisateur a déjà envoyé une demande : accepter
        const { error: updateError } = await supabase
          .from("Friendships")
          .update({ status: "accepted" })
          .eq("id", data.id);

        if (updateError) {
          await showAlert({
            type: "error",
            title: "Erreur",
            message: updateError.message,
            buttons: [{ text: "OK", value: true }],
          });
        } else {
          await showAlert({
            type: "success",
            title: "Succès",
            message: "Demande d'ami acceptée !",
            buttons: [{ text: "OK", value: true }],
          });
        }
      } else {
        await showAlert({
          type: "info",
          title: "Information",
          message: "Votre demande est déjà en attente.",
          buttons: [{ text: "OK", value: true }],
        });
      }
    }
  };

  const searchUser = async () => {
    if (!query) return;
    setLoading(true);
    try {
      if (!visitorId) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message: "Identifiant visiteur introuvable. Réessayez plus tard.",
          buttons: [{ text: "OK", value: true }],
        });
        return;
      }

      // Récupérer l'id courant (local var)
      const { data: currentUserData, error: currentUserError } = await supabase
        .from("User_providers")
        .select("user_id")
        .eq("provider_user_id", visitorId)
        .single();

      if (currentUserError) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message: currentUserError.message,
          buttons: [{ text: "OK", value: true }],
        });
        return;
      }

      const currentUserId = currentUserData.user_id;
      setUserId(currentUserId); // on peut toujours mettre l'état pour l'UI

      // Chercher l'utilisateur par username
      const { data, error } = await supabase
        .from("Users")
        .select("id, username, name, surname")
        .eq("username", query)
        .neq("id", currentUserId);

      if (error) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message: error,
          buttons: [{ text: "OK", value: true }],
        });
        return;
      }

      if (!data || data.length === 0) {
        await showAlert({
          type: "error",
          title: "Erreur",
          message: "Utilisateur introuvable.",
          buttons: [{ text: "OK", value: true }],
        });
        return;
      }

      setResults(data);
      const targetId = data[0].id;

      const userFriendships = await checkFriendship(currentUserId, targetId);

      if (userFriendships.areFriends) {
        await showAlert({
          type: "info",
          title: "Information",
          message: "Vous êtes déjà amis.",
          buttons: [{ text: "OK", value: true }],
        });
        return;
      } else if (userFriendships.requestPending) {
        // handleFriendRequest utilise déjà des paramètres, on lui passe currentUserId
        await handleFriendRequest(currentUserId, targetId);
        return;
      }

      await addFriend(currentUserId, targetId);
    } catch (err) {
      Alert.alert("Erreur", err.message ?? String(err));
      await showAlert({
        type: "error",
        title: "Erreur",
        message: err.message ?? String(err),
        buttons: [{ text: "OK", value: true }],
      });
    } finally {
      setLoading(false);
    }
  };

  // Et modifie addFriend pour accepter requesterId
  const addFriend = async (requesterId, targetUserId) => {
    if (!requesterId) {
      await showAlert({
        type: "error",
        title: "Erreur",
        message: "Identifiant utilisateur manquant.",
        buttons: [{ text: "OK", value: true }],
      });
      return;
    }
    if (!targetUserId) {
      Alert.alert("Erreur", "Identifiant de la cible manquant.");
      await showAlert({
        type: "error",
        title: "Erreur",
        message: "Identifiants de l'utilisateur cible manquants.",
        buttons: [{ text: "OK", value: true }],
      });
      return;
    }

    const { data, error } = await supabase.from("Friendships").insert([
      {
        requester: requesterId,
        addressee: targetUserId,
        status: "pending", // mieux garder la cohérence
      },
    ]);

    if (error) {
      await showAlert({
        type: "success",
        title: "Succès",
        message: "Requête rejetée",
        buttons: [{ text: "OK", value: true }],
      });
    } else {
      await showAlert({
        type: "success",
        title: "Succès",
        message: "Demande d'ami envoyée !",
        buttons: [{ text: "OK", value: true }],
      });
    }
  };
  return (
    <View style={styles.container}>
      <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
        <TextInput
          style={[styles.input, { color: theme.textprimary }]}
          placeholder="Chercher un nom d'utilisateur..."
          placeholderTextColor={theme.textprimary}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />

        <TouchableOpacity onPress={searchUser} disabled={loading}>
          <Ionicons name="search" size={height * 0.04} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  searchBar: {
    flexDirection: "row",
    width: width * 0.9,
    height: height * 0.08,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderRadius: 30,
  },
  input: {
    maxWidth: "85%",
  },
});
