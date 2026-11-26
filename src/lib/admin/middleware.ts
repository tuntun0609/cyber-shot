import { createMiddleware } from "@tanstack/react-start";

// 所有后台 server function 和 /admin 的 loader 都挂这个中间件。
// 目前不做任何校验，之后接入登录时只需要改这一处。
export const adminMiddleware = createMiddleware({ type: "function" }).server(
  ({ next }) => next()
);
