import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, Dimensions, ScrollView, Modal } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

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

  useEffect(() => {
    setDifficultyLevels(gameData.difficultyLevels);
    setTopics(gameData.topics);
  }, []);

  const buttonsPerRow = screenWidth > 450 ? 3 : 2;

  const startGame = () => {
    if (!selectedDifficulty || !selectedTopic) {
      setIsErrorModalVisible(true);
      return;
    }

    router.push({
      pathname: "/game",
      params: { difficulty: selectedDifficulty, topic: selectedTopic },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-800 px-6">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40, // Rezerva pro tlačítko Hrát
          alignItems: "center",
          paddingTop: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Modal visible={isErrorModalVisible} animationType="fade" transparent={true}>
          <View className="flex-1 justify-center items-center bg-black/70">
            <View className="bg-white p-6 rounded-lg w-4/5">
              <Text className="text-black text-xl font-bold mb-4">Chyba</Text>
              <Text className="text-gray-700 text-lg mb-6">
                Prosím, vyberte **obtížnost** i **téma** před spuštěním hry.
              </Text>
              <TouchableOpacity 
                className="bg-red-600 px-4 py-2 rounded-lg" 
                onPress={() => setIsErrorModalVisible(false)}
              >
                <Text className="text-white text-lg font-semibold text-center">OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TouchableOpacity
          onPress={() => router.push("/")}
          className="absolute top-5 left-0 bg-gray-700 px-4 py-2 rounded-full z-50"
        >
          <Text className="text-white text-lg font-semibold">← Zpět</Text>
        </TouchableOpacity>

        <View className="w-full max-w-[400px] items-center top-12">
          <Text className="text-white text-4xl font-bold text-center mb-4 pt-10">ŠIBENICE</Text>
          <Text className="text-gray-300 text-sm text-center mb-8">
            Sleduj svůj herní postup a zlepšuj své dovednosti.
            <Text className="font-semibold italic"> Ukaž svou soutěživost!</Text>
          </Text>

          <View className="w-full">
            <Text className="text-gray-300 text-lg font-semibold mb-3">🎮 Nastav svou hru</Text>

            <Text className="text-gray-400 text-md font-medium mb-2">Obtížnost</Text>
            <View className="flex-row justify-between flex-wrap mb-6">
              {difficultyLevels.map((level, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedDifficulty(level.name)}
                  className="px-6 py-4 rounded-xl mx-2 mb-4"
                  style={{
                    flexBasis: `${100 / buttonsPerRow - 5}%`,
                    backgroundColor: selectedDifficulty === level.name ? "#22C55E" : level.color,
                  }}
                >
                  <Text className="text-white text-lg text-center font-bold">{level.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-gray-400 text-md font-medium mb-2">Téma</Text>
            <View className="flex-row flex-wrap justify-between">
              {topics.map((topic, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedTopic(topic.name)}
                  className="px-6 py-4 rounded-xl mx-2 mb-4"
                  style={{
                    flexBasis: `${100 / buttonsPerRow - 5}%`,
                    backgroundColor: selectedTopic === topic.name ? "#22C55E" : topic.color,
                  }}
                >
                  <Text className="text-white text-lg text-center font-bold">{topic.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tlačítko Hrát se správným umístěním */}
          <TouchableOpacity
            className="bg-gray-700 px-10 py-4 rounded-full mt-8 shadow-lg"
            onPress={startGame}
            style={{ marginBottom: 20 }} // Přidání prostoru pod tlačítkem
          >
            <Text className="text-white text-xl font-semibold text-center">Hrát</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
