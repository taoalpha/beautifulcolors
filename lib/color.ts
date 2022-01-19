import { BrandColors } from "../constants/brands";
import { ZhongGuoSe } from "../constants/zhongguose";

export enum ColorChannel {
  RED = "red",
  GREEN = "green",
  BLUE = "blue",
}

export interface RGB {
  [ColorChannel.RED]: number;
  [ColorChannel.GREEN]: number;
  [ColorChannel.BLUE]: number;
}

export interface ColorInfo {
  code: string;
  desc: Array<{ title: string; brand_url?: string }>;
}

export enum Category {
  ZHS,
  BRAND,
}

// Pre-compute the map for all pre-defined colors.
const allColors = Object.values(BrandColors).reduce((prev, entry) => {
  for (const c of entry.colors) {
    prev[c] = {
      code: `#${c}`,
      desc: [{ title: `Brand color for ${entry.title}`, brand_url: entry.brand_url || "" }],
    };
  }
  return prev;
}, {} as { [code: string]: ColorInfo });

for (const [c, name] of Object.entries(ZhongGuoSe)) {
  allColors[c] = allColors[c] || {code: `#${c}`, desc: []};
  allColors[c].desc.push({
    title: name,
  });
}

export function pickRandomColor(toExclude: string[] = []): ColorInfo {
  const allColorCodes = Object.keys(allColors).filter(code => !toExclude.includes(code));
  const randomColorCode =
    allColorCodes[Math.floor(Math.random() * allColorCodes.length)];
  return allColors[randomColorCode];
}

export function getMatchedColor(code: string): ColorInfo {
  const colorKey = code.substring(1);
  return allColors[colorKey];
}

export function hexToRgb(hex: string, fallback = { [ColorChannel.RED]: 0, [ColorChannel.GREEN]: 0, [ColorChannel.BLUE]: 0 }) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        [ColorChannel.RED]: parseInt(result[1], 16),
        [ColorChannel.GREEN]: parseInt(result[2], 16),
        [ColorChannel.BLUE]: parseInt(result[3], 16),
      }
    : fallback;
}

function componentToHex(c: number) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(rgb: RGB) {
  return "#" + componentToHex(rgb[ColorChannel.RED]) + componentToHex(rgb[ColorChannel.GREEN]) + componentToHex(rgb[ColorChannel.BLUE]);
}

export function getChannelValue(color: string, channel: ColorChannel) {
  const rgb = hexToRgb(color);
  return rgb[channel];
}
