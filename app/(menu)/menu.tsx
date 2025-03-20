import { useRouter } from "expo-router";
import { View, Text, Dimensions, ScrollView, Modal, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

// Definujeme typ pro jednotlivé položky
type ButtonItem = {
  name: string;
  color: string;
};

// Načtení JSON souboru
const gameData: { difficultyLevels: ButtonItem[]; topics: ButtonItem[] } = require("./buttons.json");

export default function Menu() {
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;

  // Použití useState s konkrétním typem
  const [difficultyLevels, setDifficultyLevels] = useState<ButtonItem[]>([]);
  const [topics, setTopics] = useState<ButtonItem[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState<boolean>(false);
  const [theme, setTheme] = useState("dark");

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
        console.error("Chyba při načítání tématu:", error);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    setDifficultyLevels(gameData.difficultyLevels);
    setTopics(gameData.topics);
  }, []);

  const buttonsPerRow = screenWidth > 450 ? 3 : 2;

  const tableHead = ['Úroveň', 'Skóre', 'Téma', 'Obtížnost'];
  const tableData = [
    ['1', '3', 'Matematika', 'Lehká'],
    ['2', '2', 'Programování', 'Střední'],
    ['3', '1', 'Historie', 'Těžká']
  ];


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
        {/* Modální okno s chybou */}
        <Modal visible={isErrorModalVisible} animationType="fade" transparent={true}>
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
  
        <View className="absolute top-1 left-2 right-2 flex-row justify-between">
          {/* Tlačítko Zpět */}
          <TouchableOpacity
            onPress={() => router.push("/")}
            className={`flex-row items-center py-2 px-4 rounded-2xl ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-300"
            }`}
          >
            <Icon name="arrow-back" size={24} color={theme === "dark" ? "white" : "black"} />
            <Text className={`text-lg font-bold ml-2 ${theme === "dark" ? "text-white" : "text-black"}`}>
              Zpět
            </Text>
          </TouchableOpacity>

          {/* Tlačítko Herní postup */}
          <TouchableOpacity
            onPress={() => router.push("/progress")}
            className={`flex-row items-center py-2 px-4 rounded-2xl ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-300"
            }`}
          >
            <Icon name="bar-chart" size={24} color={theme === "dark" ? "white" : "black"} />
            <Text className={`text-lg font-bold ml-2 ${theme === "dark" ? "text-white" : "text-black"}`}>
              Herní postup
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hlavní obsah */}
        <View className="w-full max-w-[400px] items-center top-12">
          <Text className={`text-4xl font-bold text-center mb-4 pt-10 ${theme === "dark" ? "text-white" : "text-black"}`}>
            ŠIBENICE
          </Text>
          <Text className={`text-sm text-center mb-8 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Sleduj svůj herní postup a zlepšuj své dovednosti.
            <Text className="font-semibold italic"> Ukaž svou soutěživost!</Text>
          </Text>
  
          {/* Nastavení hry */}
          <View className="w-full">
            <Text className={`text-2xl font-semibold mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Nastav svou hru
            </Text>
  
            {/* Výběr obtížnosti */}
            <Text className={`text-md font-medium mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Obtížnost
            </Text>
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
                  <Text className="text-white text-lg text-center font-bold ml-2">{level.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
  
            {/* Výběr tématu */}
            <Text className={`text-md font-medium mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Téma
            </Text>
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
                  <Text className="text-white text-lg text-center font-bold ml-2">{topic.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
  
          {/* Tlačítko Hrát */}
          <TouchableOpacity
            className={`px-10 py-4 rounded-full mt-8 flex-row items-center justify-center ${
              theme === "dark" ? "shadow-lg shadow-black" : ""
            }`}
            onPress={startGame}
            style={{
              backgroundColor: "#16A34A",
              marginBottom: 20,
            }}
          >
            <Icon name="play-arrow" size={28} color="white" />
            <Text className="text-white text-xl font-semibold text-center ml-2">Hrát</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );  
}
