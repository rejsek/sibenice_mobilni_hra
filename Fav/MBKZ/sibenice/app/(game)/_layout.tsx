import { Slot, SplashScreen } from "expo-router";

SplashScreen.preventAutoHideAsync()

const GameScreen = () => {
  return <Slot />;
}

export default GameScreen