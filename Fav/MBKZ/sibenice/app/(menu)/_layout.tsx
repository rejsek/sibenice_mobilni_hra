import { Slot, SplashScreen } from "expo-router";

SplashScreen.preventAutoHideAsync()

const Menu = () => {
  return <Slot />;
}

export default Menu