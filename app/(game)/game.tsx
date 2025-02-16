import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
  Vibration,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import ConfettiCannon from "react-native-confetti-cannon";

// Import JSON s daty slov (neměníme ho přímo)
import wordsJson from "./words.json";
const wordsData = wordsJson as Record<
  string,
  Record<string, { word: string; hint: string }[]>
>;

// Pomocná funkce pro výpočet skóre na základě počtu chyb
function calculateScore(wrongCount: number): number {
  if (wrongCount === 0) return 3;
  if (wrongCount <= 2) return 2;
  if (wrongCount <= 4) return 1;
  return 0;
}

export default function GameScreen() {
  const router = useRouter();
  const { topic, difficulty, level } = useLocalSearchParams();
  const screenWidth = Dimensions.get("window").width;

  // Stavové proměnné
  const [targetWord, setTargetWord] = useState<string>("REACT");
  const [wordHint, setWordHint] = useState<string>("");
  const [isHintVisible, setIsHintVisible] = useState<boolean>(true);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [scoreData, setScoreData] = useState<Record<string, number>>({});

  // Animace
  const translateYAnim = useRef(new Animated.Value(300)).current;

  // ===== Funkce pro načítání a ukládání skóre přes AsyncStorage =====

  const loadScores = async () => {
    try {
      const savedScores = await AsyncStorage.getItem("score");
      if (savedScores) {
        setScoreData(JSON.parse(savedScores));
      }
    } catch (error) {
      console.error("Chyba při načítání skóre:", error);
    }
  };

  const saveScore = async (word: string, newScore: number) => {
    try {
      // Pokud chceme ponechat lepší skóre z dřívějška, porovnáme:
      const oldScore = scoreData[word] ?? 0;
      const betterScore = Math.max(oldScore, newScore);

      const updatedScoreData = { ...scoreData, [word]: betterScore };
      await AsyncStorage.setItem("score", JSON.stringify(updatedScoreData));
      setScoreData(updatedScoreData);
    } catch (error) {
      console.error("Chyba při ukládání skóre:", error);
    }
  };

  useEffect(() => {
    loadScores();

    try {
      const safeTopic = Array.isArray(topic) ? topic[0] : topic;
      const safeDifficulty = Array.isArray(difficulty) ? difficulty[0] : difficulty;
      const safeLevel = Number(level) - 1;

      // Najdeme správné slovo podle topic/difficulty/level
      if (
        safeTopic &&
        safeDifficulty &&
        wordsData[safeTopic] &&
        wordsData[safeTopic][safeDifficulty]
      ) {
        const possibleWords = wordsData[safeTopic][safeDifficulty];
        if (safeLevel >= 0 && safeLevel < possibleWords.length) {
          const selectedWordData = possibleWords[safeLevel];
          setTargetWord(selectedWordData.word);
          setWordHint(selectedWordData.hint);
        } else {
          console.warn("Neplatný level, nemá přiřazené slovo.");
        }
      }
    } catch (error) {
      console.error("Chyba při načítání JSON souboru:", error);
    }
  }, [topic, difficulty, level]);

  // ===== Kontrola, zda je konec hry (výhra/prohra) a animace zobrazení =====
  useEffect(() => {
    if (isGameOver || isWinner) {
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();

      if (isWinner) {
        router.push({
          pathname: "/(game)/win",
          params: { word: targetWord, wrongCount: wrongGuesses.length, difficulty, topic, level }
        });
      }
      
      // Uložíme finální skóre (např. 3, 2, 1 nebo 0)
      const finalScore = calculateScore(wrongGuesses.length);
      saveScore(targetWord, finalScore);
    }
  }, [isGameOver, isWinner]);

  // ===== Navigace / akce po dohrání =====
  const goToLevelSelect = () => {
    setIsGameOver(false);
    setIsWinner(false);
    setShowConfetti(false);
    router.push({ pathname: "/levels", params: { topic, difficulty } });
  };

  const restartGame = () => {
    setIsGameOver(false);
    setIsWinner(false);
    setShowConfetti(false);
    setGuessedLetters([]);
    setWrongGuesses([]);
    setIsHintVisible(true);
  };

  // Abeceda (pokud potřebuješ kompletní českou abecedu)
  const alphabet = "AÁBCČDĎEÉĚFGHIÍJKLMNŇOÓPQRŘSŠTŤUÚŮVWXYÝZŽ".split("");

  // ===== Funkce na zpracování hádání písmen =====
  const handleGuess = (letter: string) => {
    if (targetWord.includes(letter)) {
      const updatedGuessedLetters = [...guessedLetters, letter];
      setGuessedLetters(updatedGuessedLetters);

      // Kontrola, zda jsme uhodli všechna písmena
      if (targetWord.split("").every((char) => updatedGuessedLetters.includes(char))) {
        setIsWinner(true);
      }
    } else {
      Vibration.vibrate(200);
      const newWrongGuesses = [...wrongGuesses, letter];
      setWrongGuesses(newWrongGuesses);

      // Šest špatných pokusů -> prohra
      if (newWrongGuesses.length >= 6) {
        setIsGameOver(true);
      }
    }
  };

  // Vykreslená podoba slova (neuhodnutá písmena jako "_")
  const displayedWord = targetWord
    .split("")
    .map((letter) => (guessedLetters.includes(letter) ? letter : "_"))
    .join(" ");

  return (
    <SafeAreaView className="flex-1 bg-gray-800 px-6 items-center justify-center">
      {/* MODÁLNÍ OKNO S NÁPOVĚDOU - ZOBRAZÍ SE NA ZAČÁTKU */}
      <Modal visible={isHintVisible} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/70">
          <View className="bg-white p-6 rounded-lg w-4/5">
            <Text className="text-black text-xl font-bold mb-4">Nápověda</Text>
            <Text className="text-gray-700 text-lg mb-6">{wordHint}</Text>
            <TouchableOpacity 
              className="bg-blue-600 px-4 py-2 rounded-lg" 
              onPress={() => setIsHintVisible(false)}
            >
              <Text className="text-white text-lg font-semibold text-center">Rozumím</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* TLAČÍTKO ZPĚT */}
      <TouchableOpacity
        onPress={goToLevelSelect}
        className="absolute top-14 left-5 bg-gray-700 px-4 py-2 rounded-full z-50"
      >
        <Text className="text-white text-lg font-semibold">← Zpět</Text>
      </TouchableOpacity>

      {/* TLAČÍTKO PRO NÁPOVĚDU */}
      <TouchableOpacity
        onPress={() => setIsHintVisible(true)}
        className="absolute top-14 right-5 bg-yellow-500 px-4 py-2 rounded-full z-50"
      >
        <Text className="text-black text-lg font-semibold">❓ Nápověda</Text>
      </TouchableOpacity>

      <View className="w-full max-w-[400px] items-center top-8">
        <Text className="text-white text-3xl font-bold mb-4">{topic}</Text>
        <Text className="text-gray-400 text-lg mb-2">Obtížnost: {difficulty}</Text>

        {/* VYKRESLENÍ ŠIBENICE */}
        <View className="w-full h-48 bg-gray-900 rounded-lg mb-10 items-center justify-center relative top-3">
          {wrongGuesses.length > 0 && <View className="w-32 h-1 bg-white absolute bottom-2 left-1/2 -translate-x-1/2" />}
          {wrongGuesses.length > 1 && <View className="w-1 h-40 bg-white absolute bottom-2 left-1/3" />}
          {wrongGuesses.length > 2 && <View className="w-1/4 h-1 bg-white absolute top-6 left-1/3" />}
          {wrongGuesses.length > 3 && <View className="w-1 h-1/4 bg-white absolute top-6 left-52" />}
          {wrongGuesses.length > 4 && <View className="w-6 h-6 bg-white rounded-full absolute top-1/3 left-1/2" />}
          {wrongGuesses.length > 5 && <View className="w-1 h-12 bg-white absolute top-22 left-52" />}
        </View>

        <Text className="text-white text-4xl font-bold tracking-widest mb-6">{displayedWord}</Text>

        {!isGameOver && !isWinner && (
          <View className="flex-wrap flex-row justify-center mb-4">
            {alphabet.map((letter) => {
              const isDisabled = guessedLetters.includes(letter) || wrongGuesses.includes(letter);
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

      {showConfetti && <ConfettiCannon count={200} origin={{ x: screenWidth / 2, y: 0 }} />}
      
      <Modal visible={isWinner} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/70">
          <View className="bg-white p-6 rounded-lg w-4/5">
            <Text className="text-green-600 text-2xl font-bold mb-4 text-center">🎉 Gratulace!</Text>
            <Text className="text-gray-700 text-lg mb-6 text-center">Vyhrál jsi! Slovo bylo "{targetWord}".</Text>
            <TouchableOpacity 
              className="bg-blue-600 px-4 py-2 rounded-lg mb-2" 
              onPress={restartGame}
            >
              <Text className="text-white text-lg font-semibold text-center">Hrát znovu</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-gray-600 px-4 py-2 rounded-lg" 
              onPress={goToLevelSelect}
            >
              <Text className="text-white text-lg font-semibold text-center">Zpět do menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isGameOver} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/70">
          <View className="bg-white p-6 rounded-lg w-4/5">
            <Text className="text-red-600 text-2xl font-bold mb-4 text-center">❌ Prohra!</Text>
            <Text className="text-gray-700 text-lg mb-6 text-center">Prohrál jsi! Hledané slovo bylo "{targetWord}".</Text>
            <TouchableOpacity 
              className="bg-blue-600 px-4 py-2 rounded-lg mb-2" 
              onPress={restartGame}
            >
              <Text className="text-white text-lg font-semibold text-center">Zkusit znovu</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-gray-600 px-4 py-2 rounded-lg" 
              onPress={goToLevelSelect}
            >
              <Text className="text-white text-lg font-semibold text-center">Zpět do menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
