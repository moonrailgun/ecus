import { Image, StyleSheet, Platform, TouchableOpacity } from "react-native";
import {
  fetchUpdateAsync,
  runtimeVersion,
  updateId,
  checkAutomatically,
  channel,
  isEnabled,
  emergencyLaunchReason,
  isEmbeddedLaunch,
  isEmergencyLaunch,
  isUsingEmbeddedAssets,
  launchDuration,
  reloadAsync,
} from "expo-updates";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState } from "react";

export default function HomeScreen() {
  const [resultText, setResultText] = useState("");
  const state = {
    isEnabled,
    runtimeVersion,
    updateId,
    channel,
    checkAutomatically,
    isEmergencyLaunch,
    emergencyLaunchReason,
    launchDuration,
    isEmbeddedLaunch,
    isUsingEmbeddedAssets,
  };

  const handleFetch = () => {
    fetchUpdateAsync()
      .then((result) => {
        alert("fetch completed");
        setResultText(JSON.stringify(result, null, 2));
      })
      .catch((err) => {
        alert("fetch error:" + String(err));
      });
  };

  const handleFetchAndReload = () => {
    fetchUpdateAsync()
      .then((result) => {
        setResultText(JSON.stringify(result, null, 2));
        reloadAsync();
      })
      .catch((err) => {
        alert("fetch error:" + String(err));
      });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome! 5</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">State</ThemedText>
        <ThemedText>{JSON.stringify(state, null, 2)}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <TouchableOpacity
          style={{ backgroundColor: "#eee", borderRadius: 10, padding: 4 }}
          onPress={handleFetch}
        >
          <ThemedText>Fetch</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: "#eee", borderRadius: 10, padding: 4 }}
          onPress={handleFetchAndReload}
        >
          <ThemedText>Fetch and reload</ThemedText>
        </TouchableOpacity>
        <ThemedText>{resultText}</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
