import React, { useState, useLayoutEffect, useEffect } from "react";
import Tooltip from "react-native-walkthrough-tooltip";
import ContrastColor from "contrast-color";
import { StatusBar } from "expo-status-bar";
import {
  StatusBar as RNStatusBar,
  SafeAreaView,
  Platform,
  StyleSheet,
  Text,
  View,
  Linking,
  TouchableHighlight,
} from "react-native";
import {
  pickRandomColor,
  getMatchedColor,
  rgbToHex,
  hexToRgb,
  ColorChannel,
  getChannelValue,
} from "./lib/color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { wait } from "./lib/timer";
import ChannelUpdator from "./components/ChannelUpdator";
import ChannelSelector from "./components/ChannelSelector";

const initialRandomColor = pickRandomColor();

function ensureColorBoundary(code: number, step: number) {
  const sign = step > 0 ? 1 : -1;
  return Math.max(Math.min(255, code + sign * Math.max(Math.abs(step), 0)), 0);
}

const cc = new ContrastColor();

enum TutorialStep {
  NONE,
  WELCOME,
  COLOR_DESC,
  CHANNEL_SELECTOR,
  DONE,
}

export default function App() {
  const [randomColor, setRandomColor] = useState(initialRandomColor);
  const [tutorialStep, setTutorial] = useState(TutorialStep.NONE);
  const [matchedColor, setMatchedColor] = useState(randomColor);
  const [bgColor, setBgColor] = useState(randomColor.code);
  const [commitedBgColor, setCommitedBgColor] = useState(randomColor.code);
  const [adjusting, setAdjusting] = useState(false);
  const [channelValueDiff, setChannelValueDiff] = useState(0);
  const [selectedChannel, setSelectedChannel] = useState(ColorChannel.RED);

  // TODO: Consider moving to a custom hook.
  // Commit the current bg color once adjusting finished.
  useEffect(() => {
    if (!adjusting) {
      setCommitedBgColor(bgColor);
    }
  }, [adjusting, bgColor]);

  // Update bgColor based on adjusting progress.
  useEffect(() => {
    if (!adjusting) return;
    const currentColor = hexToRgb(commitedBgColor);
    const rgb = { ...currentColor };
    rgb[selectedChannel] = ensureColorBoundary(
      rgb[selectedChannel],
      channelValueDiff
    );

    const colorCode = rgbToHex(rgb);
    setBgColor(colorCode);
  }, [channelValueDiff, commitedBgColor, adjusting]);

  useEffect(() => {
    setMatchedColor(getMatchedColor(commitedBgColor));
  }, [commitedBgColor]);

  useEffect(() => {}, [tutorialStep]);

  // Run immediately after randomColor changed, to avoid mismatch between
  // commitedBgColor and the new randomColor.
  useLayoutEffect(() => {
    setBgColor(randomColor.code);
    setCommitedBgColor(randomColor.code);
  }, [randomColor]);

  // Show tutorial if user not yet seen them.
  useEffect(() => {
    const getTutorialState = async () => {
      const bcTutorialInfo = await AsyncStorage.getItem("bcTutorial");
      if (bcTutorialInfo === null) {
        wait(1000).then(() => {
          setTutorial(TutorialStep.WELCOME);
          AsyncStorage.setItem(
            "bcTutorial",
            JSON.stringify({
              lastSeen: `${Date.now()}`,
              lastSeenStep: TutorialStep.COLOR_DESC,
            })
          );
        });
      }
    };
    getTutorialState();
  }, []);

  const fgColor = cc.contrastColor({ bgColor });

  const hasColorValueChange = (channelValue: number, diff: number) => {
    return (channelValue >= 0 && channelValue < 255 && diff > 0) || (channelValue > 0 && channelValue <= 255 && diff < 0);
  }

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
        style={StyleSheet.flatten([
          styles.touchArea,
          { backgroundColor: bgColor },
        ])}
        onUpdate={setChannelValueDiff}
        onStart={() => setAdjusting(true)}
        onComplete={() => setAdjusting(false)}
      ></ChannelUpdator>
      {/* END: Main touch area */}

      {/* BEGIN: Color display and channel selector */}
      <Tooltip
        tooltipStyle={{ paddingBottom: 0 }}
        isVisible={tutorialStep === TutorialStep.CHANNEL_SELECTOR}
        content={
          <View>
            <Text>
              Tap color channel to change selected channel, and slide
              <Text style={{ fontWeight: "bold" }}> up/down </Text>or
              <Text style={{ fontWeight: "bold" }}> right/left </Text>to adjust
              the value.
            </Text>
          </View>
        }
        showChildInTooltip={false}
        closeOnChildInteraction={false}
        closeOnContentInteraction={false}
        onClose={() => setTutorial(TutorialStep.DONE)}
        placement="top"
        // below is for the status bar of react navigation bar
        topAdjustment={
          Platform.OS === "android" && RNStatusBar.currentHeight
            ? -RNStatusBar.currentHeight
            : 0
        }
      >
        <ChannelSelector
          bgColor={bgColor}
          fgColor={fgColor}
          onColorRefresh={() => {
            setRandomColor((c) => pickRandomColor([c.code]));
          }}
          onColorReset={() => {
            setBgColor(randomColor.code);
            setCommitedBgColor(randomColor.code);
            setSelectedChannel(ColorChannel.RED);
          }}
          selectChannel={setSelectedChannel}
          canReset={commitedBgColor !== randomColor.code}
          selectedChannel={selectedChannel}
        />
      </Tooltip>
      {/* END: Color display and channel selector */}
      {/* BEGIN: Color description */}
      {(!adjusting || !hasColorValueChange(getChannelValue(bgColor, selectedChannel), channelValueDiff)) && matchedColor && (
        <View style={styles.colorDescArea}>
          <Tooltip
            tooltipStyle={{ paddingBottom: 0 }}
            isVisible={tutorialStep === TutorialStep.COLOR_DESC}
            content={
              <View>
                <Text>
                  {" "}
                  A short description of the color if it matches one of the
                  pre-defined colors.{" "}
                </Text>
              </View>
            }
            showChildInTooltip={false}
            closeOnChildInteraction={false}
            closeOnContentInteraction={false}
            onClose={() => setTutorial(TutorialStep.CHANNEL_SELECTOR)}
            placement="top"
            // below is for the status bar of react navigation bar
            topAdjustment={
              Platform.OS === "android" && RNStatusBar.currentHeight
                ? -RNStatusBar.currentHeight
                : 0
            }
          >
            <Text
              style={StyleSheet.flatten([
                styles.colorDescText,
                { color: fgColor },
              ])}
            >
              {matchedColor.desc.map((d) => d.title).join(",")}
            </Text>
          </Tooltip>
        </View>
      )}
      {/* END: Color description */}
      {/* BEGIN: Welcome tutorial */}
      <Tooltip
        tooltipStyle={{ paddingBottom: 0 }}
        isVisible={tutorialStep === TutorialStep.WELCOME}
        content={
          <View>
            <Text>
              Welcome to Beautiful Colors! This tutorial will walk you through how to use it.
            </Text>
            {/* <TouchableHighlight onPress={() => Linking.openURL('https://github.com/taoalpha')}> */}
              {/* <Text style={{color: 'blue'}}>Github</Text> */}
            {/* </TouchableHighlight> */}
          </View>
        }
        closeOnChildInteraction={false}
        closeOnContentInteraction={false}
        onClose={() => setTutorial(TutorialStep.COLOR_DESC)}
        placement="top"
        // below is for the status bar of react navigation bar
        topAdjustment={
          Platform.OS === "android" && RNStatusBar.currentHeight
            ? -RNStatusBar.currentHeight
            : 0
        }
      />
      {/* END: Welcome tutorial */}
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
  colorDescArea: {
    position: "absolute",
    bottom: 20,
  },
  colorDescText: {
    fontSize: 16,
    textAlign: "center",
    ...Platform.select({
      web: {
        userSelect: "none",
      },
    }),
  },
});
