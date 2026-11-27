import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "隐私政策 · Cyber Shot" },
      {
        content:
          "了解 Cyber Shot 如何处理账号、Google 登录信息、访问日志和素材，以及如何联系我们管理或删除个人信息。",
        name: "description",
      },
      { content: "隐私政策 · Cyber Shot", property: "og:title" },
    ],
    links: [
      { href: "https://cyber-shot.tuntun.site/privacy", rel: "canonical" },
    ],
  }),
});

function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-10 space-y-3">
          <p className="text-muted-foreground text-sm">Cyber Shot</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            隐私政策
          </h1>
          <p className="text-muted-foreground text-sm">
            最后更新：<time dateTime="2026-11-27">2026 年 11 月 27 日</time>
          </p>
        </header>
        <article className="text-muted-foreground [&_h2]:text-foreground space-y-8 text-sm leading-7 sm:text-base [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:pl-1 [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          <p>
            本政策适用于 Cyber Shot（cyber-shot.tuntun.site）
            人物写真素材库，说明本站在提供素材浏览、提示词复制、参考图下载和账号功能时如何处理个人信息。
            本站由 Cyber Shot 运营者提供服务，隐私相关问题请联系{" "}
            <a href="mailto:tun.nozomi@gmail.com">tun.nozomi@gmail.com</a>。
          </p>

          <section aria-labelledby="privacy-data">
            <h2 id="privacy-data">1. 我们处理哪些信息</h2>
            <ul>
              <li>
                账号和登录信息：当你注册或登录时，身份认证服务 Clerk
                会处理邮箱、姓名或昵称、头像、账号标识，以及登录会话和安全验证信息。
                本站使用账号标识及权限信息识别用户、显示账号状态和控制后台访问。
              </li>
              <li>
                访问和安全信息：提供网站和身份认证服务时，托管及认证服务商可能处理
                IP 地址、浏览器和设备信息、请求时间、访问路径及错误或安全日志，
                用于响应请求、排查故障和防止滥用。
              </li>
              <li>
                素材和联系内容：有后台权限的用户可上传图片、填写素材名称、标签和提示词。
                发布后的素材可被网站访客查看或下载。你通过邮件联系我们时，
                我们会处理你的邮箱和你主动提供的内容，以回复和处理请求。
              </li>
            </ul>
            <p>
              浏览公开素材、复制提示词和下载参考图无需登录。请勿在公开素材或联系邮件中提交不必要的个人信息。
            </p>
          </section>

          <section aria-labelledby="privacy-google">
            <h2 id="privacy-google">2. Google 登录信息的使用</h2>
            <p>
              选择 Google 登录后，Google 会按照授权流程向 Clerk
              提供账号标识、邮箱及基本个人资料（如姓名和头像），用于创建或关联本站账号、
              完成身份验证和维持登录状态。本站不会获得你的 Google 密码。 当前
              Google 登录仅请求基本身份信息，不请求读取 Gmail 邮件、 Google
              Drive 文件或通讯录的权限。
            </p>
            <p>
              Google 登录信息仅用于账号、身份验证及相关安全功能，
              不用于广告定向，不出售，也不用于训练通用人工智能或机器学习模型。
              对 Google 用户数据的使用和转移遵守{" "}
              <a href="https://developers.google.com/terms/api-services-user-data-policy">
                Google API 服务用户数据政策
              </a>
              ，包括其限制使用要求。
            </p>
          </section>

          <section aria-labelledby="privacy-storage">
            <h2 id="privacy-storage">3. Cookie 和浏览器存储</h2>
            <p>
              Clerk 使用 Cookie 等技术保存登录会话、完成认证并保护账号安全。
              网站也会在浏览器本地存储中保存浅色或深色主题偏好。
              你可以通过浏览器设置清除或限制这些数据，但这可能使你退出登录或重置偏好设置。
            </p>
          </section>

          <section aria-labelledby="privacy-providers">
            <h2 id="privacy-providers">4. 第三方服务与数据处理</h2>
            <p>为提供本站功能，我们使用以下服务：</p>
            <ul>
              <li>
                Clerk：账号管理、登录会话和身份验证。详情见{" "}
                <a href="https://clerk.com/legal/privacy-policy">
                  Clerk 隐私政策
                </a>
                。
              </li>
              <li>
                Google：在你选择 Google 登录时提供身份验证；网站还使用 Google
                Fonts 加载字体，加载时会向 Google
                发送网络请求及相关技术信息。详情见{" "}
                <a href="https://policies.google.com/privacy">
                  Google 隐私政策
                </a>
                。
              </li>
              <li>
                Cloudflare：网站托管、网络分发、安全与日志，以及素材数据库和图片存储。
                详情见{" "}
                <a href="https://www.cloudflare.com/privacypolicy/">
                  Cloudflare 隐私政策
                </a>
                。
              </li>
            </ul>
            <p>
              这些服务可能在你所在国家或地区以外处理数据。
              我们仅为提供服务、维护安全或履行适用法律义务而处理和披露必要信息。
            </p>
          </section>

          <section aria-labelledby="privacy-retention">
            <h2 id="privacy-retention">5. 保存与安全</h2>
            <p>
              账号信息在账号存续期间用于提供服务。删除账号时，
              我们会处理相关个人信息的删除请求；安全日志、备份或依法需要保留的信息，
              可能按照服务商的保留机制及适用法律继续保存一段时间。
              联系邮件仅在处理请求及必要后续事务的期间保留。
            </p>
            <p>
              本站使用 HTTPS、服务端身份验证和后台权限控制等措施保护信息，
              但任何网络传输或存储方式都无法保证绝对安全。
              后台发布的公开素材可能已被他人下载，删除账号并不自动撤回这些副本。
            </p>
          </section>

          <section aria-labelledby="privacy-rights">
            <h2 id="privacy-rights">6. 查看、更正、撤销授权与删除</h2>
            <p>
              你可以通过账号设置查看或更正可编辑的账号资料，也可以联系{" "}
              <a href="mailto:tun.nozomi@gmail.com">tun.nozomi@gmail.com</a>{" "}
              请求访问、更正或删除个人信息及账号。
              请注明与本站账号关联的邮箱和具体请求；为保护账号安全，
              我们可能要求你完成必要的身份验证，但不会要求你提供密码。
            </p>
            <p>
              你也可以在{" "}
              <a href="https://myaccount.google.com/connections">
                Google 账号的第三方连接设置
              </a>
              中撤销对本站的授权。撤销授权不等同于删除本站已有账号；
              如需一并删除，请通过上述邮箱联系我们。
            </p>
          </section>

          <section aria-labelledby="privacy-updates">
            <h2 id="privacy-updates">7. 政策更新</h2>
            <p>
              当功能、数据处理方式或适用要求变化时，我们会更新本页面和最后更新日期。
              涉及个人信息处理的重要变更，我们会通过网站提示或其他适当方式告知，
              并在需要时重新征求同意。
            </p>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
