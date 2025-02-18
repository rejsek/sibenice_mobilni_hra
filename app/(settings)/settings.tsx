import { useState, useEffect } from "react";
import { View, Text, Switch, TouchableOpacity, Alert, ScrollView, SafeAreaView, Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

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
      await AsyncStorage.removeItem("score"); // Smazání skóre
      setIsResetModalVisible(false); // Zavření modálního okna
    } catch (error) {
      console.error("Chyba při resetování postupu:", error);
    }
  };

  const confirmReset = async () => {
    try {
      await AsyncStorage.removeItem("score"); // Smazání skóre
      setIsResetModalVisible(false); // Zavření potvrzovacího okna
      setIsSuccessModalVisible(true); // Zobrazení úspěšné hlášky
    } catch (error) {
      console.error("Chyba při resetování postupu:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-800 px-6">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40,
          alignItems: "center",
          paddingTop: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* MODÁLNÍ OKNO PRO POTVRZENÍ RESETU */}
        <Modal visible={isResetModalVisible} animationType="fade" transparent={true}>
            <View className="flex-1 justify-center items-center bg-black/70">
            <View className="bg-white p-6 rounded-lg w-4/5">
                <Text className="text-black text-xl font-bold mb-4 text-center">Resetovat postup</Text>
                <Text className="text-gray-700 text-lg mb-6 text-center">
                Opravdu chcete resetovat celý postup hrou?
                </Text>
                <View className="flex-row justify-between">
                <TouchableOpacity 
                    className="bg-gray-400 px-4 py-2 rounded-lg flex-1 mr-2" 
                    onPress={() => setIsResetModalVisible(false)}
                >
                    <Text className="text-white text-lg font-semibold text-center">Zrušit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    className="bg-blue-600 px-4 py-2 rounded-lg flex-1 ml-2" 
                    onPress={confirmReset}
                >
                    <Text className="text-white text-lg font-semibold text-center">Ano</Text>
                </TouchableOpacity>
                </View>
            </View>
            </View>
        </Modal>

        {/* MODÁLNÍ OKNO PRO POTVRZENÍ ÚSPĚŠNÉHO RESETU */}
        <Modal visible={isSuccessModalVisible} animationType="fade" transparent={true}>
            <View className="flex-1 justify-center items-center bg-black/70">
            <View className="bg-white p-6 rounded-lg w-4/5">
                <Text className="text-green-600 text-xl font-bold mb-4 text-center">Úspěšně resetováno</Text>
                <Text className="text-gray-700 text-lg mb-6 text-center">
                Herní postup byl úspěšně resetován.
                </Text>
                <TouchableOpacity 
                className="bg-blue-600 px-4 py-2 rounded-lg w-full" 
                onPress={() => setIsSuccessModalVisible(false)}
                >
                <Text className="text-white text-lg font-semibold text-center">OK</Text>
                </TouchableOpacity>
            </View>
            </View>
        </Modal>
  
        <View className="w-full max-w-[350px] items-center">
          <Text className="text-white text-2xl font-bold mb-6">Nastavení</Text>
  
          {/* Přepínač hudby na pozadí */}
          <View className="w-full bg-gray-700 px-6 py-4 rounded-lg shadow-md mb-4">
            <Text className="text-gray-300 text-lg mb-2">Hudba na pozadí</Text>
            <Switch value={musicEnabled} onValueChange={setMusicEnabled} />
          </View>
  
          {/* Přepínač zvukových efektů */}
          <View className="w-full bg-gray-700 px-6 py-4 rounded-lg shadow-md mb-4">
            <Text className="text-gray-300 text-lg mb-2">Zvukové efekty</Text>
            <Switch value={soundEffectsEnabled} onValueChange={setSoundEffectsEnabled} />
          </View>
  
          {/* Přepínač vibrací */}
          <View className="w-full bg-gray-700 px-6 py-4 rounded-lg shadow-md mb-4">
            <Text className="text-gray-300 text-lg mb-2">Vibrace</Text>
            <Switch value={vibrationEnabled} onValueChange={setVibrationEnabled} />
          </View>
  
          {/* Barevné téma */}
          <View className="w-full bg-gray-700 px-6 py-4 rounded-lg shadow-md mb-4">
            <Text className="text-gray-300 text-lg mb-2">Barevné téma</Text>
            <Picker selectedValue={theme} onValueChange={setTheme} style={{ color: "white", backgroundColor: "gray" }}>
              <Picker.Item label="Světlé" value="light" />
              <Picker.Item label="Tmavé" value="dark" />
            </Picker>
          </View>
  
          {/* Časový limit */}
          <View className="w-full bg-gray-700 px-6 py-4 rounded-lg shadow-md mb-4">
            <Text className="text-gray-300 text-lg mb-2">Časový limit na odpověď</Text>
            <Picker selectedValue={timeLimit} onValueChange={setTimeLimit} style={{ color: "white", backgroundColor: "gray" }}>
              <Picker.Item label="5 sekund" value="5" />
              <Picker.Item label="30 sekund" value="30" />
              <Picker.Item label="60 sekund" value="60" />
              <Picker.Item label="Bez limitu" value="none" />
            </Picker>
          </View>
  
          {/* Omezení počtu pokusů na písmeno */}
          <View className="w-full bg-gray-700 px-6 py-4 rounded-lg shadow-md mb-4">
            <Text className="text-gray-300 text-lg mb-2">Omezení počtu pokusů na písmeno</Text>
            <Switch value={limitAttempts} onValueChange={setLimitAttempts} />
          </View>
  
          {/* Tlačítko na resetování postupu */}
          <TouchableOpacity
            onPress={() => setIsResetModalVisible(true)}
            className="bg-red-600 px-6 py-4 rounded-xl shadow-lg shadow-black mb-4 w-full active:bg-red-800"
          >
            <Text className="text-white text-xl font-semibold uppercase tracking-wider text-center">
              Resetovat postup
            </Text>
          </TouchableOpacity>
  
          {/* Tlačítko pro uložení nastavení */}
          <TouchableOpacity
            onPress={saveSettings}
            className="bg-green-600 px-6 py-4 rounded-xl shadow-lg shadow-black mb-4 w-full active:bg-green-800"
          >
            <Text className="text-white text-xl font-semibold uppercase tracking-wider text-center">
              Uložit nastavení
            </Text>
          </TouchableOpacity>
  
          {/* Tlačítko pro návrat */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-gray-600 px-6 py-4 rounded-xl shadow-lg shadow-black w-full active:bg-gray-800"
          >
            <Text className="text-white text-xl font-semibold uppercase tracking-wider text-center">
              Zpět
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );  
}
