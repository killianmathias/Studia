import { useAudioPlayer } from "expo-audio";
export async function playSound() {
  const audioSource = require("./assets/sounds/notification.mp3");
  const player = useAudioPlayer(audioSource);
  player.play();
}
