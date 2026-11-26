import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  beforeLoad: () => {
    throw redirect({
      params: { category: "hair" },
      replace: true,
      search: {},
      to: "/admin/$category",
    });
  },
});
