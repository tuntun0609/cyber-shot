import { isBuiltin } from "node:module";
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/rsbuild";

export default defineConfig(({ command }) => ({
  environments:
    command === "build"
      ? {
          ssr: {
            output: { module: true },
            tools: {
              rspack(config) {
                config.externalsPresets = {
                  ...config.externalsPresets,
                  node: false,
                };
                config.externals = [
                  ({ request }, callback) => {
                    if (request === "cloudflare:workers") {
                      return callback(null, `module ${request}`);
                    }
                    if (!(request && isBuiltin(request))) {
                      return callback();
                    }
                    const specifier = request.startsWith("node:")
                      ? request
                      : `node:${request}`;
                    return callback(null, `module ${specifier}`);
                  },
                ];
              },
            },
          },
        }
      : undefined,
  plugins: [pluginReact(), tanstackStart()],
  server: { port: 3000 },
}));
