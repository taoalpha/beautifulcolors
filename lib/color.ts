import { BrandColors } from "../constants/brands";
import { ZhongGuoSe } from "../constants/zhongguose";

export interface RGB {
  r: number;
  g: number;
  b: number;
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

export function pickRandomColor(): ColorInfo {
  const allColorCodes = Object.keys(allColors);
  const randomColorCode =
    allColorCodes[Math.floor(Math.random() * allColorCodes.length)];
  return allColors[randomColorCode];
}

export function getMatchedColor(code: string): ColorInfo {
  const colorKey = code.substring(1);
  return allColors[colorKey];
}

export function hexToRgb(hex: string, fallback = { r: 0, g: 0, b: 0 }) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : fallback;
}

function componentToHex(c: number) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex({ r = 0, g = 0, b = 0 } = {}) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
