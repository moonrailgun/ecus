import { api } from "@/trpc/react";
import React, { useState } from "react";
import { Button, Input, Typography, useEvent } from "tushan";
import { toast } from "sonner";
import { closeModal } from "./AdminGlobalModal";
import { useAdminStore } from "./useAdminStore";

interface ProjectFormModalProps {
  // When provided, the modal works in edit mode.
  project?: { id: string; name: string | null };
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = React.memo(
  ({ project }) => {
    const isEdit = Boolean(project);
    const [name, setName] = useState(project?.name ?? "");
    const trpcUtils = api.useUtils();

    const createMutation = api.project.create.useMutation();
    const updateMutation = api.project.update.useMutation();

    const handleSubmit = useEvent(async () => {
      const trimmed = name.trim();
      if (!trimmed) {
        toast.error("Project name is required");
        return;
      }

      try {
        if (isEdit && project) {
          await updateMutation.mutateAsync({ id: project.id, name: trimmed });
          // Keep the switcher label in sync when editing the active project.
          if (useAdminStore.getState().projectId === project.id) {
            useAdminStore.setState({ projectName: trimmed });
          }
          toast.success("Project updated");
        } else {
          const created = await createMutation.mutateAsync({ name: trimmed });
          useAdminStore.setState({
            projectId: created.id,
            projectName: created.name ?? "",
          });
          toast.success("Project created");
        }

        await trpcUtils.project.list.invalidate();
        closeModal();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Operation failed");
      }
    });

    const loading = createMutation.isPending || updateMutation.isPending;

    return (
      <div className="flex flex-col gap-4">
        <Typography.Title heading={6}>
          {isEdit ? "Edit Project" : "Create Project"}
        </Typography.Title>

        <Input
          placeholder="Project name"
          value={name}
          onChange={(value) => setName(value)}
          onPressEnter={handleSubmit}
        />

        <div className="flex justify-end gap-2">
          <Button onClick={closeModal}>Cancel</Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            {isEdit ? "Save" : "Create"}
          </Button>
        </div>
      </div>
    );
  },
);
ProjectFormModal.displayName = "ProjectFormModal";
