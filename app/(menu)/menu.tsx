import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Menu() {
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;

  // Stavy pro výběr obtížnosti a tématu
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Data pro tlačítka obtížnosti
  const difficultyLevels = [
    { name: "Začátečník", color: "#2563EB" },
    { name: "Pokročilý", color: "#D97706" },
    { name: "Expert", color: "#DC2626" },
  ];

  // Data pro tlačítka témat
  const topics = [
    { name: "Vše", color: "#059669" },
    { name: "Zvířata", color: "#EA580C" },
    { name: "Cestování", color: "#9333EA" },
    { name: "Jídla", color: "#EC4899" },
    { name: "Sporty", color: "#0D9488" },
    { name: "Auta", color: "#6B7280" },
    { name: "Technologie", color: "#2563EB" },
    { name: "Filmy", color: "#D97706" },
    { name: "Historie", color: "#DC2626" },
    { name: "Hudba", color: "#10B981" },
    { name: "Věda", color: "#9333EA" },
    { name: "Vesmír", color: "#F59E0B" },
  ];

  // Dynamicky určujeme počet tlačítek v řádku
  const buttonsPerRow = screenWidth > 450 ? 3 : 2;

  const startGame = () => {
    if (!selectedDifficulty || !selectedTopic) {
      alert("Vyberte obtížnost i téma!"); // Kontrola výběru
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
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Tlačítko zpět */}
        <TouchableOpacity
          onPress={() => router.push("/")}
          className="absolute top-5 left-5 bg-gray-700 px-4 py-2 rounded-full z-50"
        >
          <Text className="text-white text-lg font-semibold">← Zpět</Text>
        </TouchableOpacity>

        <View className="w-full max-w-[400px] items-center">
          {/* Nadpis a statistiky */}
          <Text className="text-white text-4xl font-bold text-center mb-4 pt-10">ŠIBENICE</Text>
          <Text className="text-gray-300 text-sm text-center mb-8">
            Sleduj svůj herní postup a zlepšuj své dovednosti.
            <Text className="font-semibold italic"> Ukaž svou soutěživost!</Text>
          </Text>

          {/* Sekce nastavení hry */}
          <View className="w-full">
            <Text className="text-gray-300 text-lg font-semibold mb-3">🎮 Nastav svou hru</Text>

            {/* Výběr obtížnosti */}
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

            {/* Výběr tématu */}
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

          {/* Tlačítko Start */}
          <TouchableOpacity
            className="bg-gray-700 px-10 py-4 rounded-full mt-8 shadow-lg"
            onPress={startGame}
          >
            <Text className="text-white text-xl font-semibold text-center">Hrát</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
