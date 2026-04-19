import React from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

type MapViewMockProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  [key: string]: unknown;
};

export default function MapViewMock(props: MapViewMockProps) {
  return <View style={props.style}>{props.children}</View>;
}

export function Marker() {
  return null;
}

export function Polyline() {
  return null;
}

export const PROVIDER_GOOGLE = "google";
