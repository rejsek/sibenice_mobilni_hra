import { useState, useEffect } from "react";
import { View, Text, Switch, Alert, ScrollView, SafeAreaView, Modal, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function Settings() {
  const router = useRouter();
  
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [timeLimit, setTimeLimit] = useState("60");
  const [limitAttempts, setLimitAttempts] = useState(false);
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedMusic = await AsyncStorage.getItem("musicEnabled");
        const storedSoundEffects = await AsyncStorage.getItem("soundEffectsEnabled");
        const storedVibration = await AsyncStorage.getItem("vibrationEnabled");
        const storedTheme = await AsyncStorage.getItem("theme");
        const storedTimeLimit = await AsyncStorage.getItem("timeLimit");
        const storedLimitAttempts = await AsyncStorage.getItem("limitAttempts");

        if (storedMusic !== null) setMusicEnabled(storedMusic === "true");
        if (storedSoundEffects !== null) setSoundEffectsEnabled(storedSoundEffects === "true");
        if (storedVibration !== null) setVibrationEnabled(storedVibration === "true");
        if (storedTheme !== null) setTheme(storedTheme);
        if (storedTimeLimit !== null) setTimeLimit(storedTimeLimit);
        if (storedLimitAttempts !== null) setLimitAttempts(storedLimitAttempts === "true");
      } catch (error) {
        console.error("Chyba při načítání nastavení:", error);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem("musicEnabled", musicEnabled.toString());
      await AsyncStorage.setItem("soundEffectsEnabled", soundEffectsEnabled.toString());
      await AsyncStorage.setItem("vibrationEnabled", vibrationEnabled.toString());
      await AsyncStorage.setItem("theme", theme);
      await AsyncStorage.setItem("timeLimit", timeLimit);
      await AsyncStorage.setItem("limitAttempts", limitAttempts.toString());
      Alert.alert("Nastavení", "Nastavení bylo úspěšně uloženo.");
    } catch (error) {
      console.error("Chyba při ukládání nastavení:", error);
    }
  };

  const resetProgress = async () => {
    try {
      await AsyncStorage.removeItem("score");
      setIsResetModalVisible(false);
    } catch (error) {
      console.error("Chyba při resetování postupu:", error);
    }
  };

  const confirmReset = async () => {
    try {
      await AsyncStorage.removeItem("score");
      setIsResetModalVisible(false);
      setIsSuccessModalVisible(true);
    } catch (error) {
      console.error("Chyba při resetování postupu:", error);
    }
  };

  return (
    <SafeAreaView className={`flex-1 px-6 ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40, alignItems: "center", paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[350px] items-center">
          <Text className={`text-3xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-black"}`}>
            Nastavení
          </Text>
  
          {/* Přepínače s ikonami */}
          <View className={`w-full px-6 py-4 rounded-lg shadow-md mb-4 flex-row items-center ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}>
            <Icon name="music-note" size={24} color={theme === "dark" ? "#fff" : "#000"} style={{ marginRight: 10 }} />
            <Text className={`text-lg flex-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Hudba na pozadí
            </Text>
            <Switch value={musicEnabled} onValueChange={setMusicEnabled} />
          </View>
  
          <View className={`w-full px-6 py-4 rounded-lg shadow-md mb-4 flex-row items-center ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}>
            <Icon name="volume-up" size={24} color={theme === "dark" ? "#fff" : "#000"} style={{ marginRight: 10 }} />
            <Text className={`text-lg flex-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Zvukové efekty
            </Text>
            <Switch value={soundEffectsEnabled} onValueChange={setSoundEffectsEnabled} />
          </View>
  
          <View className={`w-full px-6 py-4 rounded-lg shadow-md mb-4 flex-row items-center ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}>
            <Icon name="vibration" size={24} color={theme === "dark" ? "#fff" : "#000"} style={{ marginRight: 10 }} />
            <Text className={`text-lg flex-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Vibrace
            </Text>
            <Switch value={vibrationEnabled} onValueChange={setVibrationEnabled} />
          </View>
  
          {/* Výběr tématu */}
          <View className={`w-full px-6 py-4 rounded-lg shadow-md mb-4 ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}>
            <Text className={`text-lg mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Barevné téma
            </Text>
            
            <Picker
              selectedValue={theme}
              onValueChange={setTheme}
              style={{
                backgroundColor: theme === "dark" ? "#4B5563" : "#E5E7EB",
              }}
              itemStyle={{
                color: theme === "dark" ? "white" : "black",
              }}
            >
              <Picker.Item label="Světlé" value="light" color={theme === "dark" ? "white" : "black"} />
              <Picker.Item label="Tmavé" value="dark" color={theme === "dark" ? "white" : "black"} />
            </Picker>

          </View>
  
          {/* Časový limit */}
          <View className={`w-full px-6 py-4 rounded-lg shadow-md mb-4 ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}>
            <Text className={`text-lg mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Časový limit na odpověď
            </Text>
            <Picker
              selectedValue={timeLimit}
              onValueChange={setTimeLimit}
              style={{
                backgroundColor: theme === "dark" ? "#4B5563" : "#E5E7EB",
              }}
              itemStyle={{
                color: theme === "dark" ? "white" : "black",
              }}
            >
              <Picker.Item label="5 sekund" value="5" />
              <Picker.Item label="30 sekund" value="30" />
              <Picker.Item label="60 sekund" value="60" />
              <Picker.Item label="Bez limitu" value="none" />
            </Picker>
          </View>
  
          {/* Omezení pokusů */}
          <View className={`w-full px-6 py-4 rounded-lg shadow-md mb-4 flex-row items-center ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}>
            <Icon name="lock" size={24} color={theme === "dark" ? "#fff" : "#000"} style={{ marginRight: 10 }} />
            <Text className={`text-lg flex-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Omezení pokusů
            </Text>
            <Switch value={limitAttempts} onValueChange={setLimitAttempts} />
          </View>
  
          {/* Tlačítka */}
          <TouchableOpacity
            onPress={saveSettings}
            className="bg-green-600 px-6 py-4 rounded-xl shadow-lg w-full mb-4 flex-row justify-center items-center"
          >
            <Icon name="save" size={24} color="white" />
            <Text className="text-white text-xl font-semibold ml-2">Uložit nastavení</Text>
          </TouchableOpacity>
  
          <TouchableOpacity
            onPress={() => setIsResetModalVisible(true)}
            className="bg-red-600 px-6 py-4 rounded-xl shadow-lg w-full mb-4 flex-row justify-center items-center"
          >
            <Icon name="refresh" size={24} color="white" />
            <Text className="text-white text-xl font-semibold ml-2">Resetovat postup</Text>
          </TouchableOpacity>
  
          <TouchableOpacity
            onPress={() => router.back()}
            className={`px-6 py-4 rounded-xl shadow-lg w-full flex-row justify-center items-center ${theme === "dark" ? "bg-gray-600" : "bg-gray-300"}`}
          >
            <Icon name="arrow-back" size={24} color="white" />
            <Text className="text-white text-xl font-semibold ml-2">Zpět</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );  
}
