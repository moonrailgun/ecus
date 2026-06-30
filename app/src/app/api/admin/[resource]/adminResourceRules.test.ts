import assert from "node:assert/strict";
import test from "node:test";

import {
  applyProjectFilter,
  isProjectScopedResource,
  isProtectedChannelName,
} from "../../../../utils/adminResourceRules.ts";

void test("treats channel queries as project scoped", () => {
  assert.equal(isProjectScopedResource("deployment"), true);
  assert.equal(isProjectScopedResource("active"), true);
  assert.equal(isProjectScopedResource("channel"), true);
  assert.equal(isProjectScopedResource("user"), false);
});

void test("protects default project channels from deletion", () => {
  assert.equal(isProtectedChannelName("default"), true);
  assert.equal(isProtectedChannelName("production"), true);
  assert.equal(isProtectedChannelName("staging"), false);
  assert.equal(isProtectedChannelName(null), false);
});

void test("overrides stale project filters for project scoped resources", () => {
  assert.deepEqual(
    applyProjectFilter("channel", { projectId: "old", q: "prod" }, "current"),
    { projectId: "current", q: "prod" },
  );
});

void test("leaves unscoped resources untouched", () => {
  assert.deepEqual(
    applyProjectFilter("user", { projectId: "old" }, "current"),
    {
      projectId: "old",
    },
  );
});
