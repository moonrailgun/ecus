import assert from "node:assert/strict";
import test from "node:test";

import {
  getNextProjectSelection,
  getProjectSelection,
} from "./projectSelection.ts";

const projects = [
  { id: "project-a", name: "Alpha" },
  { id: "project-b", name: "Beta" },
];
const lastProject = { id: "project-a", name: "Alpha" };

void test("selects the first remaining project after deleting the current project", () => {
  assert.deepEqual(getNextProjectSelection(projects, "project-a"), {
    projectId: "project-b",
    projectName: "Beta",
  });
});

void test("clears the current project when deleting the last project", () => {
  assert.deepEqual(getNextProjectSelection([lastProject], "project-a"), {
    projectId: "",
    projectName: "",
  });
});

void test("keeps the persisted project when it still exists", () => {
  assert.deepEqual(getProjectSelection(projects, "project-b"), {
    projectId: "project-b",
    projectName: "Beta",
  });
});

void test("falls back to the first project when persisted project is missing", () => {
  assert.deepEqual(getProjectSelection(projects, "missing-project"), {
    projectId: "project-a",
    projectName: "Alpha",
  });
});
