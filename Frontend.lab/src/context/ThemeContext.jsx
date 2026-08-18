import React, { createContext, useState, useEffect, useContext } from "react";

const ThemeModeContext = createContext({
  mode: "light",
  toggleTheme: () => {},
});

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState("light");

  useEffect(() => {
    const savedMode = localStorage.getItem("theme_mode");
    if (savedMode) {
      setMode(savedMode);
    } else {
      // Check system preference
      const systemPreference = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setMode(systemPreference ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      localStorage.setItem("theme_mode", newMode);
      return newMode;
    });
  };

  return (
    <ThemeModeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeModeContext);

export default ThemeModeContext;
