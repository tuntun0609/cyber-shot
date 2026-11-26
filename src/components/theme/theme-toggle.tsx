"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEMES = [
  { icon: SunIcon, label: "浅色", value: "light" },
  { icon: MoonIcon, label: "深色", value: "dark" },
  { icon: MonitorIcon, label: "跟随系统", value: "system" },
] as const;

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // 水合前读不到 theme，先用占位图标避免不一致
  const CurrentIcon = mounted
    ? (THEMES.find((item) => item.value === theme)?.icon ?? MonitorIcon)
    : MonitorIcon;
  const handleChange = useCallback(
    (value: unknown) => {
      if (typeof value === "string") {
        setTheme(value);
      }
    },
    [setTheme]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button aria-label="切换主题" size="icon-lg" variant="ghost" />}
      >
        <CurrentIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuGroup>
          <DropdownMenuLabel>主题</DropdownMenuLabel>
          <DropdownMenuRadioGroup onValueChange={handleChange} value={theme}>
            {THEMES.map(({ icon: Icon, label, value }) => (
              <DropdownMenuRadioItem key={value} value={value}>
                <Icon />
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
