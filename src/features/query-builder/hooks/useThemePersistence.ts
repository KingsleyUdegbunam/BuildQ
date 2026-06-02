import { useEffect } from "react";

const THEME_STORAGE_KEY = "buildq-theme";

export function useThemePersistence(theme: "light" | "dark") {
  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.cookie = `${THEME_STORAGE_KEY}=${theme}; path=/; max-age=31536000; samesite=lax`;
  }, [theme]);
}
