import React, { useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Hudební přehrávač na pozadí - načte a přehraje hudbu v nekonečné smyčce
 */
export default function MusicPlayer() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [lastSetting, setLastSetting] = useState<boolean | null>(null);

  useEffect(() => {
    let pollInterval: number;

    const initialize = async () => {
      try {
        // ------------------------------------
        // Načtení a nastavení režimu zvuku
        // ------------------------------------
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,   // zajistí přehrání i v tichém režimu iOS
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        // ------------------------------------
        // Načtení zvukové stopy jednorázově
        // ------------------------------------
        const { sound } = await Audio.Sound.createAsync(
          require("../assets/music/background.mp3"),
          { isLooping: true, volume: 0.5 }
        );
        soundRef.current = sound;

        // ------------------------------------
        // Načtení nastavení hudby z AsyncStorage
        // ------------------------------------
        const stored = await AsyncStorage.getItem("musicEnabled");
        const enabled = stored === null ? true : stored === "true";
        setLastSetting(enabled);

        if (enabled) {
          // Pokud je hudba zapnutá, přehraj
          await sound.playAsync();
        } else {
          // Pokud je hudba vypnutá, pauzně
          await sound.pauseAsync();
        }

        // -----------------------------------------------
        // Spuštění polling-u pro detekci změny nastavení
        // -----------------------------------------------
        pollInterval = setInterval(async () => {
          const s = await AsyncStorage.getItem("musicEnabled");
          const e = s === null ? true : s === "true";

          // Pokud se změnila hodnota a máme načtený zvuk
          if (e !== lastSetting && soundRef.current) {
            setLastSetting(e);
            if (e) {
              await soundRef.current.playAsync();
            } else {
              await soundRef.current.pauseAsync();
            }
          }
        }, 2000); // kontrola každé 2 sekundy
      } catch (error) {
        console.warn("Chyba při načítání/přehrávání hudby:", error);
      }
    };

    initialize();

    // ------------------------------------
    // Cleanup: uvolnění zvuku a zrušení poolingu
    // ------------------------------------
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [lastSetting]);

  return null;
}
