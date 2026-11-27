import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  ADMIN_FORBIDDEN_HREF,
  getAdminReturnTo,
  getSignInHref,
} from "./access";

const session = {
  sessionClaims: { metadata: { role: "admin" } },
  userId: null as string | null,
};
const user = {
  banned: false,
  locked: false,
  publicMetadata: {} as Record<string, unknown>,
  unsafeMetadata: { role: "admin" },
};
const getUser = mock(async (_userId: string) => user);

mock.module("@clerk/tanstack-react-start/server", () => ({
  auth: async () => session,
  clerkClient: () => ({ users: { getUser } }),
}));

const { getAdminAccess, requireAdmin } = await import("./auth.server");

beforeEach(() => {
  session.userId = null;
  user.banned = false;
  user.locked = false;
  user.publicMetadata = {};
  getUser.mockReset();
  getUser.mockImplementation(async () => user);
});

describe("后台服务端鉴权", () => {
  test("未登录时拒绝访问，不查询用户或信任客户端角色", async () => {
    expect(await getAdminAccess()).toBe("signed-out");
    await expect(requireAdmin()).rejects.toMatchObject({
      options: { href: getSignInHref() },
    });
    expect(getUser).not.toHaveBeenCalled();
  });

  test("普通用户即使令牌或 unsafeMetadata 中含 admin 也不能进入后台", async () => {
    session.userId = "user_regular";
    expect(await getAdminAccess()).toBe("forbidden");
    await expect(requireAdmin()).rejects.toMatchObject({
      options: { href: ADMIN_FORBIDDEN_HREF },
    });
    expect(getUser).toHaveBeenCalledWith("user_regular");
  });

  test("只有当前 publicMetadata 中的 admin 角色被允许", async () => {
    session.userId = "user_admin";
    user.publicMetadata = { role: "admin" };
    await expect(requireAdmin()).resolves.toBeUndefined();
  });

  test.each(["editor", "Admin", "", null, ["admin"]].map((role) => ({ role })))(
    "其他角色值 %j 不授予管理员权限",
    async ({ role }) => {
      session.userId = "user_regular";
      user.publicMetadata = { role };
      expect(await getAdminAccess()).toBe("forbidden");
    }
  );

  test("同一会话撤销角色后，下次检查立即拒绝", async () => {
    session.userId = "user_admin";
    user.publicMetadata = { role: "admin" };
    await expect(requireAdmin()).resolves.toBeUndefined();
    user.publicMetadata = {};
    await expect(requireAdmin()).rejects.toMatchObject({
      options: { href: ADMIN_FORBIDDEN_HREF },
    });
    expect(getUser).toHaveBeenCalledTimes(2);
  });

  test("被封禁或锁定的管理员不能继续操作", async () => {
    session.userId = "user_admin";
    user.publicMetadata = { role: "admin" };
    user.banned = true;
    expect(await getAdminAccess()).toBe("forbidden");
    user.banned = false;
    user.locked = true;
    expect(await getAdminAccess()).toBe("forbidden");
  });

  test("Clerk 查询失败时不会沿用令牌中的管理员角色放行", async () => {
    session.userId = "user_admin";
    getUser.mockRejectedValueOnce(new Error("Clerk unavailable"));
    await expect(requireAdmin()).rejects.toThrow("Clerk unavailable");
  });
});

describe("登录回跳", () => {
  test("保留后台路径、筛选参数与锚点", () => {
    const returnTo = "/admin/pose/12?q=standing#preview";
    expect(getAdminReturnTo(returnTo)).toBe(returnTo);
    expect(
      new URL(getSignInHref(returnTo), "https://app.invalid").searchParams.get(
        "redirect_url"
      )
    ).toBe(returnTo);
  });

  test("外部地址、路径伪装与登录循环一律回退到后台首页", () => {
    for (const value of [
      undefined,
      ["https://example.com"],
      "https://example.com/admin",
      "//example.com/admin",
      "/\\example.com/admin",
      "/admin/../../sign-in",
      "/administrator",
      "/sign-in",
      "/",
    ]) {
      expect(getAdminReturnTo(value)).toBe("/admin");
    }
  });
});
