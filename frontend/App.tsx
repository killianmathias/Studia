import "react-native-url-polyfill/auto";
import { useState, useEffect, useContext } from "react";
import { supabase } from "./lib/supabase";
import { StyleSheet } from "react-native";
import { Session } from "@supabase/supabase-js";
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";

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
import { verifyProfileCompletion } from "./functions/functions";
import { fetchUserId } from "./functions/user";
import OtherProfileScreen from "./screens/OtherProfileScreen";
import { CustomAlertProvider } from "./components/CustomAlertService";
import ThemedText from "./components/Themed/ThemedText";
import EventDetailScreen from "./screens/EventDetailScreen";
import { useAppStore } from "./store/useAppStore";

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
export type HomeStackParamList = {
  Home: undefined;
  EventDetail: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();
const FriendsStack = createNativeStackNavigator<FriendsStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

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

function HomeNavigator({ route }) {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        initialParams={{ item: null }}
      />
    </HomeStack.Navigator>
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
        component={HomeNavigator}
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
  const { theme } = useContext(ThemeContext);
  const [session, setSession] = useState<Session | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const loading = useAppStore((s) => s.loading);
  const load = useAppStore((s) => s.load);
  const stopLoad = useAppStore((s) => s.stopLoad);

  useEffect(() => {
    let subscription: any;
    load();
    async function init() {
      // 1. Vérifier la session initiale
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      // 2. Charger profil si déjà connecté
      if (data.session?.user?.id) {
        await checkUserProfile(data.session.user.id);
      }
      stopLoad();
    }

    // Fonction séparée pour vérifier le profil
    async function checkUserProfile(userId: string) {
      const { data: user, error } = await supabase
        .from("User_providers")
        .select("*")
        .eq("provider_user_id", userId)
        .maybeSingle();

      if (error) console.error("Erreur profil:", error);

      setIsProfileComplete(!!user);
    }

    init();

    // 3. Ecouter les changements d’auth
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user?.id) {
          await checkUserProfile(newSession.user.id);
        } else {
          setIsProfileComplete(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
      if (subscription) supabase.removeSubscription(subscription);
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ThemedText type="subtitle">Chargement...</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <ThemeProvider>
      <CustomAlertProvider>
        <NavigationContainer>
          {session && isProfileComplete ? (
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
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </CustomAlertProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({});
