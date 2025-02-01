// Fonction pour convertir une couleur hexadécimale en RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Calculer la luminance relative d'une couleur
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Calculer le ratio de contraste entre deux couleurs
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

// Vérifier si le contraste est suffisant pour le texte
export const isContrastValid = (
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
};

// Suggérer une couleur de texte (noir ou blanc) basée sur la couleur de fond
export const getSuggestedTextColor = (backgroundColor: string): string => {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return '#000000';

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Ajuster la couleur pour atteindre le contraste minimum requis
export const adjustColorForContrast = (
  color: string,
  backgroundColor: string,
  targetRatio: number = 4.5
): string => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  let { r, g, b } = rgb;
  const step = 5;
  let currentRatio = getContrastRatio(color, backgroundColor);

  while (currentRatio < targetRatio) {
    // Assombrir ou éclaircir la couleur
    if (getLuminance(r, g, b) > 0.5) {
      r = Math.max(0, r - step);
      g = Math.max(0, g - step);
      b = Math.max(0, b - step);
    } else {
      r = Math.min(255, r + step);
      g = Math.min(255, g + step);
      b = Math.min(255, b + step);
    }

    const newColor = `#${r.toString(16).padStart(2, '0')}${g
      .toString(16)
      .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    currentRatio = getContrastRatio(newColor, backgroundColor);

    if ((r === 0 && g === 0 && b === 0) || (r === 255 && g === 255 && b === 255)) {
      break;
    }
  }

  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};
