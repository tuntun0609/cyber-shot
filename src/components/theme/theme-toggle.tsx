"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback } from "react";
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
        {/* 图标按当前实际主题切换，避免水合前读不到 theme */}
        <SunIcon className="dark:hidden" />
        <MoonIcon className="hidden dark:block" />
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
