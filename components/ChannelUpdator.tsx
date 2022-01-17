import React, { useState, useRef, useCallback} from "react";
import {
  Animated,
  Text,
  Platform,
  StyleSheet,
  Dimensions,
  PanResponderGestureState,
  StyleProp,
  ViewStyle,
} from "react-native";
import { ColorChannel } from "./ChannelSelector";
import PanArea from "./PanArea";

const windowWidth = Dimensions.get("window").width;
const windowHeigth = Dimensions.get("window").height;

function ensureColorBoundary(code: number, step: number) {
  const sign = step > 0 ? 1 : -1;
  return Math.max(Math.min(255, code + sign * Math.max(Math.abs(step), 1)), 0);
}

function getDiff(dx: number, dy: number) {
  const diffPerct = Math.abs(dx) > Math.abs(dy) ? dx / windowWidth : -dy / windowHeigth;
  return Math.floor(diffPerct * 255);
}

const FINGER_SIZE_OFFSET = [-100, -50];

export default function ChannelUpdator({
  handleStarted = () => undefined,
  handleUpdate = (value: number) => undefined,
  channel,
  style,
  fgColor,
}: {
  handleStarted?: () => void;
  handleUpdate: (value: number) => void;
  channel:  ColorChannel;
  style: StyleProp<ViewStyle>;
  fgColor: string;
}) {
  const [adjusting, setAdjusting] = useState(false);
  const [diff, setDiff] = useState({ x: 0, y: 0, value: 0 });
  const touchPos = useRef(new Animated.ValueXY()).current;

  function updateOffSet(gestureState: PanResponderGestureState) {
    const { x0, y0, dx, dy } = gestureState;
    // Initial offset to track the current touch position.
    const curPos = [x0 + dx, y0 + dy];
    touchPos.setOffset({
      x: x0 + FINGER_SIZE_OFFSET[0],
      y: y0 + FINGER_SIZE_OFFSET[1],
    });
  }

  const handlePanStarted = (gestureState: PanResponderGestureState) => {
    updateOffSet(gestureState);
    handleStarted();
    setAdjusting(true);
    return undefined;
  };

  const handlePanReleased = (gestureState: PanResponderGestureState) => {
    handleUpdate(getDiff(gestureState.dx, gestureState.dy));
    setAdjusting(false);
    return undefined;
  };

  const handlePanMove = (gestureState: PanResponderGestureState) => {
    setDiff({
      x: gestureState.x0,
      y: gestureState.y0,
      value: getDiff(gestureState.dx, gestureState.dy),
    });
    Animated.event([{ dx: touchPos.x, dy: touchPos.y }], {
      useNativeDriver: false,
    })(gestureState);

    updateOffSet(gestureState);
    return undefined;
  };

  return (
    <PanArea
      handlePanReleased={handlePanReleased}
      handlePanStarted={handlePanStarted}
      handlePanMove={handlePanMove}
      style={style}
    >
      {adjusting && (
        <Animated.View
          style={{ ...touchPos.getLayout(), position: "absolute" }}
        >
          <Text style={StyleSheet.flatten([styles.tooltip, {color: fgColor}])}>
            Add {diff.value} to {channel}
          </Text>
        </Animated.View>
      )}
    </PanArea>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    paddingBottom: 20,
    color: "white",
    fontSize: 20,
    ...Platform.select({
      web: {
        userSelect: "none",
      },
    }),
  },
});
