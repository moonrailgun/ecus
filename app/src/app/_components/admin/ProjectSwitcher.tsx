import { api } from "@/trpc/react";
import React from "react";
import { Button, Divider, Select, useEvent, useWatch } from "tushan";
import { IconPlus } from "tushan/icon";
import { useAdminStore } from "./useAdminStore";
import { openModal } from "./AdminGlobalModal";
import { ProjectFormModal } from "./ProjectFormModal";
import { getProjectSelection } from "./projectSelection";

export const ProjectSwitcher: React.FC = React.memo(() => {
  const { data: projects = [], isFetched } = api.project.list.useQuery();
  const projectId = useAdminStore((state) => state.projectId);
  const projectName = useAdminStore((state) => state.projectName);

  useWatch([isFetched, projectId, projectName, projects], () => {
    if (!isFetched) {
      return;
    }

    const nextSelection = getProjectSelection(projects, projectId);

    if (
      nextSelection.projectId !== projectId ||
      nextSelection.projectName !== projectName
    ) {
      useAdminStore.setState(nextSelection);
    }
  });

  const handleCreate = useEvent(() => {
    openModal(<ProjectFormModal />);
  });

  return (
    <div className="flex items-center">
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
        dropdownRender={(menu) => (
          <div>
            {menu}
            <Divider style={{ margin: "4px 0" }} />
            <div className="px-2 pb-1">
              <Button
                long={true}
                type="text"
                icon={<IconPlus />}
                onClick={handleCreate}
              >
                Create Project
              </Button>
            </div>
          </div>
        )}
      >
        {projects.map((p) => (
          <Select.Option key={p.id} value={p.id}>
            {p.name}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
});
ProjectSwitcher.displayName = "ProjectSwitcher";
