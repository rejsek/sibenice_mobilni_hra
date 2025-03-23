import { useState, useEffect } from "react";
import { View, Text, Switch, Alert, ScrollView, SafeAreaView, Modal, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";

/**
 * Obrazovka nastaveni - umoznuje upravit zvuk, vibrace, tema a dalsi herni preference.
 */
export default function Settings() {
  const router = useRouter();

  // Stav jednotliveho nastaveni
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [timeLimit, setTimeLimit] = useState("60");
  const [limitAttempts, setLimitAttempts] = useState(false);

  // Stav modalu a zmen
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  // Nacteni nastaveni ze storage pri prvnim renderu
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
        console.error("Chyba pri nacitani nastaveni:", error);
      }
    };

    loadSettings();
  }, []);

  // Ulozeni aktualniho nastaveni do storage
  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem("musicEnabled", musicEnabled.toString());
      await AsyncStorage.setItem("soundEffectsEnabled", soundEffectsEnabled.toString());
      await AsyncStorage.setItem("vibrationEnabled", vibrationEnabled.toString());
      await AsyncStorage.setItem("theme", theme);
      await AsyncStorage.setItem("timeLimit", timeLimit);
      await AsyncStorage.setItem("limitAttempts", limitAttempts.toString());

      Alert.alert("Nastavení", "Nastavení bylo úspěšně uloženo.");
      setIsChanged(false);
    } catch (error) {
      console.error("Chyba pri ukladani nastaveni:", error);
    }
  };

  // Reset postupu hrace
  const confirmReset = async () => {
    try {
      await AsyncStorage.removeItem("score");
      setIsResetModalVisible(false);
      setIsSuccessModalVisible(true);
    } catch (error) {
      console.error("Chyba pri resetovani postupu:", error);
    }
  };

  // Vystraha pri odchodu se zmenami
  const handleBackPress = () => {
    if (isChanged) {
      Alert.alert(
        "Neuložené změny",
        "Neuložil/a jsi změny, opravdu chceš odejít?",
        [
          { text: "Zůstat", style: "cancel" },
          { text: "Odejít", onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className={`flex-1 px-6 ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40, alignItems: "center", paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* MODAL: potvrzeni resetu */}
        <Modal visible={isResetModalVisible} animationType="fade" transparent>
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
                  className="bg-red-600 px-4 py-2 rounded-lg flex-1 ml-2"
                  onPress={confirmReset}
                >
                  <Text className="text-white text-lg font-semibold text-center">Ano</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL: uspesny reset */}
        <Modal visible={isSuccessModalVisible} animationType="fade" transparent>
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

        {/* HLAVICKA */}
        <View className="w-full max-w-[350px] items-center">
          <Text className={`text-3xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-black"}`}>
            Nastavení
          </Text>

          {/* PREPINACE: hudba, zvuk, vibrace */}
          {[
            {
              label: "Hudba na pozadí",
              icon: "music-note",
              value: musicEnabled,
              onChange: setMusicEnabled,
            },
            {
              label: "Zvukové efekty",
              icon: "volume-up",
              value: soundEffectsEnabled,
              onChange: setSoundEffectsEnabled,
            },
            {
              label: "Vibrace",
              icon: "vibration",
              value: vibrationEnabled,
              onChange: setVibrationEnabled,
            },
          ].map(({ label, icon, value, onChange }, index) => (
            <View
              key={index}
              className={`w-full px-6 py-4 rounded-lg mb-4 flex-row items-center ${
                theme === "dark" ? "bg-gray-800 shadow-md shadow-black" : "bg-gray-200"
              }`}
            >
              <Icon name={icon} size={24} color={theme === "dark" ? "#fff" : "#000"} style={{ marginRight: 10 }} />
              <Text className={`text-lg flex-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{label}</Text>
              <Switch
                value={value}
                onValueChange={(val) => {
                  onChange(val);
                  setIsChanged(true);
                }}
              />
            </View>
          ))}

          {/* VYBER: barevne tema */}
          <View className={`w-full px-6 py-4 rounded-lg mb-4 ${theme === "dark" ? "bg-gray-800 shadow-black shadow-md" : "bg-gray-200"}`}>
            <Text className={`text-lg mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Barevné téma</Text>
            <Picker
              selectedValue={theme}
              onValueChange={(value) => {
                setTheme(value);
                setIsChanged(true);
              }}
              style={{ backgroundColor: theme === "dark" ? "#4B5563" : "#E5E7EB" }}
              itemStyle={{ color: theme === "dark" ? "white" : "black" }}
            >
              <Picker.Item label="Světlé" value="light" />
              <Picker.Item label="Tmavé" value="dark" />
            </Picker>
          </View>

          {/* VYBER: casovy limit */}
          <View className={`w-full px-6 py-4 rounded-lg mb-4 ${theme === "dark" ? "bg-gray-800 shadow-black shadow-md" : "bg-gray-200"}`}>
            <Text className={`text-lg mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Časový limit na odpověď</Text>
            <Picker
              selectedValue={timeLimit}
              onValueChange={(value) => {
                setTimeLimit(value);
                setIsChanged(true);
              }}
              style={{ backgroundColor: theme === "dark" ? "#4B5563" : "#E5E7EB" }}
              itemStyle={{ color: theme === "dark" ? "white" : "black" }}
            >
              <Picker.Item label="5 sekund" value="5" />
              <Picker.Item label="30 sekund" value="30" />
              <Picker.Item label="60 sekund" value="60" />
              <Picker.Item label="Bez limitu" value="none" />
            </Picker>
          </View>

          {/* PREPINAC: omezeni pokusu */}
          <View className={`w-full px-6 py-4 rounded-lg mb-4 flex-row items-center ${theme === "dark" ? "bg-gray-800 shadow-md shadow-black" : "bg-gray-200"}`}>
            <Icon name="lock" size={24} color={theme === "dark" ? "#fff" : "#000"} style={{ marginRight: 10 }} />
            <Text className={`text-lg flex-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Omezení pokusů</Text>
            <Switch
              value={limitAttempts}
              onValueChange={(value) => {
                setLimitAttempts(value);
                setIsChanged(true);
              }}
            />
          </View>

          {/* TLACITKA: ulozit, reset, zpet */}
          <TouchableOpacity
            onPress={saveSettings}
            className="bg-green-600 px-6 py-5 rounded-xl w-full mb-4 flex-row justify-center items-center"
          >
            <Icon name="save" size={24} color="white" />
            <Text className="text-white text-xl font-semibold ml-2">Uložit nastavení</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsResetModalVisible(true)}
            className="bg-red-600 px-6 py-5 rounded-xl w-full mb-4 flex-row justify-center items-center"
          >
            <Icon name="refresh" size={24} color="white" />
            <Text className="text-white text-xl font-semibold ml-2">Resetovat postup</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleBackPress}
            className={`${theme === "dark" ? "bg-gray-600" : "bg-gray-300"} px-6 py-5 rounded-xl w-full flex-row justify-center items-center`}
          >
            <Icon name="arrow-back" size={24} color={theme === "dark" ? "white" : "black"} />
            <Text className={`text-xl font-semibold ml-2 ${theme === "dark" ? "text-white" : "text-black"}`}>
              Zpět
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
