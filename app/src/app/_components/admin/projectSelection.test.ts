import assert from "node:assert/strict";
import test from "node:test";

import { getNextProjectSelection } from "./projectSelection.ts";

const projects = [
  { id: "project-a", name: "Alpha" },
  { id: "project-b", name: "Beta" },
];
const lastProject = { id: "project-a", name: "Alpha" };

test("selects the first remaining project after deleting the current project", () => {
  assert.deepEqual(getNextProjectSelection(projects, "project-a"), {
    projectId: "project-b",
    projectName: "Beta",
  });
});

test("clears the current project when deleting the last project", () => {
  assert.deepEqual(getNextProjectSelection([lastProject], "project-a"), {
    projectId: "",
    projectName: "",
  });
});
