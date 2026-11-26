import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_catalog/pose")({
  head: () => ({
    meta: [
      { title: "姿势库 · cyber-shot" },
      {
        content: "坐姿、站姿、近景等动作素材，附中英文提示词与黑线白模参考图。",
        name: "description",
      },
    ],
  }),
});
