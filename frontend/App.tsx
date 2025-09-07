import "react-native-url-polyfill/auto";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Touchable,
  TouchableOpacity,
} from "react-native";
import { Session } from "@supabase/supabase-js";
import { darkTheme, lightTheme } from "./themes/themes";
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LoginScreen from "./screens/Auth/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import TabBar from "./components/TabBar"; // 👈 import corrigé
import CalendarScreen from "./screens/CalendarScreen";
import { Alert } from "react-native";
import RegisterScreen from "./screens/Auth/RegisterScreen";
import AddExamScreen from "./screens/AddExamScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { ThemeContext, ThemeProvider } from "./context/ThemeContext";
import { useContext } from "react";
import ProfileScreen from "./screens/ProfileScreen";
import { fetchUserId } from "./functions/functions";
import FriendsScreen from "./screens/FriendsScreen";
import RegisterStep1Screen from "./screens/Auth/Register/RegisterStep1Screen";
import RegisterStep2Screen from "./screens/Auth/Register/RegisterStep2Screen";

// --- Définition des types de navigation ---
export type RootStackParamList = {
  Connexion: undefined;
};

export type RootTabParamList = {
  home: undefined;
  add: undefined;
  profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

// --- Tabs visibles après connexion ---
function MainTabs() {
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    async function fetchUid() {
      const uid = await fetchUserId();
      setUserId(uid);
    }
    fetchUid();
  });

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
        component={FriendsScreen}
        options={{ tabBarLabel: "Amis" }}
        initialParams={{ userId: userId }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profil" }}
        initialParams={{ userId: userId }}
      />
    </Tab.Navigator>
  );
}

// --- App principale ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const { theme, setMode, mode } = useContext(ThemeContext);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setIsLoggedIn(true);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setIsLoggedIn(!!session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <ThemeProvider>
      <NavigationContainer>
        {isLoggedIn ? (
          <MainTabs />
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="Connexion"
              component={LoginScreen}
              options={{ animation: "none" }}
            />
            <Stack.Screen
              name="RegisterStep1"
              component={RegisterStep1Screen}
              options={{ animation: "none" }}
            />
            <Stack.Screen
              name="RegisterStep2"
              component={RegisterStep2Screen}
              options={{ animation: "none" }}
            />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({});
