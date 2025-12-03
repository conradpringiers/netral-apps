/**
 * Netral Theme System
 * Defines all available themes for Netral Apps
 */

export type ThemeName = 
  | 'Modern'
  | 'Natural'
  | 'Latte'
  | 'Dark Mode'
  | 'Terminal'
  | 'Ocean'
  | 'Solarized'
  | 'Midnight'
  | 'Minimal';

export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  card: string;
  cardForeground: string;
  warning: string;
  info: string;
  success: string;
}

export interface Theme {
  name: ThemeName;
  colors: ThemeColors;
  fontFamily: string;
  borderRadius: string;
}

export const themes: Record<ThemeName, Theme> = {
  'Modern': {
    name: 'Modern',
    colors: {
      background: '0 0% 100%',
      foreground: '222 47% 11%',
      primary: '221 83% 53%',
      primaryForeground: '0 0% 100%',
      secondary: '210 40% 96%',
      secondaryForeground: '222 47% 11%',
      muted: '210 40% 96%',
      mutedForeground: '215 16% 47%',
      accent: '210 40% 96%',
      accentForeground: '222 47% 11%',
      border: '214 32% 91%',
      card: '0 0% 100%',
      cardForeground: '222 47% 11%',
      warning: '38 92% 50%',
      info: '199 89% 48%',
      success: '142 71% 45%',
    },
    fontFamily: "'Inter', system-ui, sans-serif",
    borderRadius: '0.5rem',
  },
  'Natural': {
    name: 'Natural',
    colors: {
      background: '40 33% 98%',
      foreground: '25 30% 15%',
      primary: '142 50% 40%',
      primaryForeground: '0 0% 100%',
      secondary: '40 30% 92%',
      secondaryForeground: '25 30% 15%',
      muted: '40 20% 94%',
      mutedForeground: '25 15% 45%',
      accent: '30 60% 50%',
      accentForeground: '0 0% 100%',
      border: '40 20% 85%',
      card: '40 33% 99%',
      cardForeground: '25 30% 15%',
      warning: '38 92% 50%',
      info: '142 50% 40%',
      success: '142 60% 45%',
    },
    fontFamily: "'Georgia', serif",
    borderRadius: '0.75rem',
  },
  'Latte': {
    name: 'Latte',
    colors: {
      background: '30 25% 97%',
      foreground: '20 20% 20%',
      primary: '25 60% 45%',
      primaryForeground: '0 0% 100%',
      secondary: '30 20% 90%',
      secondaryForeground: '20 20% 20%',
      muted: '30 15% 92%',
      mutedForeground: '20 10% 50%',
      accent: '15 70% 55%',
      accentForeground: '0 0% 100%',
      border: '30 15% 85%',
      card: '30 25% 99%',
      cardForeground: '20 20% 20%',
      warning: '38 92% 50%',
      info: '25 60% 45%',
      success: '142 50% 45%',
    },
    fontFamily: "'Inter', system-ui, sans-serif",
    borderRadius: '1rem',
  },
  'Dark Mode': {
    name: 'Dark Mode',
    colors: {
      background: '224 14% 10%',
      foreground: '210 40% 98%',
      primary: '221 83% 53%',
      primaryForeground: '0 0% 100%',
      secondary: '224 14% 16%',
      secondaryForeground: '210 40% 98%',
      muted: '224 14% 16%',
      mutedForeground: '215 20% 65%',
      accent: '224 14% 20%',
      accentForeground: '210 40% 98%',
      border: '224 14% 20%',
      card: '224 14% 12%',
      cardForeground: '210 40% 98%',
      warning: '38 92% 50%',
      info: '199 89% 48%',
      success: '142 71% 45%',
    },
    fontFamily: "'Inter', system-ui, sans-serif",
    borderRadius: '0.5rem',
  },
  'Terminal': {
    name: 'Terminal',
    colors: {
      background: '0 0% 6%',
      foreground: '120 100% 65%',
      primary: '120 100% 50%',
      primaryForeground: '0 0% 0%',
      secondary: '0 0% 12%',
      secondaryForeground: '120 100% 65%',
      muted: '0 0% 15%',
      mutedForeground: '120 50% 50%',
      accent: '120 100% 40%',
      accentForeground: '0 0% 0%',
      border: '120 50% 20%',
      card: '0 0% 8%',
      cardForeground: '120 100% 65%',
      warning: '60 100% 50%',
      info: '180 100% 50%',
      success: '120 100% 50%',
    },
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    borderRadius: '0',
  },
  'Ocean': {
    name: 'Ocean',
    colors: {
      background: '200 30% 98%',
      foreground: '200 50% 15%',
      primary: '200 80% 45%',
      primaryForeground: '0 0% 100%',
      secondary: '200 30% 92%',
      secondaryForeground: '200 50% 15%',
      muted: '200 20% 94%',
      mutedForeground: '200 20% 45%',
      accent: '180 60% 45%',
      accentForeground: '0 0% 100%',
      border: '200 20% 85%',
      card: '200 30% 99%',
      cardForeground: '200 50% 15%',
      warning: '38 92% 50%',
      info: '200 80% 45%',
      success: '160 60% 45%',
    },
    fontFamily: "'Inter', system-ui, sans-serif",
    borderRadius: '0.75rem',
  },
  'Solarized': {
    name: 'Solarized',
    colors: {
      background: '44 87% 94%',
      foreground: '192 81% 14%',
      primary: '18 89% 55%',
      primaryForeground: '44 87% 94%',
      secondary: '44 50% 88%',
      secondaryForeground: '192 81% 14%',
      muted: '44 40% 90%',
      mutedForeground: '194 14% 40%',
      accent: '175 59% 40%',
      accentForeground: '44 87% 94%',
      border: '44 30% 80%',
      card: '44 87% 96%',
      cardForeground: '192 81% 14%',
      warning: '45 100% 35%',
      info: '175 59% 40%',
      success: '68 100% 30%',
    },
    fontFamily: "'Inter', system-ui, sans-serif",
    borderRadius: '0.375rem',
  },
  'Midnight': {
    name: 'Midnight',
    colors: {
      background: '240 20% 8%',
      foreground: '240 10% 90%',
      primary: '260 80% 60%',
      primaryForeground: '0 0% 100%',
      secondary: '240 15% 15%',
      secondaryForeground: '240 10% 90%',
      muted: '240 15% 18%',
      mutedForeground: '240 10% 60%',
      accent: '280 70% 55%',
      accentForeground: '0 0% 100%',
      border: '240 15% 20%',
      card: '240 20% 10%',
      cardForeground: '240 10% 90%',
      warning: '38 92% 50%',
      info: '260 80% 60%',
      success: '142 71% 45%',
    },
    fontFamily: "'Inter', system-ui, sans-serif",
    borderRadius: '0.75rem',
  },
  'Minimal': {
    name: 'Minimal',
    colors: {
      background: '0 0% 100%',
      foreground: '0 0% 10%',
      primary: '0 0% 10%',
      primaryForeground: '0 0% 100%',
      secondary: '0 0% 96%',
      secondaryForeground: '0 0% 10%',
      muted: '0 0% 96%',
      mutedForeground: '0 0% 45%',
      accent: '0 0% 90%',
      accentForeground: '0 0% 10%',
      border: '0 0% 90%',
      card: '0 0% 100%',
      cardForeground: '0 0% 10%',
      warning: '38 92% 50%',
      info: '0 0% 45%',
      success: '0 0% 30%',
    },
    fontFamily: "'Inter', system-ui, sans-serif",
    borderRadius: '0',
  },
};

export function getTheme(name: ThemeName): Theme {
  return themes[name] || themes['Modern'];
}

export function getThemeNames(): ThemeName[] {
  return Object.keys(themes) as ThemeName[];
}

/**
 * Generate CSS variables for a theme
 */
export function generateThemeCSS(theme: Theme): string {
  return `
    --background: ${theme.colors.background};
    --foreground: ${theme.colors.foreground};
    --primary: ${theme.colors.primary};
    --primary-foreground: ${theme.colors.primaryForeground};
    --secondary: ${theme.colors.secondary};
    --secondary-foreground: ${theme.colors.secondaryForeground};
    --muted: ${theme.colors.muted};
    --muted-foreground: ${theme.colors.mutedForeground};
    --accent: ${theme.colors.accent};
    --accent-foreground: ${theme.colors.accentForeground};
    --border: ${theme.colors.border};
    --card: ${theme.colors.card};
    --card-foreground: ${theme.colors.cardForeground};
    --warning: ${theme.colors.warning};
    --info: ${theme.colors.info};
    --success: ${theme.colors.success};
    --radius: ${theme.borderRadius};
    --font-family: ${theme.fontFamily};
  `;
}
