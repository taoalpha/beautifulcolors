import React, { useCallback, useState, useRef, useEffect } from "react";
import ContrastColor from "contrast-color";
import { StatusBar } from "expo-status-bar";
import {
  TouchableWithoutFeedback,
  SafeAreaView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  pickRandomColor,
  getMatchedColor,
  rgbToHex,
  hexToRgb,
} from "./lib/color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { wait } from "./lib/timer";
import ChannelSelector, { ColorChannel } from "./components/ChannelSelector";
import ChannelUpdator from "./components/ChannelUpdator";

const randomColor = pickRandomColor();

function ensureColorBoundary(code: number, step: number) {
  const sign = step > 0 ? 1 : -1;
  return Math.max(Math.min(255, code + sign * Math.max(Math.abs(step), 0)), 0);
}

const cc = new ContrastColor();

export default function App() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [matchedColor, setMatchedColor] = useState(randomColor);
  const [bgColor, setBgColor] = useState(randomColor.code);
  const [commitedBgColor, setCommitedBgColor] = useState(randomColor.code);
  const [adjusting, setAdjusting] = useState(false);
  const [channelValueDiff, setChannelValueDiff] = useState(0);
  const currentColor = hexToRgb(bgColor);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState({name: ColorChannel.RED, value: currentColor.r});

  const onNameChange = (channel: ColorChannel) => {
    const currentColor = hexToRgb(bgColor);
    let val = 0;
    switch (channel) {
      case ColorChannel.RED:
        val = currentColor.r;
        break;
      case ColorChannel.GREEN:
        val = currentColor.g;
        break;
      case ColorChannel.BLUE:
        val = currentColor.b;
        break;
    }
    setSelectedChannel(prev => ({...prev, name: channel, value: val}))
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    wait(100).then(() => {
      const randomColor = pickRandomColor();
      setMatchedColor(randomColor);
      setBgColor(randomColor.code);
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    if (!adjusting) return;
    const currentColor = hexToRgb(commitedBgColor);
    const rgb = { ...currentColor };
    switch (selectedChannel.name) {
      case ColorChannel.RED:
        rgb.r = ensureColorBoundary(rgb.r, channelValueDiff);
        break;
      case ColorChannel.GREEN:
        rgb.g = ensureColorBoundary(rgb.g, channelValueDiff);
        break;
      case ColorChannel.BLUE:
        rgb.b = ensureColorBoundary(rgb.b, channelValueDiff);
        break;
    }

    const colorCode = rgbToHex(rgb);
    setBgColor(colorCode);
    setMatchedColor(getMatchedColor(colorCode));
  }, [channelValueDiff, commitedBgColor, adjusting]);

  useEffect(() => {
    const getTutorialState = async () => {
      const lastTimeSeenTutorial = await AsyncStorage.getItem("panTutorial");
      if (lastTimeSeenTutorial === null) {
        wait(2000)
          .then(() => {
            setShowTutorial(true);
            AsyncStorage.setItem("panTutorial", `${Date.now()}`);
            return wait(2000);
          })
          .then(() => setShowTutorial(false));
      }
    };
    getTutorialState();
  }, []);

  useEffect(() => {
    if (!adjusting) {
      setCommitedBgColor(bgColor);
    }
  }, [adjusting, bgColor])

  const onColorLongPress = () => {};
  const fgColor = cc.contrastColor({ bgColor });

  return (
    <SafeAreaView
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: bgColor, color: fgColor },
      ])}
    >
      <StatusBar style="auto" />
      {/* BEGIN: Main touch area */}
      <ChannelUpdator
        channel={selectedChannel.name}
        style={StyleSheet.flatten([
          styles.touchArea,
          { backgroundColor: bgColor },
        ])}
        onUpdate={setChannelValueDiff}
        onStart={() => setAdjusting(true)}
        onComplete={() => setAdjusting(false)}
        fgColor={fgColor}
      ></ChannelUpdator>
      {/* END: Main touch area */}

      {/* BEGIN: Color display area */}
      <TouchableWithoutFeedback onLongPress={onColorLongPress}>
        <View style={styles.colorDisplayArea}>
          <Text
            style={StyleSheet.flatten([styles.colorCode, { color: fgColor }])}
          >
            {Object.values(hexToRgb(bgColor)).join(", ")}
          </Text>
          {!adjusting && matchedColor && (
            <Text
              style={StyleSheet.flatten([styles.colorName, { color: fgColor }])}
            >
              {matchedColor.desc.map((d) => d.title).join(",")}
            </Text>
          )}
        </View>
      </TouchableWithoutFeedback>
      {/* END: Color display area */}

      {/* BEGIN: channel selector */}
      <ChannelSelector
        selectedChannel={selectedChannel.name}
        onChannelChange={onNameChange}
        style={styles.channelSelector}
        fgColor={cc.contrastColor({ bgColor })}
        channels={[ColorChannel.RED, ColorChannel.GREEN, ColorChannel.BLUE]}
      />
      {/* END: channel selector */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    overflow: "hidden",
    ...Platform.select({
      web: {
        transition: "background-color 2s ease-out",
      },
    }),
  },
  touchArea: {
    flex: 1,
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  colorDisplayArea: {},
  colorName: {
    fontSize: 30,
    ...Platform.select({
      web: {
        userSelect: "none",
      },
    }),
  },
  colorCode: {
    fontSize: 40,
    textTransform: "uppercase",
    ...Platform.select({
      web: {
        userSelect: "none",
      },
    }),
  },
  channelSelector: {
    position: "absolute",
    bottom: 20,
    right: 20,
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
});
