import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { createCsrfMiddleware, createStart } from "@tanstack/react-start";
import { getEnv } from "@/lib/env";

export const startInstance = createStart(() => ({
  requestMiddleware: [
    createCsrfMiddleware({
      filter: (context) => context.handlerType === "serverFn",
    }),
    clerkMiddleware(({ url }) => {
      const env = getEnv();
      return {
        authorizedParties: [url.origin],
        publishableKey: env.CLERK_PUBLISHABLE_KEY,
        secretKey: env.CLERK_SECRET_KEY,
        signInFallbackRedirectUrl: "/admin",
        signInUrl: "/sign-in",
      };
    }),
  ],
}));
