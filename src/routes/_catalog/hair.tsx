import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_catalog/hair")({
  head: () => ({
    meta: [
      { title: "发型库 · cyber-shot" },
      {
        content: "披发、短发、卷发等发型素材，附中英文提示词与三视图参考图。",
        name: "description",
      },
    ],
  }),
});
