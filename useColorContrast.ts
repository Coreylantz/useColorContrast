import { useEffect, useState } from 'react';

const HEX_REGEX = /^#[0-9a-f]{3,6}$/i;
const RGB_REGEX = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;

export enum ContrastType {
  icon = 3.1,
  largeText = 3.1,
  normalText = 4.5,
}

export enum ColorVersion {
  hex = 'hex',
  rgb = 'rgb',
}

const hexToRgb = (hex: string) => {
  const rgbArray = RGB_REGEX.exec(hex);

  const rgb = rgbArray
    ? [
        parseInt(rgbArray[1], 16),
        parseInt(rgbArray[2], 16),
        parseInt(rgbArray[3], 16),
      ]
    : null;

  return rgb;
};

const transformRGB = (rgb: string) => {
  return rgb.match(/\d+/g);
};

const luminanace = (rgb: number[]) => {
  const a = rgb.map((v: number) => {
    v /= 255;

    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const contrast = (rgb1: number[], rgb2: number[]) => {
  const lum1 = luminanace(rgb1);
  const lum2 = luminanace(rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

const getContrast = (
  foreground: string,
  background: string,
  colorType: ColorVersion,
  ratioType: ContrastType,
) => {
  let colorOne: number[] | RegExpMatchArray | null = hexToRgb(foreground);
  let colorTwo: number[] | RegExpMatchArray | null = hexToRgb(background);

  if (colorType === ColorVersion.rgb) {
    colorOne = transformRGB(foreground);
    colorTwo = transformRGB(background);
  }

  const contrastRatio = contrast(colorOne as number[], colorTwo as number[]);

  return contrastRatio >= ratioType;
};

const checkValidColor = (color: string) =>
  HEX_REGEX.test(color) || RGB_REGEX.test(color);

export const useColorContrast = (
  foreground: string,
  background: string,
  colorType: ColorVersion = ColorVersion.hex,
  ratioType: ContrastType = ContrastType.normalText,
) => {
  const [isMeetsContrast, setIsMeetsContrast] = useState(false);

  useEffect(() => {
    const isValidColors =
      checkValidColor(foreground) && checkValidColor(background);

    if (isValidColors) {
      setIsMeetsContrast(
        getContrast(foreground, background, colorType, ratioType),
      );
    }
  }, [foreground, background, colorType, ratioType]);

  return isMeetsContrast;
};
