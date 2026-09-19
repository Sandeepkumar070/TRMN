import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export const themeOptions = [
  { id: "blue", name: "Ocean Blue", primary: "#2563eb", dark: "#1e40af", deep: "#172554", soft: "#dbeafe" },
  { id: "red", name: "Pitech Red", primary: "#e53935", dark: "#b91c1c", deep: "#7f1d1d", soft: "#fee2e2" },
  { id: "green", name: "Emerald", primary: "#059669", dark: "#047857", deep: "#064e3b", soft: "#d1fae5" },
  { id: "purple", name: "Royal Purple", primary: "#7c3aed", dark: "#5b21b6", deep: "#3b0764", soft: "#ede9fe" },
  { id: "orange", name: "Sunset Orange", primary: "#ea580c", dark: "#c2410c", deep: "#7c2d12", soft: "#ffedd5" },
  { id: "teal", name: "Industrial Teal", primary: "#0d9488", dark: "#0f766e", deep: "#134e4a", soft: "#ccfbf1" },
  { id: "indigo", name: "Indigo", primary: "#4f46e5", dark: "#3730a3", deep: "#312e81", soft: "#e0e7ff" },
  { id: "rose", name: "Rose", primary: "#e11d48", dark: "#be123c", deep: "#881337", soft: "#ffe4e6" },
  { id: "slate", name: "Steel Slate", primary: "#475569", dark: "#334155", deep: "#0f172a", soft: "#e2e8f0" },
  { id: "amber", name: "Amber", primary: "#d97706", dark: "#b45309", deep: "#78350f", soft: "#fef3c7" },
];

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("tag-ui-mode") || "light");
  const [themeId, setThemeId] = useState(() => localStorage.getItem("tag-ui-color") || "blue");

  const activeTheme = useMemo(
    () => themeOptions.find((item) => item.id === themeId) || themeOptions[0],
    [themeId]
  );

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.mode = mode;
    root.style.setProperty("--theme-primary", activeTheme.primary);
    root.style.setProperty("--theme-dark", activeTheme.dark);
    root.style.setProperty("--theme-deep", activeTheme.deep);
    root.style.setProperty("--theme-soft", activeTheme.soft);

    localStorage.setItem("tag-ui-mode", mode);
    localStorage.setItem("tag-ui-color", themeId);
  }, [mode, themeId, activeTheme]);

  const toggleMode = () => setMode((current) => (current === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider
      value={{ mode, setMode, toggleMode, themeId, setThemeId, activeTheme, themeOptions }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
