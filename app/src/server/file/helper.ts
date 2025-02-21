export function buildDeploymentKey(projectId: string, deploymentId: string) {
  return `ecus/${projectId}/updates/${deploymentId}`;
}

export function buildDeploymentManifestPath(
  projectId: string,
  deploymentId: string,
) {
  return `ecus/${projectId}/updates/${deploymentId}/manifest.json`;
}
