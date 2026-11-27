import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { getAdminAccess } from "./auth.server";

export const loadAdminAccess = createServerFn().handler(() => {
  setResponseHeader("Cache-Control", "private, no-store");
  return getAdminAccess();
});
