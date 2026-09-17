export interface ThemeDefinition {
  id: string;
  name: string;
  subtitle: string;
  badge?: string;
  bg: string;
  accent: string;
  secondary: string;
  text: string;
  colors: {
    bgBase: string;
    bgSurface: string;
    bgElevated: string;
    borderSubtle: string;
    borderStrong: string;
    textMain: string;
    textSecondary: string;
    textMuted: string;
    textDim: string;
    textFaint: string;
    accentLight: string;
    accentMain: string;
    accentBold: string;
    accentDark: string;
    secondaryMain: string;
    secondaryLight: string;
    secondaryDark: string;
  };
}

export const THEMES: ThemeDefinition[] = [
  {
    id: "matte-lavender",
    name: "Matte Noir & Lavender",
    subtitle: "Matte Black with Dusty Lavender, Sage Green & Alabaster Off-White",
    badge: "Requested",
    bg: "#1A1A1A",
    accent: "#C3B1E1",
    secondary: "#9CB4A6",
    text: "#F5F5F0",
    colors: {
      bgBase: "#1A1A1A",
      bgSurface: "#232323",
      bgElevated: "#2D2D2D",
      borderSubtle: "#363636",
      borderStrong: "#4A4A4A",
      textMain: "#F5F5F0",
      textSecondary: "#DCDCD6",
      textMuted: "#AFAFA8",
      textDim: "#7E7E78",
      textFaint: "#5C5C57",
      accentLight: "#D7CBEE",
      accentMain: "#C3B1E1",
      accentBold: "#B09CCA",
      accentDark: "#8F79AB",
      secondaryMain: "#9CB4A6",
      secondaryLight: "#B8CBC0",
      secondaryDark: "#7C9687",
    },
  },
  {
    id: "amber-vault",
    name: "Warm Amber & Vinyl",
    subtitle: "Vintage analog acoustics, tube amp glow & VU meter teal",
    badge: "Analog Classic",
    bg: "#0C0A09",
    accent: "#F59E0B",
    secondary: "#14B8A6",
    text: "#FAF7F2",
    colors: {
      bgBase: "#0C0A09",
      bgSurface: "#1C1917",
      bgElevated: "#292524",
      borderSubtle: "#292524",
      borderStrong: "#44403C",
      textMain: "#FAF7F2",
      textSecondary: "#E7E5E4",
      textMuted: "#A8A29E",
      textDim: "#78716C",
      textFaint: "#57534E",
      accentLight: "#FCD34D",
      accentMain: "#F59E0B",
      accentBold: "#D97706",
      accentDark: "#B45309",
      secondaryMain: "#14B8A6",
      secondaryLight: "#5EEAD4",
      secondaryDark: "#0F766E",
    },
  },
  {
    id: "nordic-frost",
    name: "Nordic Slate & Sky",
    subtitle: "Crisp sub-zero digital studio, glacier sky & frost coral",
    badge: "Studio Pro",
    bg: "#0B0F17",
    accent: "#38BDF8",
    secondary: "#FB7185",
    text: "#F8FAFC",
    colors: {
      bgBase: "#0B0F17",
      bgSurface: "#131A26",
      bgElevated: "#1E293B",
      borderSubtle: "#1E293B",
      borderStrong: "#334155",
      textMain: "#F8FAFC",
      textSecondary: "#E2E8F0",
      textMuted: "#94A3B8",
      textDim: "#64748B",
      textFaint: "#475569",
      accentLight: "#7DD3FC",
      accentMain: "#38BDF8",
      accentBold: "#0284C7",
      accentDark: "#0369A1",
      secondaryMain: "#FB7185",
      secondaryLight: "#FDA4AF",
      secondaryDark: "#E11D48",
    },
  },
  {
    id: "emerald-moss",
    name: "Forest Moss & Brass",
    subtitle: "Deep pine canopy, vibrant emerald jade & antique brass",
    badge: "Botanical",
    bg: "#08110D",
    accent: "#34D399",
    secondary: "#F59E0B",
    text: "#F0FDF4",
    colors: {
      bgBase: "#08110D",
      bgSurface: "#101E17",
      bgElevated: "#162B21",
      borderSubtle: "#193327",
      borderStrong: "#274C3B",
      textMain: "#F0FDF4",
      textSecondary: "#DCFCE7",
      textMuted: "#86EFAC",
      textDim: "#4ADE80",
      textFaint: "#22C55E",
      accentLight: "#6EE7B7",
      accentMain: "#34D399",
      accentBold: "#10B981",
      accentDark: "#059669",
      secondaryMain: "#F59E0B",
      secondaryLight: "#FCD34D",
      secondaryDark: "#B45309",
    },
  },
  {
    id: "velvet-rose",
    name: "Velvet Night & Rose",
    subtitle: "Midnight wine cabaret, rose quartz & champagne gold",
    badge: "Nocturne",
    bg: "#14080A",
    accent: "#FB7185",
    secondary: "#FBBF24",
    text: "#FFF1F2",
    colors: {
      bgBase: "#14080A",
      bgSurface: "#200D11",
      bgElevated: "#2E131A",
      borderSubtle: "#381820",
      borderStrong: "#4F202C",
      textMain: "#FFF1F2",
      textSecondary: "#FFE4E6",
      textMuted: "#FDA4AF",
      textDim: "#FB7185",
      textFaint: "#F43F5E",
      accentLight: "#FDA4AF",
      accentMain: "#FB7185",
      accentBold: "#E11D48",
      accentDark: "#BE123C",
      secondaryMain: "#FBBF24",
      secondaryLight: "#FDE68A",
      secondaryDark: "#D97706",
    },
  },
  {
    id: "cyber-sunset",
    name: "Cyber Sunset & Violet",
    subtitle: "Deep void indigo with electric violet & sunset tangerine",
    badge: "Synthwave",
    bg: "#0F0A1C",
    accent: "#A855F7",
    secondary: "#FB923C",
    text: "#FAF5FF",
    colors: {
      bgBase: "#0F0A1C",
      bgSurface: "#18102E",
      bgElevated: "#241744",
      borderSubtle: "#301E5B",
      borderStrong: "#452A80",
      textMain: "#FAF5FF",
      textSecondary: "#F3E8FF",
      textMuted: "#D8B4FE",
      textDim: "#C084FC",
      textFaint: "#A855F7",
      accentLight: "#C084FC",
      accentMain: "#A855F7",
      accentBold: "#9333EA",
      accentDark: "#7E22CE",
      secondaryMain: "#FB923C",
      secondaryLight: "#FDBA74",
      secondaryDark: "#EA580C",
    },
  },
  {
    id: "monochrome",
    name: "Studio Monochrome",
    subtitle: "High contrast pure matte black, titanium white & ice cyan",
    badge: "Minimalist",
    bg: "#121212",
    accent: "#F3F4F6",
    secondary: "#60A5FA",
    text: "#FFFFFF",
    colors: {
      bgBase: "#121212",
      bgSurface: "#1E1E1E",
      bgElevated: "#292929",
      borderSubtle: "#333333",
      borderStrong: "#4A4A4A",
      textMain: "#FFFFFF",
      textSecondary: "#E5E5E5",
      textMuted: "#A3A3A3",
      textDim: "#737373",
      textFaint: "#525252",
      accentLight: "#FFFFFF",
      accentMain: "#F3F4F6",
      accentBold: "#D1D5DB",
      accentDark: "#9CA3AF",
      secondaryMain: "#60A5FA",
      secondaryLight: "#93C5FD",
      secondaryDark: "#2563EB",
    },
  },
];

