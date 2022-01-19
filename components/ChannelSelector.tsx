import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import {
  TouchableWithoutFeedback,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  hexToRgb,
  ColorChannel,
} from "../lib/color";

export default function ChannelSelector({
  selectedChannel,
  canReset,
  bgColor,
  fgColor,
  onColorReset, 
  onColorRefresh, 
  selectChannel,
}: {
  selectedChannel: ColorChannel,
  canReset: boolean,
  bgColor: string;
  fgColor: string;
  onColorReset: () => void;
  onColorRefresh: () => void;
  selectChannel: (channel: ColorChannel) => void;
}) {
  const onColorLongPress = () => {
    // Support some actions like:
    // 1. suggest name for a color
  };

  return (
    <TouchableWithoutFeedback onLongPress={onColorLongPress}>
    <View style={styles.colorDisplayArea}>
      <View style={styles.colorCodes}>
        {Object.entries(hexToRgb(bgColor)).map(([channel, val], key) => (
          <TouchableWithoutFeedback
            key={key}
            onPress={() => selectChannel(channel as ColorChannel)}
          >
            <View style={styles.colorCode}>
              <Text
                style={StyleSheet.flatten([
                  styles.colorCodeNameText,
                  {
                    color: channel === selectedChannel ? channel : fgColor,
                  },
                ])}
              >
                {channel.substring(0, 1)}
              </Text>
              <Text
                style={StyleSheet.flatten([
                  styles.colorCodeText,
                  {
                    color: channel === selectedChannel ? channel : fgColor,
                  },
                ])}
              >
                {val}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        ))}
        <View style={styles.colorActionArea}>
          <TouchableWithoutFeedback
            onPress={onColorRefresh}
          >
            <MaterialIcons name="refresh" size={24} color={fgColor} />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={onColorReset}
          >
            <MaterialIcons
              name="format-color-reset"
              size={24}
              color={fgColor}
              style={{
                opacity: canReset ? 1 : 0,
              }}
            />
          </TouchableWithoutFeedback>
        </View>
      </View>
    </View>
  </TouchableWithoutFeedback> 
  );
}

const styles = StyleSheet.create({
  colorDisplayArea: {},
  colorCodes: {
    display: "flex",
    flexDirection: "row",
  },
  colorCode: {
    display: "flex",
    width: 100,
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  colorCodeNameText: {
    fontSize: 20,
    textAlign: "center",
    textTransform: "uppercase",
    ...Platform.select({
      web: {
        userSelect: "none",
      },
    }),
  },
  colorCodeText: {
    fontSize: 40,
    textAlign: "center",
    textTransform: "uppercase",
    ...Platform.select({
      web: {
        userSelect: "none",
      },
    }),
  },
  colorActionArea: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    ...Platform.select({
      web: {
        cursor: "pointer",
        userSelect: "none",
      },
    }),
  },
});
