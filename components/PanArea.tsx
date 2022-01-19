import React, { useRef } from "react";
import { Animated, PanResponder, PanResponderGestureState, StyleProp, ViewStyle } from "react-native";

export default function PanArea({
  handlePanStarted = (gestureState: PanResponderGestureState) => undefined,
  handlePanMove = (gestureState: PanResponderGestureState) => undefined,
  handlePanReleased = (gestureState: PanResponderGestureState) => undefined,
  children = [],
  style,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  handlePanStarted: (gestureState: PanResponderGestureState) => void;
  handlePanMove: (gestureState: PanResponderGestureState) => void;
  handlePanReleased: (gestureState: PanResponderGestureState) => void;
}) {
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        handlePanStarted(gestureState);
      },
      onPanResponderMove: (evt, gestureState) => {
        handlePanMove(gestureState);
      },
      onPanResponderRelease: (evt, gestureState) => {
        handlePanReleased(gestureState);
      },
      onPanResponderTerminate: (evt, gestureState) => {
        handlePanReleased(gestureState);
      },
    })
  ).current;

  return (
    <Animated.View {...panResponder.panHandlers} style={style}>
      {children}
    </Animated.View>
  );
}
