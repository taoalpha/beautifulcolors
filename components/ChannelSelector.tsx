import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
  MutableRefObject,
} from "react";
import { AntDesign, Entypo } from "@expo/vector-icons";
import {
  TouchableWithoutFeedback,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

export enum ColorChannel {
  RED = "red",
  GREEN = "green",
  BLUE = "blue",
}

const ICON_SIZE = 32;

export default function ChannelSelector({
  selectedChannel,
  channels,
  fgColor,
  style,
  onChannelChange = (channel: ColorChannel) => undefined,
}: {
  selectedChannel: ColorChannel;
  channels: ColorChannel[];
  fgColor: string;
  style: ViewStyle;
  onChannelChange?: (channel: ColorChannel) => void;
}) {
  const [channelSelectMode, setChannelSelectMode] = useState(false);

  return (
    <View style={StyleSheet.flatten([styles.menuView, style])}>
      {!channelSelectMode ? (
        <TouchableWithoutFeedback
          onPress={() => setChannelSelectMode(!channelSelectMode)}
        >
          <View
            style={StyleSheet.flatten([
              styles.channelView,
              { borderColor: fgColor },
            ])}
          >
            <Text
              style={StyleSheet.flatten([
                styles.channelText,
                { color: fgColor },
              ])}
            >
              {selectedChannel.substring(0, 1).toUpperCase()}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      ) : (
        <>
          {channels.map((channel, key) => (
            <TouchableWithoutFeedback
              key={key}
              onPress={() => {
                setChannelSelectMode(false);
                onChannelChange(channel);
              }}
            >
              <View
                style={StyleSheet.flatten([
                  styles.channelView,
                  {
                    backgroundColor: channel,
                    borderColor:
                      channel === selectedChannel ? "white" : "black",
                  },
                ])}
              >
                <Text
                  style={StyleSheet.flatten([
                    styles.channelText,
                    channel === selectedChannel ? { color: "white" } : {},
                  ])}
                >
                  {channel.substring(0, 1).toUpperCase()}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          ))}
          <TouchableWithoutFeedback onPress={() => setChannelSelectMode(false)}>
            <AntDesign name="close" size={ICON_SIZE} color={fgColor} />
          </TouchableWithoutFeedback>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  menuView: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: ICON_SIZE,
  },

  channelView: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    borderWidth: 1,
    display: "flex",
    justifyContent: "center",
    marginBottom: 8,
  },

  channelText: {
    textAlign: "center",
  },
});
