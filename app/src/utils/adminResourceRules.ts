const PROJECT_SCOPED_RESOURCES = new Set(["deployment", "active", "channel"]);
const PROTECTED_CHANNEL_NAMES = new Set(["default", "production"]);

export function isProjectScopedResource(resource: string) {
  return PROJECT_SCOPED_RESOURCES.has(resource);
}

export function applyProjectFilter(
  resource: string,
  filter: Record<string, unknown> | undefined,
  projectId: string,
) {
  if (!projectId || !isProjectScopedResource(resource)) {
    return filter ?? {};
  }

  return {
    ...(filter ?? {}),
    projectId,
  };
}

export function isProtectedChannelName(name: string | null | undefined) {
  return name ? PROTECTED_CHANNEL_NAMES.has(name) : false;
}
