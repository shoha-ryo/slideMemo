import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
			className=""
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
		>
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}