"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? (resolvedTheme || theme) === "dark" : false;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`relative h-9 w-9 rounded-full border border-[#e7e5e4] dark:border-[#292524] bg-white dark:bg-[#1c1917] text-[#78716c] hover:text-[#1c1917] hover:bg-[#f5f5f4] dark:text-[#a8a29e] dark:hover:text-white dark:hover:bg-[#292524] transition-all shadow-xs ${className ?? ""}`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      title={isDark ? "Dark mode active (Click for Light mode)" : "Light mode active (Click for Dark mode)"}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-[#f59e0b]" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-[#a8a29e]" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
