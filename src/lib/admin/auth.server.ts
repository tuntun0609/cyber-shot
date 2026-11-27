import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { redirect } from "@tanstack/react-router";
import { ADMIN_FORBIDDEN_HREF, getSignInHref } from "./access";

export async function getAdminAccess() {
  const { userId } = await auth();
  if (!userId) {
    return "signed-out";
  }

  // 不缓存角色，也不信任客户端传入的 metadata 或尚未刷新的 session claims。
  const user = await clerkClient().users.getUser(userId);
  return !(user.banned || user.locked) && user.publicMetadata.role === "admin"
    ? "admin"
    : "forbidden";
}

export async function requireAdmin() {
  const access = await getAdminAccess();
  if (access === "signed-out") {
    throw redirect({ href: getSignInHref() });
  }
  if (access === "forbidden") {
    throw redirect({ href: ADMIN_FORBIDDEN_HREF });
  }
}
