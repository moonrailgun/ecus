import assert from "node:assert/strict";
import test from "node:test";

import { getMemoryUsageSnapshot, logMemoryUsage } from "./memoryDiagnostics.ts";

void test("formats process memory usage as rounded megabytes", () => {
  const snapshot = getMemoryUsageSnapshot({
    memoryUsage: () => ({
      rss: 33.6 * 1024 * 1024,
      heapTotal: 20.1 * 1024 * 1024,
      heapUsed: 12.4 * 1024 * 1024,
      external: 5.5 * 1024 * 1024,
      arrayBuffers: 2.2 * 1024 * 1024,
    }),
    pid: 123,
    uptime: () => 45.6,
  });

  assert.deepEqual(snapshot, {
    pid: 123,
    uptimeSeconds: 46,
    rssMb: 34,
    heapTotalMb: 20,
    heapUsedMb: 12,
    externalMb: 6,
    arrayBuffersMb: 2,
  });
});

void test("logs memory diagnostics with a tag and request metadata", () => {
  const logs: unknown[][] = [];

  logMemoryUsage(
    "upload.put.buffered",
    {
      requestId: "req-1",
      zipBytes: 1024,
    },
    {
      memoryUsage: () => ({
        rss: 10 * 1024 * 1024,
        heapTotal: 8 * 1024 * 1024,
        heapUsed: 4 * 1024 * 1024,
        external: 3 * 1024 * 1024,
        arrayBuffers: 2 * 1024 * 1024,
      }),
      pid: 456,
      uptime: () => 12.2,
      logger: (...args) => logs.push(args),
    },
  );

  assert.deepEqual(logs, [
    [
      "[MEMORY]",
      {
        tag: "upload.put.buffered",
        pid: 456,
        uptimeSeconds: 12,
        rssMb: 10,
        heapTotalMb: 8,
        heapUsedMb: 4,
        externalMb: 3,
        arrayBuffersMb: 2,
        requestId: "req-1",
        zipBytes: 1024,
      },
    ],
  ]);
});
