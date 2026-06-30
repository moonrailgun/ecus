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
