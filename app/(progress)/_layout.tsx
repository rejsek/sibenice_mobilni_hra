import { Slot, SplashScreen } from "expo-router";

SplashScreen.preventAutoHideAsync()

const ProgressScreen = () => {
  return <Slot />;
}

export default ProgressScreen