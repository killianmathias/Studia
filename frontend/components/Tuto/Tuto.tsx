import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Button,
  Alert,
  TextInput,
  TouchableOpacity,
  Switch,
} from "react-native";
import React, { useContext, useState } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { FlatList } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");

const Tuto = () => {
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);
  const [pseudo, setPseudo] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  function load() {
    setLoading(true);
  }

  function stopLoading() {
    setLoading(false);
  }
  return (
    <View style={[styles.view, { backgroundColor: theme.surface }]}>
      {loading ? <ActivityIndicator size={"large"} /> : <></>}
      <Button title="Charger" onPress={loading ? stopLoading : load} />
      <TouchableOpacity onPress={() => setCounter(counter + 1)}>
        <Text style={{ color: "white" }}>{counter}</Text>
      </TouchableOpacity>
      <TextInput
        value={pseudo}
        onChangeText={setPseudo}
        style={{ backgroundColor: "white", width: width * 0.7 }}
      />
      <Text style={{ color: "white" }}>{pseudo}</Text>

      <Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
    </View>
  );
};

export default Tuto;

const styles = StyleSheet.create({
  view: {
    backgroundColor: "red",
    height: 200,
    marginTop: 30,
    width: width,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
});
