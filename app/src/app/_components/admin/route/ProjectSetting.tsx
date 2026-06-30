import { api } from "@/trpc/react";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Input, Typography, useEvent } from "tushan";
import { toast } from "sonner";
import { useAdminStore } from "../useAdminStore";
import { getNextProjectSelection } from "../projectSelection";

export const ProjectSetting: React.FC = React.memo(() => {
  const { data: projects = [] } = api.project.list.useQuery();
  const projectId = useAdminStore((state) => state.projectId);
  const [name, setName] = useState("");
  const trpcUtils = api.useUtils();

  const updateMutation = api.project.update.useMutation();
  const deleteMutation = api.project.delete.useMutation();

  const currentProject = useMemo(
    () => projects.find((project) => project.id === projectId),
    [projectId, projects],
  );

  useEffect(() => {
    setName(currentProject?.name ?? "");
  }, [currentProject]);

  const handleSave = useEvent(async () => {
    if (!currentProject) {
      return;
    }

    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Project name is required");
      return;
    }

    try {
      const updated = await updateMutation.mutateAsync({
        id: currentProject.id,
        name: trimmed,
      });
      useAdminStore.setState({ projectName: updated.name ?? "" });
      await trpcUtils.project.list.invalidate();
      toast.success("Project updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  });

  const handleDelete = useEvent(async () => {
    if (!currentProject) {
      return;
    }

    if (
      !window.confirm(
        `Are you sure to delete project "${currentProject.name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id: currentProject.id });
      useAdminStore.setState(
        getNextProjectSelection(projects, currentProject.id),
      );
      await trpcUtils.project.list.invalidate();
      toast.success("Project deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  });

  if (!currentProject) {
    return (
      <div className="flex max-w-3xl flex-col gap-4 p-5">
        <Typography.Title heading={5}>Setting</Typography.Title>
        <Card>
          <Typography.Title heading={6}>No project selected</Typography.Title>
          <Typography.Paragraph type="secondary">
            Select or create a project before changing project settings.
          </Typography.Paragraph>
        </Card>
      </div>
    );
  }

  const trimmedName = name.trim();
  const isNameUnchanged = trimmedName === (currentProject.name ?? "");

  return (
    <div className="flex max-w-3xl flex-col gap-4 p-5">
      <div>
        <Typography.Title heading={5}>Setting</Typography.Title>
        <Typography.Paragraph type="secondary">
          Manage the selected project.
        </Typography.Paragraph>
      </div>

      <Card>
        <div className="flex flex-col gap-3">
          <div>
            <Typography.Title heading={6}>Project name</Typography.Title>
            <Typography.Paragraph type="secondary">
              This name is shown in the project switcher.
            </Typography.Paragraph>
          </div>

          <Input
            placeholder="Project name"
            value={name}
            onChange={(value) => setName(value)}
            onPressEnter={handleSave}
          />

          <div>
            <Button
              type="primary"
              loading={updateMutation.isPending}
              disabled={!trimmedName || isNameUnchanged}
              onClick={handleSave}
            >
              Save changes
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-3">
          <div>
            <Typography.Title heading={6}>Danger zone</Typography.Title>
            <Typography.Paragraph type="secondary">
              Deleting a project removes it from the project list.
            </Typography.Paragraph>
          </div>

          <div>
            <Button
              status="danger"
              loading={deleteMutation.isPending}
              onClick={handleDelete}
            >
              Delete project
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
});

ProjectSetting.displayName = "ProjectSetting";
