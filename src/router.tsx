import {
  createRouter,
  defaultParseSearch,
  defaultStringifySearch,
} from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const FILTER_KEYS = ["c", "g", "q", "t"] as const;

function parseSearch(search: string) {
  const parsed: Record<string, unknown> = { ...defaultParseSearch(search) };
  const raw = new URLSearchParams(search);
  for (const key of FILTER_KEYS) {
    const value = raw.get(key);
    if (value !== null) {
      parsed[key] = value;
    }
  }
  return parsed;
}

function stringifySearch(search: Record<string, unknown>) {
  const params = new URLSearchParams(defaultStringifySearch(search));
  for (const key of FILTER_KEYS) {
    const value = search[key];
    if (typeof value === "string") {
      params.set(key, value);
    }
  }
  const result = params.toString();
  return result ? `?${result}` : "";
}

export function getRouter() {
  return createRouter({
    parseSearch,
    routeTree,
    scrollRestoration: true,
    stringifySearch,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
