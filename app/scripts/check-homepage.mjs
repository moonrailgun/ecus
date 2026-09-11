import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = process.env.BASE_URL ?? "http://localhost:5433";

test("homepage renders the design and preserves login destinations", async () => {
  const response = await fetch(baseUrl);
  assert.equal(response.status, 200);
  const html = (await response.text()).replace(
    /<script\b[^>]*>[\s\S]*?<\/script>/g,
    "",
  );

  assert.match(html, /Expo 热更新，托管在你自己的服务器上/);
  assert.match(html, /使用 GitHub 登录/);
  assert.doesNotMatch(html, /退出登录|moonrailgun<\/span>/);
  for (const id of ["guide", "features", "migration"]) {
    assert.ok(html.includes(`id="${id}"`), `Missing section: ${id}`);
    assert.ok(html.includes(`href="#${id}"`), `Missing navigation: ${id}`);
  }
  for (const route of ["setting", "channel", "apikey", "deployment"]) {
    const destination = encodeURIComponent(`/admin/${route}`);
    assert.ok(
      html.includes(`href="/api/auth/signin?callbackUrl=${destination}"`),
      `Missing login destination: ${route}`,
    );
  }
  assert.match(html, /ecus update --promote production/);
  assert.match(html, /&lt;project-id&gt;/);
});
