import React, { useState, ReactNode, createContext, useContext } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
const { height } = Dimensions.get("window");

const { width } = Dimensions.get("window");

export type AlertButton = {
  text: string;
  value: any;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export type AlertType = "success" | "error" | "confirm" | "info";

type AlertParams = {
  type?: AlertType;
  title?: string;
  message: string;
  buttons: AlertButton[];
};

type AlertContextType = {
  showAlert: (params: AlertParams) => Promise<any>;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context)
    throw new Error("useAlert must be used within CustomAlertProvider");
  return context;
};

type Props = {
  children: ReactNode;
};

export const CustomAlertProvider: React.FC<Props> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string>("");
  const [buttons, setButtons] = useState<AlertButton[]>([]);
  const [resolveCallback, setResolveCallback] = useState<
    ((value: any) => void) | null
  >(null);
  const [alertType, setAlertType] = useState<AlertType>("confirm");

  const { theme } = useContext(ThemeContext);

  const showAlert = ({
    type = "confirm",
    title,
    message,
    buttons,
  }: AlertParams) => {
    return new Promise<any>((resolve) => {
      setAlertType(type);
      setTitle(title);
      setMessage(message);
      setButtons(buttons);
      setResolveCallback(() => resolve);
      setVisible(true);
    });
  };

  const handlePress = (value: any) => {
    if (resolveCallback) resolveCallback(value);
    setVisible(false);
  };

  const getContainerStyle = () => {
    switch (alertType) {
      case "success":
        return { borderLeftWidth: 6, borderLeftColor: theme.success };
      case "error":
        return { borderLeftWidth: 6, borderLeftColor: theme.error };
      case "confirm":
      case "info":
      default:
        return { borderLeftWidth: 6, borderLeftColor: theme.primary };
    }
  };

  const getTitleColor = () => {
    switch (alertType) {
      case "success":
        return theme.success;
      case "error":
        return theme.error;
      default:
        return theme.primary;
    }
  };
  const getIcon = () => {
    switch (alertType) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "close-circle";
      case "info":
        return "information-circle";
      default:
        return "help-circle";
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal transparent animationType="fade" visible={visible}>
        <View style={styles.overlay}>
          <View
            style={[
              styles.container,
              { backgroundColor: theme.background },
              getContainerStyle(),
            ]}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={getIcon()} size={32} color={getTitleColor()} />
            </View>

            {title && (
              <Text style={[styles.title, { color: getTitleColor() }]}>
                {title}
              </Text>
            )}
            <Text style={[styles.message, { color: theme.textprimary }]}>
              {message}
            </Text>
            <View style={styles.buttonContainer}>
              {buttons.map((btn, idx) => (
                <Pressable
                  key={idx}
                  style={[styles.button, btn.style]}
                  onPress={() => handlePress(btn.value)}
                >
                  <Text style={[styles.buttonText, btn.textStyle]}>
                    {btn.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: width * 0.8,
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
    backgroundColor: "#007AFF",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  iconContainer: {
    marginBottom: height * 0.02,
  },
});
