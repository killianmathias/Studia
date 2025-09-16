import "react-native-url-polyfill/auto";
import { useState, useEffect, useContext } from "react";
import { supabase } from "./lib/supabase";
import { StyleSheet } from "react-native";
import { Session } from "@supabase/supabase-js";
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CompleteSignUpScreen from "./screens/Auth/CompleteSignUpScreen";

// Screens
import LoginScreen from "./screens/Auth/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import CalendarScreen from "./screens/CalendarScreen";
import AddExamScreen from "./screens/AddExamScreen";
import ProfileScreen from "./screens/ProfileScreen";
import FriendsScreen from "./screens/FriendsScreen";
import RegisterStep1Screen from "./screens/Auth/Register/RegisterStep1Screen";
import RegisterStep2Screen from "./screens/Auth/Register/RegisterStep2Screen";

// Components
import TabBar from "./components/TabBar";

// Context & utils
import { ThemeContext, ThemeProvider } from "./context/ThemeContext";
import { fetchUserId, verifyProfileCompletion } from "./functions/functions";
import OtherProfileScreen from "./screens/OtherProfileScreen";
import { CustomAlertProvider } from "./components/CustomAlertService";

// --- Définition des types ---
export type RootStackParamList = {
  Connexion: undefined;
  RegisterStep1: undefined;
  RegisterStep2: undefined;
  MainTabs: undefined;
};

export type RootTabParamList = {
  home: undefined;
  calendar: undefined;
  add: undefined;
  friends: { userId: string | null };
  profile: { userId: string | null };
};

export type FriendsStackParamList = {
  Friends: { userId: string | null };
  OtherUsers: { userId: string | null };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();
const FriendsStack = createNativeStackNavigator<FriendsStackParamList>();

// --- Stack imbriqué pour les amis ---
function FriendsNavigator({ route }) {
  const { userId } = route.params;

  return (
    <FriendsStack.Navigator screenOptions={{ headerShown: false }}>
      <FriendsStack.Screen
        name="Friends"
        component={FriendsScreen}
        initialParams={{ userId }}
      />
      <FriendsStack.Screen
        name="OtherUsers"
        component={OtherProfileScreen}
        initialParams={{ userId }}
      />
    </FriendsStack.Navigator>
  );
}

// --- Tabs visibles après connexion ---
function MainTabs() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    async function fetchUid() {
      const uid = await fetchUserId();
      setUserId(uid);
      console.log(userId);
    }
    fetchUid();
  }, []); // 👈 tableau de dépendances vide

  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{ tabBarLabel: "Accueil" }}
      />
      <Tab.Screen
        name="calendar"
        component={CalendarScreen}
        options={{ tabBarLabel: "Calendrier" }}
      />
      <Tab.Screen
        name="add"
        component={AddExamScreen}
        options={{ tabBarLabel: "Ajouter" }}
      />
      <Tab.Screen
        name="friends"
        component={FriendsNavigator}
        options={{ tabBarLabel: "Amis" }}
        initialParams={{ userId }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profil" }}
        initialParams={{ userId }}
      />
    </Tab.Navigator>
  );
}

// --- App principale ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const { theme } = useContext(ThemeContext);
  const [session, setSession] = useState<Session | null>(null);

  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    let userSubscription: any;

    async function init() {
      // Vérifier la session initiale
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      setSession(session);
      setIsLoggedIn(!!session);

      if (session?.user?.id) {
        const userId = session.user.id;

        // Étape 1 : récupérer le profil
        const { data: user, error } = await supabase
          .from("User_providers")
          .select("*")
          .eq("provider_user_id", userId)
          .maybeSingle();

        if (error) {
          console.error("Erreur lors de la récupération du profil:", error);
        }

        setIsProfileComplete(!!user);

        // Étape 2 : abonnement Realtime sur Users
        userSubscription = supabase
          .from(`User_providers:provider_user_id=eq.${userId}`)
          .on("INSERT", (payload) => {
            const updatedUser = payload.new;
            setIsProfileComplete(!!updatedUser);
          })
          .on("UPDATE", (payload) => {
            const updatedUser = payload.new;
            setIsProfileComplete(updatedUser);
          })
          .subscribe();
      }
    }

    init();

    // Écouter les changements de session Auth
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setIsLoggedIn(!!session);

        if (session?.user?.id) {
          const userId = session.user.id;

          const { data: user, error } = await supabase
            .from("User_providers")
            .select("*")
            .eq("provider_user_id", userId)
            .maybeSingle();

          if (error) {
            console.error(
              "Erreur lors du check profil après AuthChange:",
              error
            );
          }

          setIsProfileComplete(user);
        }
      }
    );
    console.log(session?.user.user_metadata);
    return () => {
      authListener.subscription.unsubscribe();
      if (userSubscription) supabase.removeSubscription(userSubscription);
    };
  }, []);

  return (
    <ThemeProvider>
      <CustomAlertProvider>
        <NavigationContainer>
          {isLoggedIn && isProfileComplete ? (
            <MainTabs />
          ) : (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Connexion" component={LoginScreen} />
              <Stack.Screen
                name="RegisterStep1"
                component={RegisterStep1Screen}
              />
              <Stack.Screen
                name="RegisterStep2"
                component={RegisterStep2Screen}
              />
              <Stack.Screen name="MainTabs" component={MainTabs} />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </CustomAlertProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({});
