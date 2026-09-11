import Link from "next/link";
import { type Metadata } from "next";

import { auth } from "@/server/auth";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "ECUS · 自托管的 Expo 更新服务",
  description:
    "ECUS 是 EAS Update 的开源替代方案，在自己的服务器上管理 Expo 热更新、多项目与发布渠道。",
};

export default async function Home() {
  const session = await auth();
  const user = session?.user;
  const userName = user?.name ?? "已登录用户";
  const adminHref = (path: string) =>
    user ? path : `/api/auth/signin?callbackUrl=${encodeURIComponent(path)}`;

  return (
    <div className={styles.page} lang="zh-CN">
      <a className="skip-link" href="#content">
        跳到主要内容
      </a>

      <header className="topnav">
        <div className="topnav-inner container">
          <Link className="logo" href="/" aria-label="ECUS 首页">
            <svg
              viewBox="0 0 114 32"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="ECUS"
            >
              <path d="M16.4383 17.7753C16.1828 18.1519 15.9031 18.1998 15.6762 18.1998C15.4493 18.1998 15.0713 18.1519 14.8157 17.7753C12.8017 15.009 9.47731 9.49838 7.02501 5.43348C5.42581 2.78258 4.19751 0.746574 3.94551 0.487474C2.99951 -0.485226 1.7021 0.120975 0.948204 1.22427C0.206004 2.31047 4.09607e-06 3.07317 4.02493e-06 3.88687C3.97648e-06 4.44107 10.7527 24.4391 11.8356 26.1037C12.877 27.7048 13.2162 28.1092 14.9986 28.1092L16.3324 28.1092C18.1095 28.1092 18.3663 27.7048 19.4078 26.1037C20.4906 24.4391 31.2434 4.44108 31.2434 3.88688C31.2434 3.07318 31.0373 2.31048 30.2951 1.22428C29.5412 0.120977 28.2438 -0.485224 27.2979 0.487476C27.0458 0.746576 25.8175 2.78258 24.2183 5.43348C21.7661 9.49838 18.4523 15.009 16.4383 17.7753Z" />
              <path d="M48.1758 22.5547V26H37.5801V22.5547H48.1758ZM39.0977 6.09375V26H34.6406V6.09375H39.0977ZM46.8086 14.1055V17.4414H37.5801V14.1055H46.8086ZM48.1895 6.09375V9.55273H37.5801V6.09375H48.1895ZM64.6066 19.3281H69.0363C68.9634 20.6953 68.5897 21.903 67.9152 22.9512C67.2499 23.9902 66.3247 24.806 65.1398 25.3984C63.9549 25.9818 62.5467 26.2734 60.9152 26.2734C59.6118 26.2734 58.4452 26.0501 57.4152 25.6035C56.3853 25.1569 55.5103 24.5189 54.7902 23.6895C54.0793 22.8509 53.5324 21.8438 53.1496 20.668C52.7759 19.4831 52.5891 18.1478 52.5891 16.6621V15.4453C52.5891 13.9596 52.785 12.6243 53.177 11.4395C53.5689 10.2546 54.1294 9.24284 54.8586 8.4043C55.5878 7.56576 56.4628 6.92318 57.4836 6.47656C58.5044 6.02995 59.6437 5.80664 60.9016 5.80664C62.5969 5.80664 64.0279 6.11198 65.1945 6.72266C66.3612 7.33333 67.2635 8.17188 67.9016 9.23828C68.5487 10.3047 68.9361 11.5215 69.0637 12.8887H64.6203C64.5839 12.1139 64.438 11.4622 64.1828 10.9336C63.9276 10.3958 63.5357 9.99023 63.007 9.7168C62.4784 9.44336 61.7766 9.30664 60.9016 9.30664C60.2635 9.30664 59.703 9.42513 59.2199 9.66211C58.746 9.89909 58.3495 10.2682 58.0305 10.7695C57.7206 11.2708 57.4882 11.9089 57.3332 12.6836C57.1783 13.4492 57.1008 14.3607 57.1008 15.418V16.6621C57.1008 17.7103 57.1691 18.6172 57.3059 19.3828C57.4426 20.1484 57.6613 20.7819 57.9621 21.2832C58.272 21.7845 58.6685 22.1582 59.1516 22.4043C59.6346 22.6504 60.2225 22.7734 60.9152 22.7734C61.7082 22.7734 62.369 22.6504 62.8977 22.4043C63.4263 22.1491 63.8319 21.7663 64.1145 21.2559C64.397 20.7454 64.5611 20.1029 64.6066 19.3281ZM85.2074 6.09375H89.6645V19.1641C89.6645 20.7135 89.3363 22.0169 88.6801 23.0742C88.0329 24.1315 87.1306 24.929 85.973 25.4668C84.8155 26.0046 83.4756 26.2734 81.9535 26.2734C80.4223 26.2734 79.0733 26.0046 77.9066 25.4668C76.7491 24.929 75.8376 24.1315 75.1723 23.0742C74.516 22.0169 74.1879 20.7135 74.1879 19.1641V6.09375H78.6586V19.1641C78.6586 20.0208 78.7862 20.7227 79.0414 21.2695C79.3057 21.8073 79.684 22.2038 80.1762 22.459C80.6684 22.7051 81.2608 22.8281 81.9535 22.8281C82.6462 22.8281 83.2341 22.7051 83.7172 22.459C84.2094 22.2038 84.5785 21.8073 84.8246 21.2695C85.0798 20.7227 85.2074 20.0208 85.2074 19.1641V6.09375ZM105.972 20.75C105.972 20.4128 105.922 20.112 105.822 19.8477C105.722 19.5742 105.539 19.3236 105.275 19.0957C105.011 18.8678 104.637 18.64 104.154 18.4121C103.671 18.1751 103.037 17.9336 102.254 17.6875C101.36 17.3958 100.508 17.0677 99.6969 16.7031C98.8948 16.3294 98.1793 15.8965 97.5504 15.4043C96.9215 14.9121 96.4247 14.3379 96.0602 13.6816C95.7047 13.0254 95.527 12.2598 95.527 11.3848C95.527 10.5371 95.7138 9.77148 96.0875 9.08789C96.4612 8.4043 96.9853 7.82096 97.6598 7.33789C98.3342 6.8457 99.1272 6.47201 100.039 6.2168C100.95 5.95247 101.953 5.82031 103.046 5.82031C104.505 5.82031 105.785 6.08008 106.888 6.59961C108 7.11003 108.866 7.83008 109.486 8.75977C110.106 9.68034 110.416 10.7513 110.416 11.9727H105.986C105.986 11.4349 105.872 10.9609 105.644 10.5508C105.425 10.1315 105.088 9.80339 104.632 9.56641C104.186 9.32943 103.625 9.21094 102.951 9.21094C102.295 9.21094 101.743 9.3112 101.296 9.51172C100.859 9.70312 100.526 9.96745 100.298 10.3047C100.08 10.6419 99.9703 11.0111 99.9703 11.4121C99.9703 11.7311 100.052 12.0228 100.216 12.2871C100.39 12.5423 100.636 12.7839 100.955 13.0117C101.283 13.2305 101.684 13.4401 102.158 13.6406C102.632 13.8411 103.174 14.0326 103.785 14.2148C104.851 14.5521 105.795 14.9258 106.615 15.3359C107.444 15.7461 108.142 16.2109 108.707 16.7305C109.272 17.25 109.696 17.8379 109.978 18.4941C110.27 19.1504 110.416 19.8932 110.416 20.7227C110.416 21.6068 110.242 22.3906 109.896 23.0742C109.559 23.7578 109.067 24.3411 108.42 24.8242C107.782 25.2982 107.016 25.6582 106.123 25.9043C105.229 26.1504 104.231 26.2734 103.129 26.2734C102.126 26.2734 101.137 26.1458 100.162 25.8906C99.1865 25.6263 98.3023 25.2253 97.5094 24.6875C96.7255 24.1497 96.0966 23.4661 95.6227 22.6367C95.1578 21.7982 94.9254 20.8047 94.9254 19.6562H99.3824C99.3824 20.2578 99.469 20.7682 99.6422 21.1875C99.8154 21.5977 100.061 21.9303 100.38 22.1855C100.709 22.4408 101.105 22.623 101.57 22.7324C102.035 22.8418 102.554 22.8965 103.129 22.8965C103.794 22.8965 104.332 22.8053 104.742 22.623C105.161 22.4316 105.471 22.1719 105.671 21.8438C105.872 21.5156 105.972 21.151 105.972 20.75Z" />
            </svg>
          </Link>
          <nav aria-label="主导航">
            <a href="#guide">快速接入</a>
            <a href="#features">特性</a>
            <a href="#migration">从 EAS 迁移</a>
            <a
              href="https://github.com/moonrailgun/ecus"
              target="_blank"
              rel="noopener"
            >
              GitHub
            </a>
          </nav>
          <div className="topnav-actions">
            {!user && (
              <Link
                className="btn btn-secondary btn-sm"
                href="/api/auth/signin?callbackUrl=%2Fadmin"
                prefetch={false}
              >
                登录
              </Link>
            )}
            {user && (
              <span className="user-chip">
                <span className="avatar" aria-hidden="true">
                  {userName.slice(0, 1).toUpperCase()}
                </span>
                <span title={userName}>{userName}</span>
              </span>
            )}
            {user && (
              <Link
                className="btn btn-secondary btn-sm"
                href={adminHref("/admin")}
              >
                打开控制台
              </Link>
            )}
            {user && (
              <Link
                className="btn btn-ghost btn-sm"
                href="/api/auth/signout"
                prefetch={false}
              >
                退出
              </Link>
            )}
          </div>
        </div>
      </header>

      <main id="content">
        <section className="section hero">
          <div className="hero-split container">
            <div>
              <p className="eyebrow">
                Expo Custom Update System · 开源 · 自托管
              </p>
              <h1>Expo 热更新，托管在你自己的服务器上</h1>
              <p className="lead">
                ECUS 是 EAS Update 的开源替代方案。沿用 expo-updates
                原有协议下发 JS
                更新，不用为每次发版排队等应用商店审核，也没有订阅费和流量费。
              </p>

              {!user && (
                <div className="hero-cta">
                  <Link
                    className="btn btn-primary"
                    href="/api/auth/signin?callbackUrl=%2Fadmin"
                    prefetch={false}
                  >
                    <svg
                      className="gh"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.1c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
                    </svg>
                    使用 GitHub 登录
                  </Link>
                  <a
                    className="btn btn-ghost btn-arrow"
                    href="https://github.com/moonrailgun/ecus"
                    target="_blank"
                    rel="noopener"
                  >
                    查看源码与部署文档
                  </a>
                </div>
              )}

              {user && (
                <div className="hero-cta">
                  <Link
                    className="btn btn-primary btn-arrow"
                    href={adminHref("/admin")}
                  >
                    打开控制台
                  </Link>
                  <Link
                    className="btn btn-ghost"
                    href="/api/auth/signout"
                    prefetch={false}
                  >
                    退出登录
                  </Link>
                </div>
              )}

              <div className="hero-facts">
                <span className="tag">MIT 协议</span>
                <span className="tag">Next.js 服务端 + CLI</span>
                <span className="tag">Docker 部署</span>
                <span className="tag">兼容 expo-updates</span>
              </div>
            </div>

            <div
              className="term"
              role="img"
              aria-label="ecus-cli 初始化并上传更新的终端示例"
            >
              <div className="term-bar">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="term-title">ecus-cli — zsh</span>
              </div>
              <pre>
                <span className="ln cmd">npm install -g ecus-cli</span>
                <span className="ln cmd">
                  ecus init --url <span className="ph">&lt;server-url&gt;</span>{" "}
                  --projectId <span className="ph">&lt;project-id&gt;</span>{" "}
                  --apikey <span className="ph">&lt;api-key&gt;</span>
                </span>
                <span className="ln ok">
                  config has been update into .ecus/config.json
                </span>
                <span className="ln cmd">ecus update --promote production</span>
                <span className="ln out">
                  Uploading to remote:{" "}
                  <span className="ph">&lt;server-url&gt;</span>
                </span>
                <span className="ln out">
                  Uploaded completed in{" "}
                  <span className="ph">&lt;duration&gt;</span>ms, deployment id:{" "}
                  <span className="ph">&lt;deployment-id&gt;</span>
                </span>
                <span className="ln cmd"> </span>
              </pre>
            </div>
          </div>
        </section>

        <section className="section" id="guide">
          <div className="stack container" style={{ gap: "48px" }}>
            <div
              className="row-between"
              style={{ alignItems: "end", flexWrap: "wrap" }}
            >
              <div style={{ maxWidth: "40ch" }}>
                <p className="eyebrow">快速接入</p>
                <h2>四步，把第一个更新推到用户手上</h2>
              </div>
              <p className="meta" style={{ margin: "0" }}>
                控制台入口需要登录 · 使用 GitHub 账号
              </p>
            </div>
            <div className="grid-4">
              <div className="step card-rule">
                <span className="step-no num">01</span>
                <h3>创建或选择项目</h3>
                <p>
                  打开控制台，用项目切换器选中项目，随后在「Setting」中管理该项目的配置。
                </p>
                <Link
                  className="btn btn-ghost btn-arrow btn-sm"
                  href={adminHref("/admin/setting")}
                >
                  项目设置
                </Link>
              </div>
              <div className="step card-rule">
                <span className="step-no num">02</span>
                <h3>准备渠道</h3>
                <p>
                  <code className="inline-code">default</code> 与{" "}
                  <code className="inline-code">production</code>{" "}
                  会自动创建；需要时再添加 staging 等额外渠道。
                </p>
                <Link
                  className="btn btn-ghost btn-arrow btn-sm"
                  href={adminHref("/admin/channel")}
                >
                  管理渠道
                </Link>
              </div>
              <div className="step card-rule">
                <span className="step-no num">03</span>
                <h3>连接 CLI</h3>
                <p>
                  复制 API Key，用选中的项目 ID 初始化 CLI，配置会写入{" "}
                  <code className="inline-code">.ecus/config.json</code>。
                </p>
                <Link
                  className="btn btn-ghost btn-arrow btn-sm"
                  href={adminHref("/admin/apikey")}
                >
                  获取 API Key
                </Link>
              </div>
              <div className="step card-rule">
                <span className="step-no num">04</span>
                <h3>上传并推送</h3>
                <p>
                  通过 CLI 上传 deployment，再在控制台把它 promote
                  到目标渠道，客户端下次启动即可拿到。
                </p>
                <Link
                  className="btn btn-ghost btn-arrow btn-sm"
                  href={adminHref("/admin/deployment")}
                >
                  查看部署
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="features">
          <div className="grid-1-2 container">
            <div className="feature-intro">
              <p className="eyebrow">为什么是 ECUS</p>
              <h2>同样的能力，放在你自己的基础设施里</h2>
              <p
                className="lead"
                style={{ marginTop: "20px", fontSize: "16px" }}
              >
                服务端是一个 Next.js 应用，CLI 是一个 npm
                包。除此之外你不需要向任何人付费。
              </p>
            </div>
            <div className="grid-2" style={{ gap: "40px 32px" }}>
              <div className="feature card-flat">
                <h3>自托管服务端</h3>
                <p>
                  基于 Next.js 构建，提供 Docker
                  部署方式。更新包、资源与部署记录都留在你自己的服务器和对象存储里。
                </p>
              </div>
              <div className="feature card-flat">
                <h3>多项目、多渠道</h3>
                <p>
                  一台服务器可托管多个应用；每个项目按 default / production /
                  staging 等渠道分别下发更新。
                </p>
              </div>
              <div className="feature card-flat">
                <h3>Git 集成</h3>
                <p>
                  上传时自动带上当前的 commit
                  message，部署历史可以直接对应回代码提交。
                </p>
              </div>
              <div className="feature card-flat">
                <h3>promote 即回滚</h3>
                <p>
                  出问题时把更早的 deployment
                  提升到目标渠道即可完成回滚，不需要像 EAS Update 那样重新构建。
                </p>
              </div>
              <div className="feature card-flat">
                <h3>没有订阅费与流量费</h3>
                <p>
                  MIT
                  协议开源。成本只有你自己的服务器与存储，更新下载量再大也不会收到账单。
                </p>
              </div>
              <div className="feature card-flat">
                <h3>登录与 API Key</h3>
                <p>
                  控制台使用 GitHub 账号登录；CLI 通过 API Key 访问服务端，Key
                  可随时在控制台重新生成。
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="migration">
          <div
            className="grid-2 container"
            style={{ alignItems: "center", gap: "clamp(40px, 6vw, 80px)" }}
          >
            <div>
              <p className="eyebrow">从 EAS Update 迁移</p>
              <h2>改一行更新地址，用户端毫无感知</h2>
              <p
                className="lead"
                style={{ marginTop: "20px", fontSize: "16px" }}
              >
                ECUS 实现了 expo-updates 的更新协议。把{" "}
                <code className="inline-code">app.json</code>{" "}
                里的更新地址指向你的服务器、重新打一次原生包，之后的 JS
                更新就全部走自己的通道。
              </p>
              <ol className="steps-list" style={{ marginTop: "28px" }}>
                <li>
                  <span className="n">1</span>
                  <span>
                    在控制台的项目页复制该项目的更新地址（Project ID
                    已包含在其中）。
                  </span>
                </li>
                <li>
                  <span className="n">2</span>
                  <span>
                    更新 <code className="inline-code">app.json</code> 中的{" "}
                    <code className="inline-code">updates.url</code>
                    ，重新构建并发布一次原生包。
                  </span>
                </li>
                <li>
                  <span className="n">3</span>
                  <span>
                    想同时保留 EAS Update？运行{" "}
                    <code className="inline-code">npx ecus-cli config</code>{" "}
                    把配置同步进 iOS / Android
                    原生工程，可按渠道分别指定更新服务器。
                  </span>
                </li>
              </ol>
            </div>
            <div className="code">
              <div className="code-head">
                <span>app.json</span>
                <span>updates.url</span>
              </div>
              <pre>
                <code>
                  {"{\n  "}
                  <span className="k">{'"expo"'}</span>
                  {": {\n    "}
                  <span className="k">{'"updates"'}</span>
                  {": {\n      "}
                  <span className="k">{'"url"'}</span>
                  {': "https://'}
                  <span className="ph">&lt;server-url&gt;</span>/api/
                  <span className="ph">&lt;project-id&gt;</span>
                  {'/manifest"\n    }\n  }\n}'}
                </code>
              </pre>
            </div>
          </div>
        </section>

        <section className="section" style={{ textAlign: "center" }}>
          <div className="container" style={{ maxWidth: "680px" }}>
            <h2>现在就部署你的第一个更新</h2>
            <p className="lead" style={{ margin: "16px auto 32px" }}>
              登录后创建项目、获取 API Key，用 CLI 上传第一份 deployment。
            </p>
            {!user && (
              <div className="hero-cta" style={{ justifyContent: "center" }}>
                <Link
                  className="btn btn-primary"
                  href="/api/auth/signin?callbackUrl=%2Fadmin"
                  prefetch={false}
                >
                  <svg
                    className="gh"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.1c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
                  </svg>
                  使用 GitHub 登录
                </Link>
              </div>
            )}
            {user && (
              <div className="hero-cta" style={{ justifyContent: "center" }}>
                <Link
                  className="btn btn-primary btn-arrow"
                  href={adminHref("/admin/deployment")}
                >
                  前往部署列表
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="pagefoot">
        <div className="row-between container">
          <span>© ECUS · MIT License</span>
          <span className="meta">
            Expo Custom Update System ·{" "}
            <a
              href="https://github.com/moonrailgun/ecus"
              target="_blank"
              rel="noopener"
            >
              github.com/moonrailgun/ecus
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