const THEME_STORAGE_KEY = "archive_tuner_active_theme";

export function getStoredThemeId(): string {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved;
    }
  } catch (e) {
    // LocalStorage unavailable
  }
  // Default to requested theme: Matte Noir & Lavender
  return "matte-lavender";
}

export function saveThemeId(themeId: string): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch (e) {
    // Ignore error
  }
}

export function applyThemeToDOM(themeId: string): void {
  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  const root = document.documentElement;

  // Set the data-theme attribute on root
  root.setAttribute("data-theme", theme.id);

  // Apply explicit CSS variables for full instant reactivity and browser compatibility
  const { colors } = theme;
  root.style.setProperty("--color-bg-base", colors.bgBase);
  root.style.setProperty("--color-bg-surface", colors.bgSurface);
  root.style.setProperty("--color-bg-elevated", colors.bgElevated);
  root.style.setProperty("--color-border-subtle", colors.borderSubtle);
  root.style.setProperty("--color-border-strong", colors.borderStrong);

  root.style.setProperty("--color-text-main", colors.textMain);
  root.style.setProperty("--color-text-secondary", colors.textSecondary);
  root.style.setProperty("--color-text-muted", colors.textMuted);
  root.style.setProperty("--color-text-dim", colors.textDim);
  root.style.setProperty("--color-text-faint", colors.textFaint);

  root.style.setProperty("--color-accent-light", colors.accentLight);
  root.style.setProperty("--color-accent-main", colors.accentMain);
  root.style.setProperty("--color-accent-bold", colors.accentBold);
  root.style.setProperty("--color-accent-dark", colors.accentDark);

  root.style.setProperty("--color-secondary-main", colors.secondaryMain);
  root.style.setProperty("--color-secondary-light", colors.secondaryLight);
  root.style.setProperty("--color-secondary-dark", colors.secondaryDark);
  root.style.setProperty("--color-accent-sage", colors.secondaryMain);

  // Also set body background directly so during initial paint there is no flash
  document.body.style.backgroundColor = colors.bgBase;
  document.body.style.color = colors.textMain;
}
