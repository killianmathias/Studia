import { Feather } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";

export const icon = {
  home: (props: any) => <Feather name="home" size={24} {...props} />,
  profile: (props: any) => <Feather name="user" size={24} {...props} />,
  explore: (props: any) => <Feather name="compass" size={24} {...props} />,
};
