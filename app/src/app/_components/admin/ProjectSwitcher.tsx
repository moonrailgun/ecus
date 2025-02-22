import { api } from "@/trpc/react";
import React from "react";
import { Select, useWatch } from "tushan";
import { useAdminStore } from "./useAdminStore";

export const ProjectSwitcher: React.FC = React.memo(() => {
  const { data: projects = [] } = api.project.list.useQuery();
  const projectId = useAdminStore((state) => state.projectId);

  useWatch([projectId, projects], () => {
    if (projects.length > 0 && projects[0] && !projectId) {
      useAdminStore.setState({
        projectId: projects[0].id,
        projectName: projects[0].name ?? "",
      });
    }
  });

  return (
    <Select
      placeholder="Select Project"
      style={{ width: 154 }}
      value={projectId}
      onChange={(value) =>
        useAdminStore.setState({
          projectId: value,
          projectName: projects.find((p) => p.id === value)?.name ?? "",
        })
      }
    >
      {projects.map((p) => (
        <Select.Option key={p.id} value={p.id}>
          {p.name}
        </Select.Option>
      ))}
    </Select>
  );
});
ProjectSwitcher.displayName = "ProjectSwitcher";
