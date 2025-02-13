import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Dimensions, Modal, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import ConfettiCannon from "react-native-confetti-cannon"; // 🎉 Import konfet

export default function GameScreen() {
  const router = useRouter();
  const { topic, difficulty } = useLocalSearchParams(); // ✅ Načtení parametrů z menu
  const screenWidth = Dimensions.get("window").width;

  // Možná slova podle tématu a obtížnosti
  const wordsByTopic: Record<string, Record<string, string[]>> = {
    Zvířata: {
      Začátečník: ["PES", "KOČKA", "LEV"],
      Pokročilý: ["TYGR", "SLON", "ŽIRAF"],
      Expert: ["KROKODÝL", "GORILA", "NOSOROŽEC"],
    },
    Cestování: {
      Začátečník: ["MAPA", "BUS", "VLAK"],
      Pokročilý: ["LETADLO", "KOMPAS", "PLÁŽ"],
      Expert: ["DESTINACE", "TURISTIKA", "PAS"],
    },
    Technologie: {
      Začátečník: ["PC", "APP", "NET"],
      Pokročilý: ["LAPTOP", "ROBOT", "CLOUD"],
      Expert: ["ARTIFICIAL", "BLOCKCHAIN", "SOFTWARE"],
    },
  };

  // Kontrola platnosti tématu a obtížnosti
  const isValidTopic = typeof topic === "string" && Object.prototype.hasOwnProperty.call(wordsByTopic, topic);

  // Ověříme, zda difficulty existuje v daném topicu
  const isValidDifficulty =
    isValidTopic &&
    typeof difficulty === "string" &&
    Object.prototype.hasOwnProperty.call(wordsByTopic[topic as keyof typeof wordsByTopic], difficulty);

  // Uložíme cílové slovo do stavu, aby se negenerovalo znovu při každém renderu
  const [targetWord] = useState(() => {
    if (isValidTopic && isValidDifficulty) {
      const possibleWords =
        wordsByTopic[topic as keyof typeof wordsByTopic][
          difficulty as keyof typeof wordsByTopic[keyof typeof wordsByTopic]
        ];
      return possibleWords[Math.floor(Math.random() * possibleWords.length)];
    }
    return "REACT"; // Záložní slovo, pokud něco selže
  });

  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Animace pro vyskakovací okno
  const translateYAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (isGameOver || isWinner) {
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }

    if (isWinner) {
      setShowConfetti(true); // 🎉 Spustíme konfety jen při výhře
    }
  }, [isGameOver, isWinner]);

  // Abeceda pro tlačítka (bez diakritiky)
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Logika hádání
  const handleGuess = (letter: string) => {
    if (targetWord.includes(letter)) {
      const updatedGuessedLetters = [...guessedLetters, letter];
      setGuessedLetters(updatedGuessedLetters);

      // Kontrola, jestli hráč uhodl všechna písmena
      if (targetWord.split("").every((char) => updatedGuessedLetters.includes(char))) {
        setIsWinner(true);
      }
    } else {
      const newWrongGuesses = [...wrongGuesses, letter];
      setWrongGuesses(newWrongGuesses);

      if (newWrongGuesses.length >= 6) {
        setIsGameOver(true);
      }
    }
  };

  // Funkce pro návrat do menu
  const goToMenu = () => {
    setIsGameOver(false);
    setIsWinner(false);
    setShowConfetti(false);
    router.push("/menu");
  };

  // Vizuální reprezentace slova (_ _ A _ _)
  const displayedWord = targetWord
    .split("")
    .map((letter) => (guessedLetters.includes(letter) ? letter : "_"))
    .join(" ");

  return (
    <SafeAreaView className="flex-1 bg-gray-800 px-6 items-center justify-center">
      {/* Tlačítko zpět */}
      <TouchableOpacity
        onPress={goToMenu}
        className="absolute top-10 left-5 bg-gray-700 px-4 py-2 rounded-full z-50"
      >
        <Text className="text-white text-lg font-semibold">← Zpět</Text>
      </TouchableOpacity>

      {/* Herní plocha */}
      <View className="w-full max-w-[400px] items-center">
        <Text className="text-white text-3xl font-bold mb-4">{topic}</Text>
        <Text className="text-gray-400 text-lg mb-2">Obtížnost: {difficulty}</Text>

        {/* Grafická šibenice */}
        <View className="w-full h-48 bg-gray-900 rounded-lg mb-10 items-center justify-center relative">
          {/* Podstava */}
          {wrongGuesses.length > 0 && (
            <View className="w-32 h-1 bg-white absolute bottom-2 left-1/2 -translate-x-1/2" />
          )}
          {/* Svislý sloup */}
          {wrongGuesses.length > 1 && (
            <View className="w-1 h-40 bg-white absolute bottom-2 left-1/3" />
          )}
          {/* Horní nosník */}
          {wrongGuesses.length > 2 && (
            <View className="w-1/4 h-1 bg-white absolute top-6 left-1/3" />
          )}
          {/* Provaz */}
          {wrongGuesses.length > 3 && (
            <View className="w-1 h-1/4 bg-white absolute top-6 left-52" />
          )}
          {/* Hlava */}
          {wrongGuesses.length > 4 && (
            <View className="w-6 h-6 bg-white rounded-full absolute top-1/3 left-1/2" />
          )}
          {/* Tělo */}
          {wrongGuesses.length > 5 && (
            <View className="w-1 h-12 bg-white absolute top-22 left-52" />
          )}
        </View>

        {/* Zobrazené slovo */}
        <Text className="text-white text-4xl font-bold tracking-widest mb-6">
          {displayedWord}
        </Text>

        {/* Klávesnice */}
        {!isGameOver && !isWinner && (
          <View className="flex-wrap flex-row justify-center mb-4">
            {alphabet.map((letter) => {
              const isDisabled =
                guessedLetters.includes(letter) || wrongGuesses.includes(letter);
              return (
                <TouchableOpacity
                  key={letter}
                  onPress={() => handleGuess(letter)}
                  disabled={isDisabled}
                  className="px-4 py-3 m-1 rounded-lg"
                  style={{
                    flexBasis: "12%",
                    height: 50,
                    backgroundColor: guessedLetters.includes(letter)
                      ? "#22C55E"
                      : wrongGuesses.includes(letter)
                      ? "#DC2626"
                      : "#374151",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text className="text-white text-lg font-bold">{letter}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Konfety pouze při výhře */}
      {showConfetti && (
        <ConfettiCannon count={200} origin={{ x: screenWidth / 2, y: 0 }} />
      )}
    </SafeAreaView>
  );
}
