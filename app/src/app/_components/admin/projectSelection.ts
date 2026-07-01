interface ProjectOption {
  id: string;
  name: string | null;
}

export function getNextProjectSelection(
  projects: ProjectOption[],
  deletedProjectId: string,
) {
  const nextProject = projects.find(
    (project) => project.id !== deletedProjectId,
  );

  return {
    projectId: nextProject?.id ?? "",
    projectName: nextProject?.name ?? "",
  };
}

export function getProjectSelection(
  projects: ProjectOption[],
  selectedProjectId: string,
) {
  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ?? projects[0];

  return {
    projectId: selectedProject?.id ?? "",
    projectName: selectedProject?.name ?? "",
  };
}
