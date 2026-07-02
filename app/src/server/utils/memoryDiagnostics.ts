type MemoryUsageReader = () => NodeJS.MemoryUsage;
type UptimeReader = () => number;
type MemoryLogger = (message: string, payload: Record<string, unknown>) => void;

interface MemoryDiagnosticsOptions {
  memoryUsage?: MemoryUsageReader;
  uptime?: UptimeReader;
  pid?: number;
}

interface LogMemoryOptions extends MemoryDiagnosticsOptions {
  logger?: MemoryLogger;
}

export interface MemoryUsageSnapshot {
  pid: number;
  uptimeSeconds: number;
  rssMb: number;
  heapTotalMb: number;
  heapUsedMb: number;
  externalMb: number;
  arrayBuffersMb: number;
}

function toMegabytes(bytes: number) {
  return Math.round(bytes / 1024 / 1024);
}

export function getMemoryUsageSnapshot(
  options: MemoryDiagnosticsOptions = {},
): MemoryUsageSnapshot {
  const memoryUsage = options.memoryUsage ?? process.memoryUsage;
  const uptime = options.uptime ?? process.uptime;
  const usage = memoryUsage();

  return {
    pid: options.pid ?? process.pid,
    uptimeSeconds: Math.round(uptime()),
    rssMb: toMegabytes(usage.rss),
    heapTotalMb: toMegabytes(usage.heapTotal),
    heapUsedMb: toMegabytes(usage.heapUsed),
    externalMb: toMegabytes(usage.external),
    arrayBuffersMb: toMegabytes(usage.arrayBuffers),
  };
}

export function logMemoryUsage(
  tag: string,
  metadata: Record<string, unknown> = {},
  options: LogMemoryOptions = {},
) {
  const logger = options.logger ?? console.warn;

  logger("[MEMORY]", {
    tag,
    ...getMemoryUsageSnapshot(options),
    ...metadata,
  });
}
