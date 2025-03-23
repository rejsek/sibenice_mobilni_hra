import { useRouter } from "expo-router";
import { View, Text, Dimensions, ScrollView, Modal, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

// Typ pro tlacitka (obtiznosti, temata)
type ButtonItem = {
  name: string;
  color: string;
  icon: string;
};

// Nacteni statickych dat z JSONu
const gameData: { difficultyLevels: ButtonItem[]; topics: ButtonItem[] } = require("./buttons.json");

/**
 * Obrazovka herniho menu - uzivatel zde vybira obtiznost a tema.
 */
export default function Menu() {
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;
  const buttonsPerRow = screenWidth > 450 ? 3 : 2;

  // Stavy pro vybery a nastaveni
  const [difficultyLevels, setDifficultyLevels] = useState<ButtonItem[]>([]);
  const [topics, setTopics] = useState<ButtonItem[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [theme, setTheme] = useState("dark");

  // Nacteni tematu a hernich moznosti po nacteni komponenty
  useEffect(() => {
    setDifficultyLevels(gameData.difficultyLevels);
    setTopics(gameData.topics);

    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme");
        if (storedTheme) {
          setTheme(storedTheme);
        }
      } catch (error) {
        console.error("Chyba pri nacitani tematu:", error);
      }
    };

    loadTheme();
  }, []);

  // Spusteni hry - kontrola vyberu
  const startGame = () => {
    if (!selectedDifficulty || !selectedTopic) {
      setIsErrorModalVisible(true);
      return;
    }

    router.push({
      pathname: "/levels",
      params: { difficulty: selectedDifficulty, topic: selectedTopic },
    });
  };

  return (
    <SafeAreaView className={`flex-1 px-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40,
          alignItems: "center",
          paddingTop: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* MODAL: chyba pri chybejicim vyberu */}
        <Modal visible={isErrorModalVisible} animationType="fade" transparent>
          <View className="flex-1 justify-center items-center bg-black/70">
            <View className={`p-6 rounded-lg w-4/5 items-center ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
              <Icon name="error-outline" size={50} color="#DC2626" />
              <Text className={`text-xl font-bold my-4 ${theme === "dark" ? "text-white" : "text-black"}`}>Chyba</Text>
              <Text className={`text-lg mb-6 text-center ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Prosím, vyberte <Text className="font-bold">obtížnost</Text> i <Text className="font-bold">téma</Text> před spuštěním hry.
              </Text>
              <TouchableOpacity
                className="bg-red-600 px-4 py-2 rounded-lg w-full"
                onPress={() => setIsErrorModalVisible(false)}
              >
                <Text className="text-white text-lg font-semibold text-center">OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* HORNÍ TLACITKA: zpet a herni postup */}
        <View className="absolute top-1 left-2 right-2 flex-row justify-between">
          <TouchableOpacity
            onPress={() => router.push("/")}
            className={`flex-row items-center py-2 px-4 rounded-2xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-300"}`}
          >
            <Icon name="arrow-back" size={24} color={theme === "dark" ? "white" : "black"} />
            <Text className={`text-lg font-bold ml-2 ${theme === "dark" ? "text-white" : "text-black"}`}>Zpět</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/progress")}
            className={`flex-row items-center py-2 px-4 rounded-2xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-300"}`}
          >
            <Icon name="bar-chart" size={24} color={theme === "dark" ? "white" : "black"} />
            <Text className={`text-lg font-bold ml-2 ${theme === "dark" ? "text-white" : "text-black"}`}>Herní postup</Text>
          </TouchableOpacity>
        </View>

        {/* HLAVICKA */}
        <View className="w-full max-w-[400px] items-center top-12">
          <Text className={`text-4xl font-bold text-center mb-4 pt-10 ${theme === "dark" ? "text-white" : "text-black"}`}>
            ŠIBENICE
          </Text>
          <Text className={`text-sm text-center mb-8 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Sleduj svůj herní postup a zlepšuj své dovednosti.
            <Text className="font-semibold italic"> Ukaž svou soutěživost!</Text>
          </Text>

          {/* NASTAVENI HRY */}
          <View className="w-full">
            <Text className={`text-2xl font-semibold mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Nastav svou hru
            </Text>

            {/* VYBER OBTIZNOSTI */}
            <Text className={`text-md font-medium mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Obtížnost</Text>
            <View className="flex-row justify-between flex-wrap mb-6">
              {difficultyLevels.map((level, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedDifficulty(level.name)}
                  className="px-6 py-4 rounded-xl mx-2 mb-4 flex-row items-center justify-center"
                  style={{
                    flexBasis: `${100 / buttonsPerRow - 5}%`,
                    backgroundColor: selectedDifficulty === level.name ? "#22C55E" : level.color,
                  }}
                >
                  <Icon name={level.icon} size={24} color="white" />
                  <Text className="text-white text-lg font-bold ml-2">{level.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* VYBER TEMATU */}
            <Text className={`text-md font-medium mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Téma</Text>
            <View className="flex-row flex-wrap justify-between">
              {topics.map((topic, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedTopic(topic.name)}
                  className="px-6 py-4 rounded-xl mx-2 mb-4 flex-row items-center justify-center"
                  style={{
                    flexBasis: `${100 / buttonsPerRow - 5}%`,
                    backgroundColor: selectedTopic === topic.name ? "#22C55E" : topic.color,
                  }}
                >
                  <Icon name={topic.icon} size={24} color="white" />
                  <Text className="text-white text-lg font-bold ml-2">{topic.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* TLACITKO HRAT */}
          <TouchableOpacity
            onPress={startGame}
            className={`px-10 py-5 rounded-full mt-8 flex-row items-center justify-center ${theme === "dark" ? "shadow-lg shadow-black" : ""}`}
            style={{ backgroundColor: "#16A34A", marginBottom: 20 }}
          >
            <Icon name="play-arrow" size={28} color="white" />
            <Text className="text-white text-xl font-semibold ml-2">Hrát</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
