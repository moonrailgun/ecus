import { api } from "@/trpc/react";
import React from "react";
import { Button, Divider, Select, useEvent, useWatch } from "tushan";
import { IconPlus } from "tushan/icon";
import { useAdminStore } from "./useAdminStore";
import { openModal } from "./AdminGlobalModal";
import { ProjectFormModal } from "./ProjectFormModal";

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
