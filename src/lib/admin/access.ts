// 登录回跳只接受本站后台路径，避免外部地址和登录页循环跳转。
export function getAdminReturnTo(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/admin";
  }
  const url = new URL(value, "https://app.invalid");
  if (
    url.origin !== "https://app.invalid" ||
    !(url.pathname === "/admin" || url.pathname.startsWith("/admin/"))
  ) {
    return "/admin";
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

export function getSignInHref(returnTo: unknown = "/admin"): string {
  const search = new URLSearchParams({
    redirect_url: getAdminReturnTo(returnTo),
  });
  return `/sign-in?${search}`;
}

export const ADMIN_FORBIDDEN_HREF = "/?notice=admin-forbidden";
