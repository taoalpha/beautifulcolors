import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  PanResponderGestureState,
  StyleProp,
  ViewStyle,
} from "react-native";
import PanArea from "./PanArea";

const windowWidth = Dimensions.get("window").width;
const windowHeigth = Dimensions.get("window").height;

function getDiff(dx: number, dy: number) {
  const diffPerct =
    Math.abs(dx) > Math.abs(dy) ? dx / windowWidth : -dy / windowHeigth;
  return Math.floor(diffPerct * 255);
}

const FINGER_SIZE_OFFSET = [-100, -50];

export default function ChannelUpdator({
  onStart = () => undefined,
  onComplete = () => undefined,
  onUpdate = (value: number) => undefined,
  style,
}: {
  onStart?: () => void;
  onComplete?: () => void;
  onUpdate: (value: number) => void;
  style: StyleProp<ViewStyle>;
}) {
  // TODO: May use this to show sticky tooltip or something.
  const touchPos = useRef(new Animated.ValueXY()).current;

  function updateOffSet(gestureState: PanResponderGestureState) {
    const { x0, y0 } = gestureState;
    // Initial offset to track the current touch position.
    touchPos.setOffset({
      x: x0 + FINGER_SIZE_OFFSET[0],
      y: y0 + FINGER_SIZE_OFFSET[1],
    });
  }

  const handlePanStarted = (gestureState: PanResponderGestureState) => {
    updateOffSet(gestureState);
    onStart();
    return undefined;
  };

  const handlePanReleased = (gestureState: PanResponderGestureState) => {
    onComplete();
    return undefined;
  };

  const handlePanMove = (gestureState: PanResponderGestureState) => {
    Animated.event([{ dx: touchPos.x, dy: touchPos.y }], {
      useNativeDriver: false,
    })(gestureState);
    const diff = getDiff(gestureState.dx, gestureState.dy);
    onUpdate(diff);
    updateOffSet(gestureState);
    return undefined;
  };

  return (
    <PanArea
      handlePanReleased={handlePanReleased}
      handlePanStarted={handlePanStarted}
      handlePanMove={handlePanMove}
      style={style}
    />
  );
}