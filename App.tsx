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

async function logOut() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user != null) {
    let { error } = supabase.auth.signOut();
    if (error) Alert.alert(error.message);
  }
}
// --- Screens ---
function ProfileScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Profil</Text>
      <TouchableOpacity onPress={() => logOut()}>
        <Text>Se Déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

function AddScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Ajouter quelque chose 🚀</Text>
    </View>
  );
}

// --- Tabs visibles après connexion ---
function MainTabs() {
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
        component={AddScreen}
        options={{ tabBarLabel: "Ajouter" }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profil" }}
      />
      <Tab.Screen
        name="settings"
        component={ProfileScreen}
        options={{ tabBarLabel: "Réglages" }}
      />
    </Tab.Navigator>
  );
}

// --- App principale ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const scheme = useColorScheme();
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
            name="Register"
            component={RegisterScreen}
            options={{ animation: "none" }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
